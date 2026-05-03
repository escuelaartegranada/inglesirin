import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/sounds';
import { getRandomFoods } from '../data/foods';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function SentenceBuilderGame({ onComplete }: Props) {
  const [foods, setFoods] = useState<any[]>([]);
  const [likeFood, setLikeFood] = useState<any>(null);
  const [dislikeFood, setDislikeFood] = useState<any>(null);
  const [isFirstLike, setIsFirstLike] = useState(true);
  
  const [expectedParts, setExpectedParts] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{id: string, text: string}[]>([]);
  const [placedWords, setPlacedWords] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    const selected = getRandomFoods(2);
    setFoods(selected);
    const f1 = selected[0];
    const f2 = selected[1];
    
    const formFirstLike = Math.random() > 0.5;
    setIsFirstLike(formFirstLike);
    
    if (formFirstLike) {
      setLikeFood(f1);
      setDislikeFood(f2);
      setExpectedParts(['I like', f1.word, 'but', "I don't like", f2.word]);
      
      const words = [
        { id: 'w1', text: 'I like' },
        { id: 'w2', text: f1.word },
        { id: 'w3', text: 'but' },
        { id: 'w4', text: "I don't like" },
        { id: 'w5', text: f2.word },
        { id: 'w6', text: 'and' }, // Distractor
      ];
      setAvailableWords(words.sort(() => 0.5 - Math.random()));
    } else {
      setDislikeFood(f1);
      setLikeFood(f2);
      setExpectedParts(["I don't like", f1.word, 'but', 'I like', f2.word]);
      
      const words = [
        { id: 'w1', text: "I don't like" },
        { id: 'w2', text: f1.word },
        { id: 'w3', text: 'but' },
        { id: 'w4', text: 'I like' },
        { id: 'w5', text: f2.word },
        { id: 'w6', text: 'and' }, // Distractor
      ];
      setAvailableWords(words.sort(() => 0.5 - Math.random()));
    }
  }, []);

  const handleWordClick = (word: {id: string, text: string}) => {
    sounds.playTone(400, 'sine', 0.1);
    setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    setPlacedWords(prev => [...prev, word]);
  };

  const handlePlacedClick = (word: {id: string, text: string}) => {
    sounds.playTone(300, 'sine', 0.1);
    setPlacedWords(prev => prev.filter(w => w.id !== word.id));
    setAvailableWords(prev => [...prev, word]);
  };

  useEffect(() => {
    if (placedWords.length === expectedParts.length) {
      const isCorrect = placedWords.every((pw, i) => pw.text === expectedParts[i]);
      
      if (isCorrect) {
        sounds.playTone(500, 'sine', 0.1);
        setTimeout(() => sounds.playTone(600, 'sine', 0.1), 100);
        setTimeout(() => sounds.playTone(800, 'sine', 0.2), 200);
        
        const fullSentence = placedWords.map(w => w.text).join(' ');
        sounds.speak(fullSentence);
        
        setTimeout(() => {
          onComplete(true);
        }, 2500);
      } else {
        sounds.playTone(300, 'sawtooth', 0.2);
        // Shake or visual feedback could be added here
      }
    }
  }, [placedWords, expectedParts, onComplete]);

  if (foods.length === 0 || !likeFood) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full max-w-4xl mx-auto gap-8"
    >
      <div className="bg-white/80 p-6 md:p-8 rounded-[40px] border-[6px] border-[#A06CD5] shadow-xl w-full text-center relative backdrop-blur-md">
        <h2 className="text-2xl md:text-3xl font-black text-[#8B5BB8] uppercase tracking-widest mb-4">
          ¡Construye la frase!
        </h2>
        <p className="text-lg font-bold text-gray-500 mb-6">
          Toca las palabras en orden.
        </p>

        {/* Visual Cue */}
        <div className="flex justify-center items-center gap-4 md:gap-12 mb-8">
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-3xl border-4 border-green-200 shadow-md">
            <span className="text-4xl mb-2">{isFirstLike ? '😋' : '🤢'}</span>
            <span className="text-6xl">{isFirstLike ? likeFood.emoji : dislikeFood.emoji}</span>
          </div>
          
          <div className="text-5xl font-black text-orange-400">&</div>

          <div className="flex flex-col items-center p-4 bg-red-50 rounded-3xl border-4 border-red-200 shadow-md">
            <span className="text-4xl mb-2">{isFirstLike ? '🤢' : '😋'}</span>
            <span className="text-6xl">{isFirstLike ? dislikeFood.emoji : likeFood.emoji}</span>
          </div>
        </div>

        {/* Placed Words (Sentence) */}
        <div className="min-h-[80px] w-full bg-purple-50 rounded-3xl border-4 border-dashed border-[#A06CD5] p-4 flex flex-wrap gap-3 items-center justify-center mb-8">
          <AnimatePresence>
            {placedWords.map((word) => (
              <motion.button
                key={`placed-${word.id}`}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => handlePlacedClick(word)}
                className="px-4 py-2 bg-[#8B5BB8] text-white rounded-2xl font-bold text-xl shadow-md hover:bg-purple-600 transition-colors"
              >
                {word.text}
              </motion.button>
            ))}
          </AnimatePresence>
          {placedWords.length === 0 && (
            <span className="text-purple-300 font-bold text-xl">Tu frase aparecerá aquí...</span>
          )}
        </div>

        {/* Available Words */}
        <div className="flex flex-wrap gap-4 justify-center">
          <AnimatePresence>
            {availableWords.map((word) => (
              <motion.button
                key={`avail-${word.id}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => handleWordClick(word)}
                className="px-6 py-3 bg-white border-4 border-[#FFB8D1] text-[#4A1D34] rounded-2xl font-black text-xl shadow-lg hover:bg-pink-50 hover:scale-105 active:scale-95 transition-all"
              >
                {word.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
