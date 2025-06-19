import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';
import { setupTestDB, disconnectTestDB } from '../setup.test.db';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe('AuthController', () => {
    describe('POST /api/auth/register', () => {
        it('deve registrar usuário com dados válidos', async () => {
            // Arrange (preparar)
            const userData = {
                email: 'usuario@valido.teste',
                password: 'senha',
                name: 'Usuário Válido',
            };

            // Act (agir)
            const response = await request(app).post('/api/auth/register').send(userData);

            // Assert (verificar)
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toMatchObject({
                user: {
                    id: expect.any(Number),
                    email: userData.email,
                    name: userData.name,
                },
                token: expect.any(String),
            });

            const userInDB = await prisma.user.findUnique({ where: { email: userData.email } });
            expect(userInDB).not.toBeNull();
            expect(userInDB?.email).toBe(userData.email);
            expect(userInDB?.password).not.toBe(userData.password);
        });

        it('deve retornar erro ao tentar registrar com um e-mail que já existe', async () => {
            // Arrange (preparar)
            const existingUser = {
                email: 'existente@teste.com',
                password: 'outrasenha',
                name: 'Usuário Existente',
            };
            await prisma.user.create({
                data: existingUser,
            });

            const newUserData = {
                email: 'existente@teste.com', 
                password: 'novasenha',
                name: 'Novo Usuário',
            };

            // Act (agir)
            const response = await request(app).post('/api/auth/register').send(newUserData);

            // Assert (verificar)
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body).toEqual({
                message: 'Usuário já cadastrado',
            });
        });
    });
});
