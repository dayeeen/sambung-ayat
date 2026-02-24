'use client';

import { useState, useEffect } from 'react';
import { getRandomAyah, getNextAyah, checkAnswer, Ayah } from '../../lib/quran';

export default function PracticePage() {
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [targetAyah, setTargetAyah] = useState<Ayah | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const loadNewRound = () => {
    // Reset state
    setUserInput('');
    setFeedback(null);
    setIsSubmitted(false);

    // Get new ayah
    const ayah = getRandomAyah();
    setCurrentAyah(ayah);

    // Get the next ayah (the answer)
    const next = getNextAyah(ayah.surah, ayah.ayah);
    setTargetAyah(next);
  };

  useEffect(() => {
    loadNewRound();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAyah) return;

    const isCorrect = checkAnswer(userInput, targetAyah.text);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setIsSubmitted(true);
  };

  if (!currentAyah) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8 space-y-8">
        
        {/* Header / Progress (Optional for MVP, keeping it simple) */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Complete the Verse</p>
          <div className="text-3xl md:text-4xl font-arabic leading-loose text-gray-800 text-center" dir="rtl">
            {currentAyah.text}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Surah {currentAyah.surah} : Ayah {currentAyah.ayah}
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the next ayah here..."
              className={`w-full p-4 text-xl md:text-2xl font-arabic text-right border-2 rounded-xl focus:outline-none transition-colors resize-none min-h-[120px]
                ${isSubmitted 
                  ? feedback === 'correct' 
                    ? 'border-green-200 bg-green-50 text-green-900' 
                    : 'border-orange-200 bg-orange-50 text-gray-900'
                  : 'border-gray-200 focus:border-blue-400 bg-white'
                }`}
              dir="rtl"
              disabled={isSubmitted}
            />
          </div>

          {/* Feedback & Actions */}
          {!isSubmitted ? (
            <button
              type="submit"
              disabled={!userInput.trim()}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Check Answer
            </button>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {feedback === 'correct' ? (
                <div className="p-4 rounded-xl bg-green-100 text-green-800 text-center">
                  <p className="text-lg font-bold mb-1">Masha'Allah! Correct ✨</p>
                  <p className="font-arabic text-xl">{targetAyah?.text}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-orange-50 text-orange-900 text-center border border-orange-100">
                  <p className="text-sm font-medium mb-2 text-orange-800">Not quite. The correct ayah is:</p>
                  <p className="font-arabic text-2xl leading-loose" dir="rtl">{targetAyah?.text}</p>
                </div>
              )}

              <button
                type="button"
                onClick={loadNewRound}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Next Verse →
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
