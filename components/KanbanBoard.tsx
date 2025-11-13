import React from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';

interface KanbanColumnProps {
    title: string;
    children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, children }) => (
    <div className="bg-gray-100 rounded-lg p-3 flex-1">
        <h3 className="font-bold text-gray-700 mb-4 px-1">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

interface TaskCardProps {
    task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-semibold text-sm">{task.title}</p>
        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
    </div>
);

interface KanbanBoardProps {
    tasks: Task[];
    // onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
    const columns = {
        // FIX: Replaced TaskStatus.ToDo with TaskStatus.Pending as 'ToDo' does not exist in the enum.
        [TaskStatus.Pending]: tasks.filter(t => t.status === TaskStatus.Pending),
        [TaskStatus.InProgress]: tasks.filter(t => t.status === TaskStatus.InProgress),
        [TaskStatus.Done]: tasks.filter(t => t.status === TaskStatus.Done),
    };

    return (
        <div className="flex gap-4 p-4 bg-surface rounded-lg">
            {Object.entries(columns).map(([status, tasksInColumn]) => (
                <KanbanColumn key={status} title={status}>
                    {tasksInColumn.map(task => <TaskCard key={task.id} task={task} />)}
                </KanbanColumn>
            ))}
        </div>
    );
};
