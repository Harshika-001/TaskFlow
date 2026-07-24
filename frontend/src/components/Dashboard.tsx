import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Plus, CheckCircle, Circle, Trash2, Calendar, 
  AlertTriangle, Filter, Search, Loader2, Sparkles, Edit2, X, Save 
} from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating todo
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('');

  // Editing state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [editDueDate, setEditDueDate] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [sortBy, setSortBy] = useState<'CREATED' | 'DUE_DATE' | 'PRIORITY'>('CREATED');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (err: any) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitLoading(true);
    try {
      const res = await axios.post('/api/todos', {
        title: newTitle,
        description: newDesc || undefined,
        priority: newPriority,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : null,
      });
      setTodos([res.data, ...todos]);
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewPriority('MEDIUM');
      setNewDueDate('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const res = await axios.put(`/api/todos/${todo.id}`, {
        isCompleted: !todo.isCompleted,
      });
      setTodos(todos.map(t => t.id === todo.id ? res.data : t));
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
  };

  const handleUpdateTodo = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const res = await axios.put(`/api/todos/${id}`, {
        title: editTitle,
        description: editDesc || null,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      setTodos(todos.map(t => t.id === id ? res.data : t));
      setEditingTodoId(null);
    } catch (err) {
      setError('Failed to save task edits.');
    }
  };

  // Compute statistics
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.isCompleted).length;
  const activeCount = totalCount - completedCount;

  // Filter & Sort logic
  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !todo.isCompleted) ||
        (statusFilter === 'COMPLETED' && todo.isCompleted);

      const matchesPriority = 
        priorityFilter === 'ALL' ||
        todo.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'DUE_DATE') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'PRIORITY') {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      // Default: Created date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header / Nav */}
      <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
              TF
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs font-semibold py-2 px-4 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all text-slate-400"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Tasks</p>
              <h3 className="text-3xl font-extrabold mt-1 text-slate-100">{totalCount}</h3>
            </div>
            <Sparkles className="w-8 h-8 text-indigo-400/80" />
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Active Tasks</p>
              <h3 className="text-3xl font-extrabold mt-1 text-purple-400">{activeCount}</h3>
            </div>
            <Circle className="w-8 h-8 text-purple-400/80" />
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Completed</p>
              <h3 className="text-3xl font-extrabold mt-1 text-emerald-400">{completedCount}</h3>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400/80" />
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-sm flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {error}
            </span>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Todo Panel */}
          <section className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 sticky top-24 shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Create New Task
              </h2>
              
              <form onSubmit={handleCreateTodo} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 transition-all placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe details (optional)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 transition-all placeholder-slate-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full px-3 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-semibold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Task</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* List & Filters Panel */}
          <section className="lg:col-span-2 space-y-6">
            {/* Filter controls */}
            <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-300 placeholder-slate-600 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-2 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
                >
                  <option value="CREATED">Sort: Newest</option>
                  <option value="DUE_DATE">Sort: Due Date</option>
                  <option value="PRIORITY">Sort: Priority</option>
                </select>
              </div>
            </div>

            {/* Todo Lists */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p>Loading your space...</p>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                  <Sparkles className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                  <h3 className="font-semibold text-slate-400">No tasks found</h3>
                  <p className="text-sm mt-1">Try broadening your search filters or add a new task!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredTodos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 rounded-2xl border transition-all ${
                          todo.isCompleted 
                            ? 'bg-slate-950/40 border-slate-900 text-slate-500' 
                            : 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700/80'
                        }`}
                      >
                        {editingTodoId === todo.id ? (
                          // Edit Form Mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="px-3 py-2 text-sm rounded bg-slate-950 border border-slate-800 text-slate-200"
                                placeholder="Edit title..."
                              />
                              <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="px-3 py-2 text-sm rounded bg-slate-950 border border-slate-800 text-slate-200"
                              />
                            </div>
                            
                            <textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 text-sm rounded bg-slate-950 border border-slate-800 text-slate-200 resize-none"
                              placeholder="Edit description (optional)..."
                            />

                            <div className="flex items-center justify-between">
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as any)}
                                className="px-2 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={cancelEditing}
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateTodo(todo.id)}
                                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white flex items-center gap-1 transition-all"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Normal View Mode
                          <div className="flex items-start gap-4 justify-between">
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleComplete(todo)}
                                className="mt-1 flex-shrink-0 text-slate-500 hover:text-indigo-400 transition-colors"
                              >
                                {todo.isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-700" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <h3 className={`font-semibold text-sm tracking-tight break-words ${todo.isCompleted ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                                  {todo.title}
                                </h3>
                                {todo.description && (
                                  <p className={`text-xs mt-1 leading-relaxed break-words ${todo.isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {todo.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getPriorityBadgeColor(todo.priority)}`}>
                                    {todo.priority}
                                  </span>

                                  {todo.dueDate && (
                                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(todo.dueDate).toLocaleDateString(undefined, { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {!todo.isCompleted && (
                                <button
                                  onClick={() => startEditing(todo)}
                                  className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-slate-800/40 rounded-xl transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800/40 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
