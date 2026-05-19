import { TaskStatus } from '../pages/Dashboard';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: null,
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const nextStatus = STATUS_NEXT[task.status];

  return (
    <div className={`task-card task-card--${task.status.toLowerCase()}`} data-testid="task-card">
      <div className="task-card__header">
        <span className={`status-badge status-badge--${task.status.toLowerCase()}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <button
          className="btn-icon btn-icon--danger"
          onClick={() => onDelete(task.id)}
          title="Delete task"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
      <h3 className="task-card__title">{task.title}</h3>
      {task.description && (
        <p className="task-card__desc">{task.description}</p>
      )}
      <div className="task-card__footer">
        <span className="task-card__date">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        {nextStatus && (
          <button
            className="btn-advance"
            onClick={() => onStatusChange(task.id, nextStatus)}
          >
            → {STATUS_LABELS[nextStatus]}
          </button>
        )}
      </div>
    </div>
  );
}
