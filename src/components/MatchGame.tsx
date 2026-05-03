import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { getRandomFoods } from '../data/foods';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/sounds';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

const DraggableWord = ({ id, word, isDragging }: { id: string, word: string, isDragging: boolean }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`px-10 py-5 bg-gradient-to-r from-[#FFD23F] to-[#FFC000] rounded-full shadow-xl border-[6px] border-white font-black text-[#4A1D34] text-4xl uppercase tracking-widest cursor-grab active:cursor-grabbing transition-shadow ${isDragging ? 'opacity-80 scale-105 shadow-2xl' : 'opacity-100'} touch-none`}
    >
      {word}
    </div>
  );
}

const DroppableImage = ({ id, emoji, color }: { id: string, emoji: string, color: string, key?: string | number }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-44 h-44 bg-white rounded-[40px] border-[8px] border-[#FFF0F3] ${isOver ? 'border-[#FFB8D1] scale-110 bg-pink-50' : 'hover:scale-105'} flex items-center justify-center text-[90px] shadow-lg transition-all`}
    >
      <span className="drop-shadow-md">{emoji}</span>
    </div>
  );
}

export default function MatchGame({ onComplete }: Props) {
  const [targetWord, setTargetWord] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Select 3 random foods
    const foods = getRandomFoods(3);
    setOptions(foods);
    // Pick one as the target word
    const target = foods[Math.floor(Math.random() * foods.length)];
    setTargetWord(target);
    
    // Play the word sound
    setTimeout(() => sounds.speak(target.word), 500);
  }, []);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    sounds.playPop();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && over.id === targetWord.id) {
      // Success!
      onComplete(true);
    } else if (over) {
      // Wrong drop
      sounds.playError();
      // Optional: don't end game immediately, let them try again?
      // Since it's for 1st grade, let's just make it wobble and let them try again.
    }
  };

  if (!targetWord) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center gap-8"
    >
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border-[6px] border-[#FFB8D1] flex flex-col items-center justify-center relative overflow-hidden w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
        <div className="absolute top-4 left-6 text-sm font-black text-[#FF85A1] opacity-60 tracking-wider">MISSION: MATCH & LEARN</div>
        <div className="mt-8 bg-[#A06CD5] text-white px-8 py-5 rounded-[24px] text-center relative max-w-md w-full border-b-[6px] border-purple-800 shadow-lg">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#A06CD5] rotate-45"></div>
          <p className="text-3xl font-black leading-tight uppercase font-sans tracking-wide">Find the corresponding image!</p>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="w-full bg-white/80 rounded-[40px] p-10 border-[6px] border-dashed border-[#A06CD5] flex flex-col items-center gap-14 shadow-2xl max-w-2xl backdrop-blur-sm">
          
          {/* The Word to Drag */}
          <div className="flex justify-center z-10 w-full relative">
            <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent -z-10"></div>
            <DraggableWord id={targetWord.id} word={targetWord.word} isDragging={activeId === targetWord.id} />
          </div>

          {/* The Image Dropzones */}
          <div className="flex gap-8 flex-wrap justify-around w-full bg-purple-50/50 p-6 rounded-[30px]">
            {options.map((opt) => (
              <DroppableImage key={opt.id} id={opt.id} emoji={opt.emoji} color={opt.color} />
            ))}
          </div>
        </div>
      </DndContext>
    </motion.div>
  );
}
