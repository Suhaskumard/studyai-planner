import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Target, CheckCircle, Flag, TrendingUp } from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study',
    targetHours: 10,
    currentHours: 0,
    deadline: '',
    status: 'active'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalsAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.deadline) {
      setError('Deadline is required');
      return;
    }

    try {
      if (editingGoal) {
        await goalsAPI.update(editingGoal._id, formData);
      } else {
        await goalsAPI.create(formData);
      }
      await fetchGoals();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalsAPI.delete(id);
      await fetchGoals();
    } catch (error) {
      setError('Failed to delete goal');
    }
  };

  const handleProgressUpdate = async (goal, hours) => {
    const newHours = goal.currentHours + hours;
    try {
      await goalsAPI.update(goal._id, { currentHours: newHours });
      await fetchGoals();
    } catch (error) {
      setError('Failed to update progress');
    }
  };

  const openModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'study',
        targetHours: goal.targetHours || 10,
        currentHours: goal.currentHours || 0,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
        status: goal.status || 'active'
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        category: 'study',
        targetHours: 10,
        currentHours: 0,
        deadline: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: 'study',
      targetHours: 10,
      currentHours: 0,
      deadline: '',
      status: 'active'
    });
    setError('');
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const getProgress = (goal) => {
    return Math.min(((goal.currentHours || 0) / (goal.targetHours || 1)) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-primary-500';
    return 'bg-yellow-500';
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const categories = [
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'reading', label: 'Reading', icon: '📖' },
    { value: 'skill', label: 'Skill Development', icon: '🎯' },
    { value: 'other', label: 'Other', icon: '✨' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your study goals and progress</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors btn-hover"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const progress = getProgress(goal);
          const daysRemaining = getDaysRemaining(goal.deadline);
          const category = categories.find(c => c.value === goal.category) || categories[0];

          return (
            <div
              key={goal._id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all ${
                goal.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {category.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(goal)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                  {goal.description}
                </p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {goal.currentHours || 0}h / {goal.targetHours}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Add Hours Button */}
              {goal.status === 'active' && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleProgressUpdate(goal, 1)}
                    className="flex-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => handleProgressUpdate(goal, 2)}
                    className="flex-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                  >
                    +2 Hours
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  {goal.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} />
                      Completed
                    </span>
                  ) : daysRemaining !== null && (
                    <span className={`flex items-center gap-1 ${
                      daysRemaining <= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <Flag size={14} />
                      {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue'}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Target size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No goals found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Complete Calculus Course"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows="2"
                  placeholder="Describe your goal"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Hours
                </label>
                <input
                  type="number"
                  value={formData.targetHours}
                  onChange={(e) => setFormData({ ...formData, targetHours: parseInt(e.target.value) || 0 })}
                  className="form-input"
                  min="1"
                />
              </div>

              {/* Current Hours (for editing) */}
              {editingGoal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Hours
                  </label>
                  <input
                    type="number"
                    value={formData.currentHours}
                    onChange={(e) => setFormData({ ...formData, currentHours: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
              )}

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Status */}
              {editingGoal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;

