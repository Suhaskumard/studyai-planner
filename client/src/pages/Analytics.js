import React, { useState, useEffect } from 'react';
import { analyticsAPI, tasksAPI, sessionsAPI } from '../services/api';
import { BarChart2, TrendingUp, Clock, Target, CheckCircle, Calendar, Award } from 'lucide-react';
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
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const [analyticsRes, tasksRes, sessionsRes] = await Promise.all([
        analyticsAPI.getAll(dateRange),
        tasksAPI.getAll(),
        sessionsAPI.getAll()
      ]);
      
      setAnalytics(analyticsRes.data);
      setTasks(tasksRes.data);
      setSessions(sessionsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demonstration
  const studyTimeData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 1.8 },
    { day: 'Wed', hours: 3.2 },
    { day: 'Thu', hours: 2.1 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: 3.8 }
  ];

  const taskStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length || 15, color: '#10B981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length || 5, color: '#3B82F6' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length || 8, color: '#F59E0B' }
  ];

  const subjectData = [
    { name: 'Mathematics', hours: 12 },
    { name: 'Physics', hours: 8 },
    { name: 'Chemistry', hours: 6 },
    { name: 'Biology', hours: 4 },
    { name: 'History', hours: 3 }
  ];

  const weeklyGoal = 20;
  const currentWeekHours = studyTimeData.reduce((sum, day) => sum + day.hours, 0);
  const goalProgress = Math.min((currentWeekHours / weeklyGoal) * 100, 100);

  const stats = [
    {
      title: 'Total Study Time',
      value: `${analytics?.totalStudyTime ? Math.floor(analytics.totalStudyTime / 60) : 23}h`,
      subtitle: 'This month',
      icon: Clock,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Tasks Completed',
      value: analytics?.totalTasksCompleted || 15,
      subtitle: 'This month',
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Current Streak',
      value: `${analytics?.currentStreak || 7} days`,
      subtitle: 'Keep it up!',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+2 days'
    },
    {
      title: 'Focus Sessions',
      value: analytics?.totalSessions || 28,
      subtitle: 'This month',
      icon: Award,
      color: 'bg-orange-500',
      change: '+5'
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your study progress and performance</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === days
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {days === 7 ? '1 Week' : days === 30 ? '1 Month' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-green-600 dark:text-green-400">{stat.change}</span>
              <span className="text-gray-500 dark:text-gray-400">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Daily Study Hours
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyTimeData}>
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
                <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Task Distribution
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
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Goal Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Goal Progress
          </h2>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - goalProgress / 100)}
                  className="text-primary-500 transition-all"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(goalProgress)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {currentWeekHours.toFixed(1)} / {weeklyGoal} hours this week
            </p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Time by Subject
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="hours" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Study Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <span className="font-medium text-blue-600 dark:text-blue-400">Best Day</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Saturday with 5.5 hours of study</p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-green-600" size={20} />
              <span className="font-medium text-green-600 dark:text-green-400">Achievement</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">7-day streak! Keep it up!</p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-600" size={20} />
              <span className="font-medium text-purple-600 dark:text-purple-400">Suggestion</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Focus more on Biology this week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

