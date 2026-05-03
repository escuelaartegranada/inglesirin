import React, { useState, useEffect } from 'react';
import { getRandomFood } from '../data/foods';
import { motion } from 'motion/react';
import { sounds } from '../lib/sounds';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function SpellGame({ onComplete }: Props) {
  const [food, setFood] = useState<any>(null);
  const [letters, setLetters] = useState<string[]>([]);
  
  useEffect(() => {
    const target = getRandomFood();
    setFood(target);
    
    // Generate 3 wrong letters + 1 correct letter
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const wrongLetters = alphabet
      .filter(l => l !== target.initial)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    const choices = [target.initial, ...wrongLetters].sort(() => 0.5 - Math.random());
    setLetters(choices);

    setTimeout(() => sounds.speak(target.word), 500);
  }, []);

  const handleLetterClick = (letter: string) => {
    if (letter === food.initial) {
      onComplete(true);
    } else {
      sounds.playError();
    }
  };

  if (!food) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center gap-8"
    >
      <div className="bg-white rounded-[40px] p-8 shadow-2xl border-[6px] border-[#FFD23F] flex flex-col items-center w-full max-w-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform">
        <div className="absolute top-4 left-6 text-sm font-black text-[#FFD23F] uppercase tracking-wider">SPELLING MISSION</div>
        
        <div className="mt-8 mb-6 w-48 h-48 bg-gradient-to-br from-[#FFF5F7] to-[#FFE3E9] rounded-full flex items-center justify-center text-[100px] border-[10px] border-white shadow-xl">
          <span className="drop-shadow-lg">{food.emoji}</span>
        </div>
        
        {/* Fill in the blank display */}
        <div className="flex items-center justify-center w-full max-w-sm h-24 bg-gradient-to-r from-[#FFF9E6] to-[#FFF0B3] border-[4px] border-[#FFD23F] rounded-[24px] px-6 shadow-inner">
          <span className="text-6xl font-sans font-black text-[#4A1D34] uppercase tracking-widest flex items-baseline gap-2">
            <span className="text-[#FF85A1] border-b-[6px] border-[#FF85A1] pb-1 min-w-[4rem] text-center drop-shadow-sm">_</span>
            <span className="tracking-[0.3rem] opacity-80">{food.word.slice(1)}</span>
          </span>
        </div>
      </div>

      {/* Virtual Keyboard Options */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[40px] p-10 border-[6px] border-dashed border-[#A06CD5] shadow-2xl w-full max-w-2xl">
        <div className="flex gap-6 flex-wrap justify-center">
          {letters.map((l, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLetterClick(l)}
              className="w-24 h-24 bg-gradient-to-br from-[#A06CD5] to-[#7251B5] rounded-[24px] shadow-xl text-white font-black flex items-center justify-center text-5xl uppercase border-b-[8px] border-purple-900 active:border-b-[0px] active:translate-y-[8px] transition-all"
            >
              {l}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
