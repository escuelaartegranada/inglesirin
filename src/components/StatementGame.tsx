import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getRandomFood } from '../data/foods';
import { sounds } from '../lib/sounds';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function StatementGame({ onComplete }: Props) {
  const [food, setFood] = useState<any>(null);
  const [likesIt, setLikesIt] = useState<boolean>(true);
  const [options, setOptions] = useState<{ id: number, text: string, isCorrect: boolean }[]>([]);

  useEffect(() => {
    const target = getRandomFood();
    setFood(target);
    const doesLike = Math.random() > 0.5;
    setLikesIt(doesLike);
    
    setOptions([
      { id: 1, text: `I like ${target.word}.`, isCorrect: doesLike },
      { id: 2, text: `I don't like ${target.word}.`, isCorrect: !doesLike }
    ].sort(() => Math.random() - 0.5));

  }, []);

  const handleSelect = (isCorrect: boolean) => {
    if (isCorrect) {
      onComplete(true);
    } else {
      sounds.playError();
    }
  };

  const playAudio = () => {
    sounds.speak(likesIt ? `I like ${food.word}` : `I don't like ${food.word}`);
  };

  if (!food) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, rotate: 5 }}
      animate={{ opacity: 1, rotate: 0 }}
      className="w-full flex flex-col items-center gap-8"
    >
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border-[6px] border-[#A06CD5] flex flex-col items-center justify-center relative overflow-hidden w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
        <div className="absolute top-4 left-6 text-sm font-black text-[#A06CD5] opacity-60 tracking-wider">CHOOSE THE RIGHT SENTENCE</div>
        
        <div className="mt-8 bg-gradient-to-r from-[#FF85A1] to-[#FF4D6D] text-white px-8 py-5 rounded-[24px] text-center relative max-w-lg w-full flex items-center justify-between border-b-[6px] border-pink-800 shadow-lg">
          <button 
            onClick={playAudio}
            className="p-4 mb-2 bg-gradient-to-b from-[#FFD23F] to-[#FFC000] rounded-[20px] shadow-xl text-[#4A1D34] font-bold border-b-[6px] border-amber-600 active:border-b-[0px] active:translate-y-[6px] transition-all"
          >
            <Volume2 className="w-8 h-8" strokeWidth={3} />
          </button>
          
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#D90429] rotate-45"></div>
          <p className="text-3xl font-black leading-tight uppercase flex-1 text-center tracking-wide">
            Listen & Look!
          </p>
        </div>
      </div>

      {/* The Visual Prompt */}
      <div className="flex items-center justify-center gap-6 z-10 my-4 group">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-[70px] border-[8px] border-white shadow-xl ${likesIt ? 'bg-[#D4F5D4]' : 'bg-[#FFD6E0]'}`}>
          <span className="drop-shadow-md">{likesIt ? '😋' : '🤢'}</span>
        </div>
        <div className="h-44 w-44 flex items-center justify-center bg-white rounded-full shadow-2xl border-[12px] border-[#FFF0F3] relative group-hover:scale-110 transition-transform cursor-pointer" onClick={playAudio}>
          <div className="absolute inset-0 bg-[#FFB8D1] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <span className="text-[90px] drop-shadow-2xl z-10">{food.emoji}</span>
        </div>
      </div>

      {/* The Options */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 mt-4 max-w-3xl">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.isCorrect)}
            className="w-full sm:w-1/2 bg-white rounded-[30px] p-6 text-center border-[6px] border-[#A06CD5] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-[#4A1D34] relative group border-b-[8px]"
          >
            <div className="absolute top-2 right-4 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
              {opt.text.includes("don't") ? <XCircle className="text-pink-500" /> : <CheckCircle2 className="text-green-500" />}
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-wide">{opt.text}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
