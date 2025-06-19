/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock do middleware de autenticação para simular a autenticação durante o teste
jest.mock('../../middlewares/auth.middleware', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.userId = testUser.id ?? 1;
        next();
    },
}));

import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';
import { setupTestDB, disconnectTestDB, testUser } from '../setup.test.db';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe('TaskController', () => {
    describe('POST /api/tasks', () => {
        it('deve criar tarefa com dados válidos', async () => {
            // Arrange (preparar)
            const taskData = {
                title: `Tarefa válida ${new Date()}`,
                description: 'Essa é uma tarefa válida',
                completed: false,
                priority: 'low',
            };

            // Act (agir)
            const response = await request(app).post('/api/tasks').send(taskData);

            // Assert (verificar)
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.body).toEqual({
                ...taskData,
                id: expect.any(Number),
                userId: 1,
                dueDate: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const taskInDB = await prisma.task.findFirst({ where: { title: taskData.title } });
            expect(taskInDB).toEqual(
                expect.objectContaining({
                    ...taskData,
                    id: expect.any(Number),
                    userId: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                }),
            );
        });
    });

    describe('GET /api/tasks/:id', () => {
        it('deve retornar uma tarefa específica pelo seu ID', async () => {
            // Arrange (preparar)
            const createdTask = await prisma.task.create({
                data: {
                    title: `Tarefa para buscar por ID ${new Date().toISOString()}`,
                    description: 'Descrição da tarefa a ser buscada.',
                    completed: false,
                    priority: 'medium',
                    userId: testUser.id ?? 1,
                },
            });

            // Act (agir)
            const response = await request(app).get(`/api/tasks/${createdTask.id}`);

            // Assert (verificar)
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.body).toEqual({
                id: createdTask.id,
                title: createdTask.title,
                description: createdTask.description,
                completed: createdTask.completed,
                priority: createdTask.priority,
                userId: createdTask.userId,
                dueDate: null, 
                createdAt: createdTask.createdAt.toISOString(),
                updatedAt: createdTask.updatedAt.toISOString(),
            });
        });
    });
});
