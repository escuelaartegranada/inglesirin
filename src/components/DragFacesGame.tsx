import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sounds } from '../lib/sounds';
import { getRandomFoods } from '../data/foods';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

const DraggableFace = ({ id, emoji }: { id: string, emoji: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-24 h-24 rounded-full bg-white border-4 border-gray-200 shadow-xl flex items-center justify-center text-6xl cursor-grab active:cursor-grabbing transition-shadow touch-none ${
        isDragging ? 'opacity-80 shadow-2xl scale-110' : ''
      }`}
    >
      {emoji}
    </button>
  );
};

const DroppableFood = ({ id, emoji, droppedFace }: { id: string, emoji: string, droppedFace: string | null }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-48 h-48 rounded-full flex justify-center flex-col items-center border-[6px] border-dashed transition-all ${
        isOver ? 'border-[#A06CD5] bg-purple-100 scale-105' : 'border-[#FFB8D1] bg-white'
      }`}
    >
      <div className="text-8xl">{emoji}</div>
      {droppedFace && (
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center text-5xl shadow-lg z-10 animate-in zoom-in duration-300">
          {droppedFace}
        </div>
      )}
    </div>
  );
};

export default function DragFacesGame({ onComplete }: Props) {
  const [foods, setFoods] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likesIt, setLikesIt] = useState(true);
  const [droppedFace, setDroppedFace] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    setFoods(getRandomFoods(3));
  }, []);

  useEffect(() => {
    if (foods.length > 0 && currentIndex < foods.length) {
      setDroppedFace(null);
      const isLike = Math.random() > 0.5;
      setLikesIt(isLike);
      
      const text = isLike 
        ? `I like ${foods[currentIndex].word}` 
        : `I don't like ${foods[currentIndex].word}`;
        
      setTimeout(() => {
        sounds.speak(text);
      }, 500);
    }
  }, [currentIndex, foods]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'dropzone') {
      const isLikeDropped = active.id === 'like';
      
      if (isLikeDropped === likesIt) {
        sounds.playTone(600, 'sine', 0.1);
        sounds.playTone(800, 'sine', 0.15);
        setDroppedFace(isLikeDropped ? '😋' : '🤢');
        
        setTimeout(() => {
          if (currentIndex < foods.length - 1) {
            setCurrentIndex(i => i + 1);
          } else {
            sounds.playTone(500, 'sine', 0.1);
            sounds.playTone(600, 'sine', 0.1);
            sounds.playTone(700, 'sine', 0.2);
            onComplete(true);
          }
        }, 1500);
      } else {
        sounds.playTone(300, 'sawtooth', 0.2);
      }
    }
  };

  if (foods.length === 0 || currentIndex >= foods.length) return null;

  const currentFood = foods[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-8"
    >
      <div className="bg-white/80 p-6 rounded-3xl backdrop-blur-sm border-4 border-white shadow-xl flex items-center justify-center relative">
        <button 
          onClick={() => sounds.speak(likesIt ? `I like ${currentFood.word}` : `I don't like ${currentFood.word}`)}
          className="absolute -left-6 -top-6 w-16 h-16 bg-[#A06CD5] text-white rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110 active:scale-95 transition-transform"
        >
          🔊
        </button>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-20 items-center mt-6">
            <div className="flex flex-col gap-8">
              <DraggableFace id="like" emoji="😋" />
              <DraggableFace id="dislike" emoji="🤢" />
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-xl font-bold text-[#8B5BB8] uppercase animate-pulse">
                Arrastra la cara correcta
              </p>
              <DroppableFood 
                id="dropzone" 
                emoji={currentFood.emoji} 
                droppedFace={droppedFace}
              />
            </div>
          </div>
        </DndContext>
      </div>
    </motion.div>
  );
}
