import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { getRandomFood } from '../data/foods';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/sounds';
import { Volume2 } from 'lucide-react';

interface Props {
  onComplete: (won: boolean) => void;
}

const DraggableFood = ({ id, emoji, isDragging }: { id: string, emoji: string, isDragging: boolean }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`text-[120px] cursor-grab active:cursor-grabbing touch-none transition-transform drop-shadow-2xl ${isDragging ? 'scale-125 z-50 drop-shadow-3xl' : 'z-10 hover:scale-[1.15]'}`}
    >
      {emoji}
    </div>
  );
}

const DroppableFace = ({ id, active, type }: { id: string, active: boolean, type: 'like' | 'dislike' }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const isLike = type === 'like';
  const face = isLike ? '😋' : '🤢';
  const text = isLike ? 'YES, I DO!' : "NO, I DON'T!";

  return (
    <div className={`flex flex-col items-center gap-4 transition-all duration-300 ${isOver ? 'scale-110 -translate-y-4' : 'hover:scale-105'}`} ref={setNodeRef}>
      <div
        className={`w-44 h-44 rounded-full flex items-center justify-center text-[90px] border-[8px] border-white shadow-2xl ${
          isLike ? (isOver ? 'bg-[#98f598] scale-110' : 'bg-[#D4F5D4]') : (isOver ? 'bg-[#ffb0c2] scale-110' : 'bg-[#FFD6E0]')
        }`}
      >
        <span className="drop-shadow-md">{face}</span>
      </div>
      <div className={`bg-white px-8 py-3 rounded-full font-black shadow-lg border-[4px] tracking-wider text-xl uppercase ${
        isLike ? 'text-[#2D5A27] border-green-200' : 'text-[#A01A31] border-pink-200'
      }`}>
        {text}
      </div>
    </div>
  );
}

export default function LikeGame({ onComplete }: Props) {
  const [food, setFood] = useState<any>(null);
  const [likesIt, setLikesIt] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const target = getRandomFood();
    setFood(target);
    const doesLike = Math.random() > 0.5;
    setLikesIt(doesLike);
    
    const phrase = doesLike ? `I like ${target.word}` : `I don't like ${target.word}`;
    
    // Slight delay to allow render
    setTimeout(() => {
      sounds.speak(phrase);
    }, 500);
  }, []);

  const handleDragStart = (e: any) => {
    setActiveId(e.active.id);
    sounds.playPop();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { over } = event;

    if (over) {
      const correctTargetId = likesIt ? 'likeZone' : 'dislikeZone';
      if (over.id === correctTargetId) {
        onComplete(true);
      } else {
        sounds.playError();
      }
    }
  };

  // Re-play audio button feature
  const playAudio = () => {
    const phrase = likesIt ? `I like ${food?.word}` : `I don't like ${food?.word}`;
    sounds.speak(phrase);
  };

  if (!food) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, rotate: -5 }}
      animate={{ opacity: 1, rotate: 0 }}
      className="w-full flex flex-col items-center gap-8"
    >
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border-[6px] border-[#FFB8D1] flex flex-col items-center justify-center relative overflow-hidden w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
        <div className="absolute top-4 left-6 text-sm font-black text-[#FF85A1] opacity-60 tracking-wider">QUESTION TIME</div>
        
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

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* The Food item to drag */}
        <div className="h-56 w-56 flex items-center justify-center bg-white rounded-full shadow-2xl border-[12px] border-[#FFF0F3] z-50 mt-4 relative group">
          <div className="absolute inset-0 bg-[#FFB8D1] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <DraggableFood id="foodItem" emoji={food.emoji} isDragging={activeId === 'foodItem'} />
        </div>

        {/* The Dropzones */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-[40px] p-8 border-[6px] border-dashed border-[#A06CD5] flex items-center justify-around shadow-2xl max-w-2xl mt-4">
          <DroppableFace id="likeZone" type="like" active={activeId !== null} />
          
          <div className="h-32 w-[4px] bg-[#A06CD5] opacity-20 rounded-full"></div>

          <DroppableFace id="dislikeZone" type="dislike" active={activeId !== null} />
        </div>
      </DndContext>
    </motion.div>
  );
}
