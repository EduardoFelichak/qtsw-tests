import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/auth.service';
import { prisma } from '../../utils/prisma';
import { faker } from '@faker-js/faker';
import { InvalidCredentialsError } from '../../errors/auth/InvalidCredentialsError';
import { UserAlreadyRegisteredError } from '../../errors/auth/UserAlreadyRegisteredError';
import { UserNotFoundError } from '../../errors/auth/UserNotFoundError';
import { InvalidTokenError } from '../../errors/auth/InvalidTokenError';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

describe('AuthService', () => {
    const mockUser = {
        id: 1,
        email: 'usuario@exemplo.teste',
        name: 'Usuário Exemplo',
        createdAt: new Date(),
    };
    const password = 'senha';
    const hashedPassword = 'senha-criptografada';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('deve cadastrar um novo usuário e retornar o seu token', async () => {
            // Arrange (preparar)
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                ...mockUser,
                password: hashedPassword,
            });
            (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

            // Act (agir)
            const result = await AuthService.registerUser(mockUser.email, password, mockUser.name);

            // Assert (verificar)
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockUser.email },
            });
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: mockUser.email,
                    password: hashedPassword,
                    name: mockUser.name,
                },
            });
            expect(result.token).toBe('mockedToken');
            expect(result.user).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
            });
        });

        it('deve lançar o erro UserAlreadyRegisteredError se o e-mail já estiver em uso', async () => {
            // Arrange (preparar)
            const newUserPayload = {
                name: faker.person.fullName(),
                email: 'email.existente@test.com',
                password: faker.internet.password(),
            };

            const mockExistingUser = { id: faker.string.uuid(), ...newUserPayload };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);

            // Act (agir) & Assert (verificar)
            await expect(AuthService.registerUser(newUserPayload.email, newUserPayload.password, newUserPayload.name)).rejects.toThrow(
                UserAlreadyRegisteredError
            );
        });
    });

    describe('loginUser', () => {
        it('deve realizar o login do usuário e retornar o seu token', async () => {
            // Arrange (preparar)
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

            // Act (agir)
            const result = await AuthService.loginUser(mockUser.email, password);

            // Assert (verificar)
            expect(result.token).toBe('mockedToken');
            expect(result.user).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
            });
        });

        it('deve lançar o erro InvalidCredentialsError para um usuário não existente', async () => {
            // Arrange (preparar)
            const fakeEmail = faker.internet.email();
            const fakePass = faker.internet.password();
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        
            // Act (agir) & Assert (verificar)
            await expect(AuthService.loginUser(fakeEmail, fakePass)).rejects.toThrow(
                InvalidCredentialsError
            );
        });

        it('deve lançar o erro InvalidCredentialsError para um usuário existente com a senha incorreta', async () => {
            // Arrange (preparar)
            const emailFornecido = faker.internet.email();
            const senhaIncorreta = 'senhaIncorreta456';
        
            const mockUserDoBanco = {
                id: faker.string.uuid(),
                email: emailFornecido,
                name: faker.person.fullName(),
                password: 'senhaHasheadaNoBanco', 
            };
        
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserDoBanco);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        
            // Act (agir) & Assert (verificar)
            await expect(AuthService.loginUser(emailFornecido, senhaIncorreta)).rejects.toThrow(
                InvalidCredentialsError
            );
        });
    });

    describe('getUserById', () => {
        it('deve retornar o usuário com base no seu identificador', async () => {
            // Arrange (preparar)
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            // Act (agir)
            const user = await AuthService.getUserById(1);

            // Assert (verificar)
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                select: { id: true, email: true, name: true, createdAt: true },
            });
            expect(user).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                createdAt: mockUser.createdAt,
            });
        });

        it('deve lançar o erro UserNotFoundError caso o usuário não seja encontrado', async () => {
            // Arrange (preparar)
            const idInexistente = 999;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
            // Act (agir) & Assert (verificar)
            await expect(AuthService.getUserById(idInexistente)).rejects.toThrow(
                UserNotFoundError
            );
        });
    });

    describe('getUserFromTokenPayload', () => {
        it('deve retornar dados do usuário com base no identificador retornado pelo token', async () => {
            // Arrange (preparar)
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            // Act (agir)
            const user = await AuthService.getUserFromTokenPayload(1);

            // Assert (verificar)
            expect(user).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                createdAt: mockUser.createdAt,
            });
        });
    });

    describe('refreshToken', () => {
        it('deve retornar um token novo ao atualizar token se o token antigo for válido', () => {
            // Arrange (preparar)
            (jwt.verify as jest.Mock).mockReturnValue({ userId: 1 });
            (jwt.sign as jest.Mock).mockReturnValue('tokenNovo');

            // Act (agir)
            const newToken = AuthService.refreshToken('tokenAntigo');

            // Assert (verificar)
            expect(newToken).toBe('tokenNovo');
        });

        it('deve lançar o erro InvalidTokenError caso o token antigo seja inválido ou malformado', () => {
            // Arrange (preparar)
            const tokenInvalido = 'um.token.qualquer.invalido';
            const erroDeVerificacao = new Error('JWT malformed');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw erroDeVerificacao;
            });
        
            // Act (agir) & Assert (verificar) 
            expect(() => {
                AuthService.refreshToken(tokenInvalido);
            }).toThrow(InvalidTokenError);
        });
    });


});
