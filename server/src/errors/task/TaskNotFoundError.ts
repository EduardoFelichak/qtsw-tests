export class TaskNotFoundError extends Error {
    constructor(message?: string) {
        super(message ?? 'Tarefa não encontrada');
        this.name = 'TaskNotFoundError';
    }
}
