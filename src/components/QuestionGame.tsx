import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getRandomFood } from '../data/foods';
import { sounds } from '../lib/sounds';
import { Volume2 } from 'lucide-react';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function QuestionGame({ onComplete }: Props) {
  const [food, setFood] = useState<any>(null);
  const [likesIt, setLikesIt] = useState<boolean>(true);
  
  useEffect(() => {
    const target = getRandomFood();
    setFood(target);
    const doesLike = Math.random() > 0.5;
    setLikesIt(doesLike);
    
    // Slight delay to allow render
    setTimeout(() => {
      sounds.speak(`Do you like ${target.word}?`);
    }, 500);
  }, []);

  const handleSelect = (isYes: boolean) => {
    // If the image shows they like it, the correct answer is Yes
    if (isYes === likesIt) {
      onComplete(true);
    } else {
      sounds.playError();
    }
  };

  const playAudio = () => {
    sounds.speak(`Do you like ${food?.word}?`);
  };

  if (!food) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center gap-8"
    >
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border-[6px] border-[#FFD23F] flex flex-col items-center justify-center relative overflow-hidden w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
        <div className="absolute top-4 left-6 text-sm font-black text-[#D4AF37] opacity-80 tracking-wider">ANSWER THE QUESTION</div>
        
        <div className="mt-8 bg-gradient-to-r from-[#A06CD5] to-[#7251B5] text-white px-8 py-5 rounded-[24px] text-center relative max-w-lg w-full flex items-center justify-between border-b-[6px] border-purple-800 shadow-lg">
          <button 
            onClick={playAudio}
            className="p-4 mb-2 bg-gradient-to-b from-[#FFD23F] to-[#FFC000] rounded-[20px] shadow-xl text-[#4A1D34] font-bold border-b-[6px] border-amber-600 active:border-b-[0px] active:translate-y-[6px] transition-all"
          >
            <Volume2 className="w-8 h-8" strokeWidth={3} />
          </button>
          
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#8B5BB8] rotate-45"></div>
          <p className="text-3xl font-black leading-tight uppercase flex-1 text-center tracking-wide">
            Do you like <br/>
            <span className="text-[#FFD23F] italic inline-block mt-1 drop-shadow-md bg-purple-900/40 px-4 py-1 rounded-full">{food.word}?</span>
          </p>
        </div>
      </div>

      {/* Profile with thought bubble */}
      <div className="flex flex-col items-center relative mt-8 z-10 group">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-white rounded-full shadow-xl border-[6px] border-dashed border-[#A06CD5] flex items-center justify-center text-[60px] animate-bounce z-20">
          <span className="drop-shadow-md">{food.emoji}</span>
          {/* Connector circles for thought bubble */}
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white border-4 border-dashed border-[#A06CD5] rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-4 h-4 bg-white border-2 border-dashed border-[#A06CD5] rounded-full"></div>
        </div>
        
        <div className="text-[120px] drop-shadow-2xl z-10 transition-transform group-hover:scale-110">
          {likesIt ? '👧🏻😊' : '👦🏽🤢'}
        </div>
      </div>

      {/* Answer Options */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 max-w-3xl">
        <button
          onClick={() => handleSelect(true)}
          className="w-full sm:w-1/2 bg-gradient-to-b from-[#D4F5D4] to-[#B5E6B5] rounded-[30px] p-6 text-center border-[6px] border-[#2D5A27] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-[#2D5A27] relative group border-b-[8px] flex flex-col items-center gap-2"
        >
          <span className="text-4xl">😋</span>
          <span className="text-3xl font-black tracking-wide uppercase">Yes, I do.</span>
        </button>
        
        <button
          onClick={() => handleSelect(false)}
          className="w-full sm:w-1/2 bg-gradient-to-b from-[#FFD6E0] to-[#FFB0C2] rounded-[30px] p-6 text-center border-[6px] border-[#A01A31] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-[#A01A31] relative group border-b-[8px] flex flex-col items-center gap-2"
        >
          <span className="text-4xl">🤢</span>
          <span className="text-3xl font-black tracking-wide uppercase">No, I don't.</span>
        </button>
      </div>

    </motion.div>
  );
}
