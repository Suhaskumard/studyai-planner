import React, { useState, useEffect, useRef } from 'react';
import { sessionsAPI, analyticsAPI } from '../services/api';
import { Play, Pause, RotateCcw, Coffee, BookOpen, CheckCircle } from 'lucide-react';

const Timer = () => {
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [subject, setSubject] = useState('');
  const intervalRef = useRef(null);

  const FOCUS_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  useEffect(() => {
    fetchSessions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const fetchSessions = async () => {
    try {
      const response = await sessionsAPI.getAll();
      setSessions(response.data);
      
      // Calculate total study time
      const total = response.data.reduce((sum, session) => {
        return session.type === 'focus' ? sum + (session.duration || 0) : sum;
      }, 0);
      setTotalStudyTime(total);
      
      // Count completed sessions
      const completed = response.data.filter(s => s.completed && s.type === 'focus').length;
      setCompletedSessions(completed);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      // End focus session
      if (currentSession) {
        try {
          await sessionsAPI.update(currentSession._id, {
            endTime: new Date(),
            duration: FOCUS_TIME / 60,
            completed: true
          });
          
          // Update analytics
          await analyticsAPI.create({
            date: new Date(),
            studyTime: FOCUS_TIME / 60,
            tasksCompleted: 0,
            sessionsCount: 1
          });
          
          setCompletedSessions(prev => prev + 1);
          setTotalStudyTime(prev => prev + FOCUS_TIME / 60);
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }
      
      // Switch to break mode
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      // Switch back to focus mode
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
      setCurrentSession(null);
    }
  };

  const startTimer = async () => {
    if (mode === 'focus' && !currentSession) {
      // Create new session
      try {
        const response = await sessionsAPI.create({
          subject: subject || 'General',
          startTime: new Date(),
          type: 'focus'
        });
        setCurrentSession(response.data);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setCurrentSession(null);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setCurrentSession(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const progress = mode === 'focus' 
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Timer</h1>
        <p className="text-gray-500 dark:text-gray-400">Stay focused and track your study sessions</p>
      </div>

      {/* Timer Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card">
        {/* Mode Switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => switchMode('focus')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'focus'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BookOpen size={20} />
            Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'break'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Coffee size={20} />
            Break
          </button>
        </div>

        {/* Subject Input */}
        {mode === 'focus' && !isRunning && !currentSession && (
          <div className="mb-6">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What are you studying?"
              className="form-input text-center"
            />
          </div>
        )}

        {/* Timer Display */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Progress Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className={`transition-all duration-1000 ${mode === 'focus' ? 'text-primary-600' : 'text-green-500'}`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${
              mode === 'focus' ? 'text-primary-600' : 'text-green-500'
            }`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 mt-2">
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium text-lg transition-all btn-hover ${
                mode === 'focus'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Play size={24} />
              {currentSession ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-medium text-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all btn-hover"
            >
              <Pause size={24} />
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all btn-hover"
          >
            <RotateCcw size={24} />
            Reset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <BookOpen className="text-primary-600 dark:text-primary-300" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(Math.floor(totalStudyTime))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="text-green-600 dark:text-green-300" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedSessions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Coffee className="text-blue-600 dark:text-blue-300" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(totalStudyTime / 25)} sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h2>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${session.type === 'focus' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-green-100 dark:bg-green-900'}`}>
                  {session.type === 'focus' ? (
                    <BookOpen className="text-primary-600 dark:text-primary-300" size={16} />
                  ) : (
                    <Coffee className="text-green-600 dark:text-green-300" size={16} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.subject || 'General'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(session.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(session.duration || 0)}
                </p>
                {session.completed && (
                  <span className="text-xs text-green-600 dark:text-green-400">Completed</span>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No sessions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;

