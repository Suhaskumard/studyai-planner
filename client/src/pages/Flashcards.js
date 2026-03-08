import React, { useState, useEffect } from 'react';
import { flashcardsAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Layers, Play, CheckCircle, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const Flashcards = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [error, setError] = useState('');
  
  // Study state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyProgress, setStudyProgress] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    cards: []
  });
  
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await flashcardsAPI.getAll();
      setDecks(response.data);
    } catch (error) {
      setError('Failed to fetch flashcard decks');
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

    if (formData.cards.length === 0) {
      setError('Add at least one flashcard');
      return;
    }

    try {
      if (editingDeck) {
        await flashcardsAPI.update(editingDeck._id, formData);
      } else {
        await flashcardsAPI.create(formData);
      }
      await fetchDecks();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save deck');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) return;
    
    try {
      await flashcardsAPI.delete(id);
      await fetchDecks();
    } catch (error) {
      setError('Failed to delete deck');
    }
  };

  const openModal = (deck = null) => {
    if (deck) {
      setEditingDeck(deck);
      setFormData({
        title: deck.title || '',
        description: deck.description || '',
        subject: deck.subject || '',
        cards: deck.cards || []
      });
    } else {
      setEditingDeck(null);
      setFormData({
        title: '',
        description: '',
        subject: '',
        cards: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDeck(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      cards: []
    });
    setNewCard({ front: '', back: '' });
    setError('');
  };

  const addCard = () => {
    if (newCard.front.trim() && newCard.back.trim()) {
      setFormData({
        ...formData,
        cards: [...formData.cards, { ...newCard }]
      });
      setNewCard({ front: '', back: '' });
    }
  };

  const removeCard = (index) => {
    const newCards = [...formData.cards];
    newCards.splice(index, 1);
    setFormData({ ...formData, cards: newCards });
  };

  const startStudy = (deck) => {
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyProgress(new Array(deck.cards.length).fill(false));
    setShowStudyModal(true);
  };

  const nextCard = () => {
    if (currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const markAsKnown = () => {
    const newProgress = [...studyProgress];
    newProgress[currentCardIndex] = true;
    setStudyProgress(newProgress);
    
    if (currentCardIndex < selectedDeck.cards.length - 1) {
      nextCard();
    }
  };

  const getProgress = () => {
    return studyProgress.filter(p => p).length;
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <p className="text-gray-500 dark:text-gray-400">Create and study flashcard decks</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors btn-hover"
        >
          <Plus size={20} />
          Create Deck
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <div
            key={deck._id}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{deck.title}</h3>
                {deck.subject && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{deck.subject}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal(deck)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(deck._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Description */}
            {deck.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {deck.description}
              </p>
            )}

            {/* Card Count */}
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Layers size={16} />
                {deck.cards?.length || 0} cards
              </span>
            </div>

            {/* Study Button */}
            {deck.cards?.length > 0 && (
              <button
                onClick={() => startStudy(deck)}
                className="w-full flex items-center justify-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 py-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                <Play size={18} />
                Study Now
              </button>
            )}
          </div>
        ))}

        {decks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Layers size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No flashcard decks yet</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDeck ? 'Edit Deck' : 'Create New Deck'}
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
                  placeholder="e.g., Biology Terms"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Biology"
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
                  placeholder="Describe this deck"
                />
              </div>

              {/* Add Cards */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Flashcards
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    className="form-input"
                    placeholder="Front (Question)"
                  />
                  <input
                    type="text"
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    className="form-input"
                    placeholder="Back (Answer)"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCard}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Add Card
                </button>
              </div>

              {/* Card List */}
              {formData.cards.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cards ({formData.cards.length})
                  </label>
                  {formData.cards.map((card, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">Q:</span>
                          <p className="text-sm text-gray-900 dark:text-white truncate">{card.front}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">A:</span>
                          <p className="text-sm text-gray-900 dark:text-white truncate">{card.back}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCard(index)}
                        className="p-1 text-gray-500 hover:text-red-600 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
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
                  {editingDeck ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Study Modal */}
      {showStudyModal && selectedDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDeck.title}
              </h2>
              <button
                onClick={() => setShowStudyModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Card {currentCardIndex + 1} of {selectedDeck.cards.length}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {getProgress()} / {selectedDeck.cards.length} known
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentCardIndex + 1) / selectedDeck.cards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flashcard */}
            <div 
              className="relative min-h-[300px] mb-6 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`absolute inset-0 transition-all duration-300 transform preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}>
                {/* Front */}
                <div className={`w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 flex flex-col items-center justify-center text-white ${
                  !isFlipped ? '' : 'hidden'
                }`}>
                  <p className="text-lg font-medium text-center">{selectedDeck.cards[currentCardIndex].front}</p>
                  <p className="text-sm opacity-75 mt-4">Click to flip</p>
                </div>
                
                {/* Back */}
                <div className={`w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 flex flex-col items-center justify-center text-white ${
                  isFlipped ? '' : 'hidden'
                }`}>
                  <p className="text-lg font-medium text-center">{selectedDeck.cards[currentCardIndex].back}</p>
                  <p className="text-sm opacity-75 mt-4">Click to flip</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={20} />
                  Flip
                </button>
                <button
                  onClick={markAsKnown}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle size={20} />
                  Know It
                </button>
              </div>

              <button
                onClick={nextCard}
                disabled={currentCardIndex === selectedDeck.cards.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;

