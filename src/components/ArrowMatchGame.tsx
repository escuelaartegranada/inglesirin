import { useState, useRef, useEffect, RefObject } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../lib/sounds';
import { getRandomFoods } from '../data/foods';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function ArrowMatchGame({ onComplete }: Props) {
  const [leftItems, setLeftItems] = useState<any[]>([]);
  const [rightItems, setRightItems] = useState<any[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // leftId -> rightId
  
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [lines, setLines] = useState<{ id: string, x1: number, y1: number, x2: number, y2: number }[]>([]);

  useEffect(() => {
    // Pick 4 random foods
    const foods = getRandomFoods(4);
    
    // Left items are words or audio, Right items are emojis
    setLeftItems([...foods].sort(() => 0.5 - Math.random()));
    setRightItems([...foods].sort(() => 0.5 - Math.random()));
  }, []);

  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const newLines = Object.entries(matches).map(([leftId, rightId]) => {
      const leftEl = leftRefs.current[leftId];
      const rightEl = rightRefs.current[rightId];
      
      if (!leftEl || !rightEl) return null;
      
      const lRect = leftEl.getBoundingClientRect();
      const rRect = rightEl.getBoundingClientRect();
      
      return {
        id: `${leftId}-${rightId}`,
        x1: lRect.right - containerRect.left,
        y1: lRect.top + lRect.height / 2 - containerRect.top,
        x2: rRect.left - containerRect.left,
        y2: rRect.top + rRect.height / 2 - containerRect.top,
      };
    }).filter(Boolean) as any[];
    
    setLines(newLines);
  };

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [matches]);

  const handleLeftClick = (id: string) => {
    if (matches[id]) return; // Already matched
    
    setSelectedLeft(id);
    const food = leftItems.find(f => f.id === id);
    if (food) sounds.speak(food.word);
  };

  const handleRightClick = (id: string) => {
    if (!selectedLeft) return; // Must select left first
    if (Object.values(matches).includes(id)) return; // Already matched
    
    if (selectedLeft === id) {
      // Match!
      sounds.playTone(600, 'sine', 0.1);
      setMatches(prev => {
        const newMatches = { ...prev, [selectedLeft]: id };
        // Check win
        if (Object.keys(newMatches).length === leftItems.length) {
          setTimeout(() => {
            sounds.playTone(500, 'sine', 0.1);
            setTimeout(() => sounds.playTone(600, 'sine', 0.1), 100);
            setTimeout(() => sounds.playTone(800, 'sine', 0.2), 200);
            onComplete(true);
          }, 1000);
        }
        return newMatches;
      });
      setSelectedLeft(null);
    } else {
      // Try again
      sounds.playTone(300, 'sawtooth', 0.2);
      setSelectedLeft(null);
    }
  };

  if (leftItems.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center w-full max-w-4xl mx-auto gap-8"
    >
      <div className="bg-white/80 p-6 md:p-8 rounded-[40px] border-[6px] border-[#A06CD5] shadow-xl w-full text-center relative backdrop-blur-md">
        <h2 className="text-2xl md:text-3xl font-black text-[#8B5BB8] uppercase tracking-widest mb-2">
          ¡Une las parejas!
        </h2>
        <p className="text-lg font-bold text-gray-500">
          Toca una palabra y luego su imagen.
        </p>
      </div>

      <div 
        ref={containerRef}
        className="w-full bg-white/60 backdrop-blur-md rounded-[40px] p-8 border-4 border-white shadow-xl relative min-h-[400px] flex justify-between"
      >
        {/* SVG layer for lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lines.map(line => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#A06CD5"
              strokeWidth="6"
              strokeLinecap="round"
              className="animate-in fade-in duration-300"
            />
          ))}
        </svg>

        {/* Left Column (Words) */}
        <div className="flex flex-col gap-6 w-1/3 z-20">
          {leftItems.map((food) => (
            <button
              key={`left-${food.id}`}
              ref={(el) => { leftRefs.current[food.id] = el; }}
              onClick={() => handleLeftClick(food.id)}
              disabled={!!matches[food.id]}
              className={`h-20 bg-white rounded-2xl border-4 text-2xl font-bold uppercase transition-all shadow-md flex items-center justify-center px-4 ${
                matches[food.id] 
                  ? 'border-gray-200 text-gray-400 bg-gray-50' 
                  : selectedLeft === food.id 
                    ? 'border-[#A06CD5] bg-purple-50 scale-105 shadow-xl text-[#8B5BB8]' 
                    : 'border-[#FFB8D1] text-[#4A1D34] hover:border-pink-400 hover:scale-105 active:scale-95'
              }`}
            >
              {food.word}
            </button>
          ))}
        </div>

        {/* Right Column (Images) */}
        <div className="flex flex-col gap-6 w-1/4 z-20">
          {rightItems.map((food) => (
            <button
              key={`right-${food.id}`}
              ref={(el) => { rightRefs.current[food.id] = el; }}
              onClick={() => handleRightClick(food.id)}
              disabled={Object.values(matches).includes(food.id)}
              className={`h-20 aspect-square bg-white rounded-full border-4 text-5xl transition-all shadow-md flex items-center justify-center mx-auto ${
                Object.values(matches).includes(food.id)
                  ? 'border-gray-200 grayscale opacity-50 bg-gray-50'
                  : selectedLeft 
                    ? 'border-[#6BC589] hover:bg-green-50 scale-105 shadow-xl cursor-pointer animate-pulse' 
                    : 'border-[#FFB8D1] cursor-default'
              }`}
            >
              {food.emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
