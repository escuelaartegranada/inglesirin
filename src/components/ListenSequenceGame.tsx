import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getRandomFoods } from '../data/foods';
import { sounds } from '../lib/sounds';
import { Volume2 } from 'lucide-react';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function ListenSequenceGame({ onComplete }: Props) {
  const [sequence, setSequence] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [gameMode, setGameMode] = useState<'missing' | 'repeated'>('missing');
  const [targetFood, setTargetFood] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  useEffect(() => {
    // Generate a sequence of 4 foods
    const foods = getRandomFoods(5);
    const target = foods[0];
    const sequenceFoods = foods.slice(1, 5); // 4 foods
    
    const mode = Math.random() > 0.5 ? 'missing' : 'repeated';
    setGameMode(mode);
    setTargetFood(target);

    let finalSequence = [];
    if (mode === 'missing') {
      // It's missing from the visible list, so they hear 4 things, but see 5 on screen?
      // Wait, let's make it simpler:
      // You hear 3 foods. One is missing from the options provided. No, that's reading.
      // "Listen and find what's missing".
      // They see 4 images. They hear 3 words. What's missing?
      
      // Target is what's on screen but NOT spoken.
      finalSequence = [sequenceFoods[0], sequenceFoods[1], sequenceFoods[2]];
      
      setOptions([...finalSequence, target].sort(() => 0.5 - Math.random()));
    } else {
      // What's repeated?
      // They hear 4 words, one is repeated.
      // Target is what is repeated.
      finalSequence = [sequenceFoods[0], target, sequenceFoods[1], target].sort(() => 0.5 - Math.random());
      
      // Options: a mix of foods
      setOptions([...new Set(finalSequence), foods[4]].sort(() => 0.5 - Math.random()));
    }

    setSequence(finalSequence);

  }, []);

  const playSequence = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setHasListened(false);
    
    // Play instruction based on mode
    sounds.speak(gameMode === 'missing' ? "What's missing?" : "What's repeated?");
    await new Promise(r => setTimeout(r, 2000));
    
    for (let i = 0; i < sequence.length; i++) {
      sounds.speak(sequence[i].word);
      await new Promise(r => setTimeout(r, 1500));
    }
    
    setHasListened(true);
    setIsPlaying(false);
  };

  const handleSelect = (food: any) => {
    if (food.id === targetFood.id) {
      onComplete(true);
    } else {
      sounds.playError();
    }
  };

  if (!targetFood) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center gap-6 md:gap-8 max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border-[6px] border-[#4A1D34] flex flex-col items-center justify-center relative overflow-hidden w-full transform hover:scale-[1.02] transition-transform">
        <div className="absolute top-4 left-6 text-sm md:text-base font-black text-[#4A1D34] opacity-60 tracking-wider">LISTENING CHALLENGE</div>
        
        <div className="mt-8 md:mt-10 bg-gradient-to-r from-[#A06CD5] to-[#7251B5] text-white px-6 py-5 rounded-[24px] text-center relative w-full flex flex-col md:flex-row items-center justify-center gap-4 border-b-[6px] border-purple-800 shadow-lg">
          <button 
            onClick={playSequence}
            disabled={isPlaying}
            className={`p-6 bg-gradient-to-b from-[#FFD23F] to-[#FFC000] rounded-full shadow-xl text-[#4A1D34] font-bold border-b-[6px] border-amber-600 transition-all ${isPlaying ? 'opacity-70 scale-95 border-b-0 translate-y-[6px]' : 'active:border-b-[0px] active:translate-y-[6px] hover:scale-105'}`}
          >
            <Volume2 className={`w-10 h-10 ${isPlaying ? 'animate-pulse' : ''}`} strokeWidth={3} />
          </button>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-3xl md:text-4xl font-black leading-tight uppercase tracking-wide">
              {gameMode === 'missing' ? "What's missing?" : "What's repeated?"}
            </p>
            <p className="text-purple-200 font-bold uppercase tracking-widest text-sm md:text-base">Listen carefully!</p>
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="w-full bg-white/80 p-6 md:p-8 rounded-[40px] border-[6px] border-dashed border-[#A06CD5] backdrop-blur-md shadow-xl flex flex-col items-center gap-6 min-h-[300px] justify-center">
        {!hasListened ? (
          <div className="text-center space-y-4">
            <p className="text-2xl font-black text-[#8B5BB8] uppercase animate-pulse">
              {isPlaying ? "Listening..." : "Tap play to hear the words!"}
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-black text-[#4A1D34] uppercase text-xl md:text-2xl tracking-widest">Select the correct food:</h3>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full animate-in fade-in zoom-in duration-500">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 md:border-[6px] border-[#FFB8D1] shadow-xl flex items-center justify-center text-[50px] md:text-[70px] relative overflow-hidden group-hover:border-pink-500 group-hover:shadow-pink-300/50 group-hover:shadow-2xl transition-all">
                    <div className="absolute inset-0 bg-[#FFB8D1] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <span className="drop-shadow-md group-hover:scale-110 transition-transform">{opt.emoji}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
