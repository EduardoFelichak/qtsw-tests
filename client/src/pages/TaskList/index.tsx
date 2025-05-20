import { ClipboardList, AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../api/index';
import { Task } from '../../api/types';
import { TaskCard } from '../../components/TaskCard';
import { useAuth } from '../../context/AuthContext';

export const TaskList = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchTasks = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await get(token);
            setTasks(data);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            setError('Não foi possível carregar as tarefas.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-68px)] bg-slate-900 text-white">
                <span className="text-lg animate-pulse">Carregando tarefas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] bg-slate-900 text-white px-4 text-center">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <p className="text-lg font-medium mb-2">{error}</p>
                <button
                    onClick={fetchTasks}
                    className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition mt-2"
                >
                    <RotateCcw size={18} /> Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-slate-900 text-white px-6 py-8">
            <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <ClipboardList size={28} /> Minhas Tarefas
                </h2>
                <Link
                    to="/tasks/create"
                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition"
                >
                    Criar Tarefa
                </Link>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {tasks.length === 0 ? (
                    <p className="text-center text-slate-400 text-lg">
                        Nenhuma tarefa encontrada. Crie sua primeira tarefa!
                    </p>
                ) : (
                    tasks.map((task) => <TaskCard task={task} key={task.id} />)
                )}
            </div>
        </div>
    );
};
