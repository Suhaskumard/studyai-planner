import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { tasksAPI, sessionsAPI, analyticsAPI, goalsAPI } from '../services/api';
import { 
  CheckSquare, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, sessionsRes, goalsRes, analyticsRes] = await Promise.all([
        tasksAPI.getAll(),
        sessionsAPI.getAll(),
        goalsAPI.getAll(),
        analyticsAPI.getSummary()
      ]);
      
      setTasks(tasksRes.data);
      setSessions(sessionsRes.data);
      setGoals(goalsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;

  // Chart data - Study time over last 7 days
  const studyTimeData = [
    { day: 'Mon', time: 120 },
    { day: 'Tue', time: 90 },
    { day: 'Wed', time: 150 },
    { day: 'Thu', time: 180 },
    { day: 'Fri', time: 60 },
    { day: 'Sat', time: 210 },
    { day: 'Sun', time: 135 }
  ];

  // Task status distribution
  const taskStatusData = [
    { name: 'Completed', value: completedTasks, color: '#10B981' },
    { name: 'Pending', value: pendingTasks, color: '#F59E0B' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3B82F6' }
  ];

  const statCards = [
    {
      title: 'Total Study Time',
      value: analytics ? `${Math.floor(analytics.totalStudyTime / 60)}h ${analytics.totalStudyTime % 60}m` : '0h 0m',
      icon: Clock,
      color: 'bg-blue-500',
      link: '/timer'
    },
    {
      title: 'Tasks Completed',
      value: analytics?.totalTasksCompleted || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
      link: '/tasks'
    },
    {
      title: 'Current Streak',
      value: `${analytics?.currentStreak || 0} days`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/analytics'
    },
    {
      title: 'Active Goals',
      value: activeGoals,
      icon: Target,
      color: 'bg-orange-500',
      link: '/goals'
    }
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username || 'Student'}! 👋
        </h1>
        <p className="opacity-90">Here's your study progress for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Study Time This Week
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Task Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {taskStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-gray-900 dark:text-white">{task.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tasks yet</p>
            )}
          </div>
        </div>

        {/* Active Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Goals</h2>
            <Link to="/goals" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 5).map((goal) => (
              <div key={goal._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{goal.title}</span>
                  <span className="text-sm text-gray-500">
                    {goal.currentHours || 0}/{goal.targetHours || 0}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(((goal.currentHours || 0) / (goal.targetHours || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No goals yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/notes" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-3">
          <BookOpen className="text-blue-500" size={24} />
          <span className="font-medium text-gray-900 dark:text-white">Notes</span>
        </Link>
        <Link to="/flashcards" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-3">
          <Award className="text-purple-500" size={24} />
          <span className="font-medium text-gray-900 dark:text-white">Flashcards</span>
        </Link>
        <Link to="/schedule" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-3">
          <Calendar className="text-green-500" size={24} />
          <span className="font-medium text-gray-900 dark:text-white">Schedule</span>
        </Link>
        <Link to="/chat" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-3">
          <Target className="text-orange-500" size={24} />
          <span className="font-medium text-gray-900 dark:text-white">Chat</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

