import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageSquare, RefreshCw } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI study assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const assistantResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantResponse]);
      setLoading(false);
    }, 1000);
  };

  const getAIResponse = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes('study') || q.includes('how to study')) {
      return "Here are some effective study tips:\n\n1. **Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break.\n2. **Active Recall**: Test yourself instead of just re-reading.\n3. **Spaced Repetition**: Review material at increasing intervals.\n4. **Create Summaries**: Write brief summaries of each topic.\n5. **Stay Organized**: Keep your study space and notes organized.";
    }
    
    if (q.includes('focus') || q.includes('concentrate')) {
      return "To improve focus:\n\n1. Remove distractions (phone, TV).\n2. Use the Pomodoro Technique.\n3. Study during your peak energy hours.\n4. Take regular breaks.\n5. Stay hydrated and well-rested.\n6. Use background music or white noise if it helps.";
    }
    
    if (q.includes('memory') || q.includes('remember')) {
      return "Boost your memory with these techniques:\n\n1. **Mnemonics**: Create memory aids.\n2. **Chunking**: Group information into smaller pieces.\n3. **Visualization**: Create mental images.\n4. **Teaching others**: Explain concepts to someone else.\n5. **Sleep**: Get enough sleep to consolidate memories.";
    }
    
    if (q.includes('note') || q.includes('notes')) {
      return "Effective note-taking methods:\n\n1. **Cornell Method**: Divide page into notes, cues, and summary.\n2. **Mind Mapping**: Visual organization of concepts.\n3. **Outline Method**: Hierarchical organization.\n4. **Sketch Notes**: Combine doodles with text.\n\nRemember to review notes within 24 hours!";
    }
    
    if (q.includes('exam') || q.includes('test')) {
      return "Exam preparation tips:\n\n1. Start preparing early - don't cram!\n2. Create a study schedule.\n3. Practice with past exams.\n4. Know the format and weighting.\n5. Take care of yourself the night before.\n6. Arrive early and bring required materials.";
    }
    
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return "Hi there! 👋 I'm here to help with your studies. Ask me about:\n- Study techniques\n- Focus strategies\n- Memory improvement\n- Note-taking methods\n- Exam preparation\n\nWhat would you like to know?";
    }
    
    return "That's a great question! I'm here to help with your study journey. You can ask me about:\n\n- 📚 Study techniques\n- 🎯 How to focus better\n- 🧠 Memory strategies\n- 📝 Note-taking methods\n- 📅 Exam preparation\n\nWhat would you like to explore?";
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your AI study assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  const suggestedQuestions = [
    'How can I study more effectively?',
    'How do I improve my focus?',
    'What are memory techniques?',
    'How should I take notes?',
    'How do I prepare for exams?'
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Assistant</h1>
          <p className="text-gray-500 dark:text-gray-400">Get AI-powered study help</p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw size={18} />
          New Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'assistant' 
                  ? 'bg-primary-100 dark:bg-primary-900' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot size={18} className="text-primary-600 dark:text-primary-300" />
                ) : (
                  <User size={18} className="text-gray-600 dark:text-gray-300" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[70%] ${
                message.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              } rounded-2xl px-4 py-3`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-200' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Bot size={18} className="text-primary-600 dark:text-primary-300" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(question);
                    handleSubmit({ preventDefault: () => {} });
                  }}
                  className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about studying..."
              className="flex-1 form-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

