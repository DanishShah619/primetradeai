import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { TaskCard } from '../components/TaskCard';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, clear } = useAuthStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [page, setPage] = useState(1);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, limit: 9 };
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/tasks', { params });
      setTasks(data.data);
      setMeta(data.meta);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/tasks', {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setTasks((prev) => [data.data, ...prev]);
      setNewTitle('');
      setNewDesc('');
    } catch {
      setError('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      const { data } = await api.patch(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? data.data : t)));
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      clear();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__left">
          <span className="logo-icon">⚡</span>
          <span className="dashboard-title">PrimeTrade</span>
        </div>
        <div className="dashboard-header__right">
          <span className="user-badge">
            <span className={`role-pill role-pill--${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
            {user?.name}
          </span>
          <button id="logout-btn" className="btn-outline" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Create Task */}
        <section className="create-section">
          <h2>New Task</h2>
          <form onSubmit={handleCreate} className="create-form">
            <input
              id="task-title-input"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title…"
              required
              className="create-input"
            />
            <input
              id="task-desc-input"
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="create-input"
            />
            <button
              id="create-task-btn"
              type="submit"
              className="btn-primary"
              disabled={creating}
            >
              {creating ? <span className="spinner" /> : '+ Add Task'}
            </button>
          </form>
        </section>

        {/* Filter */}
        <section className="filter-section">
          <div className="filter-tabs">
            {(['', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
              <button
                key={s}
                className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
                onClick={() => { setFilterStatus(s); setPage(1); }}
              >
                {s === '' ? 'All' : s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
              </button>
            ))}
          </div>
          {meta && (
            <span className="task-count">{meta.total} task{meta.total !== 1 ? 's' : ''}</span>
          )}
        </section>

        {/* Error */}
        {error && <div className="error-banner" role="alert">{error}</div>}

        {/* Task Grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="task-skeleton" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <p>No tasks yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn-outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">
              {page} / {meta.totalPages}
            </span>
            <button
              className="btn-outline"
              disabled={page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
