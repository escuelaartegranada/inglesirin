import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { sounds } from '../lib/sounds';
import { getRandomFoods } from '../data/foods';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

const DraggableItem = ({ food, isDragging, key }: { food: any, isDragging?: boolean, key?: string | number }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: isSelfDragging } = useDraggable({
    id: food.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isSelfDragging ? 50 : 1,
  } : undefined;

  // Render a placeholder when this item is dragging from the list
  if (isDragging && !isSelfDragging) return null;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] border-4 border-[#FFB8D1] flex items-center justify-center text-5xl md:text-7xl shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
        isSelfDragging ? 'opacity-80 scale-110 shadow-2xl z-50' : ''
      }`}
    >
      {food.emoji}
    </button>
  );
};

const DroppableBucket = ({ id, type, items }: { id: string, type: 'like' | 'dislike', items: any[] }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const isLike = type === 'like';

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full md:w-64 h-48 md:h-64 rounded-[30px] border-[6px] border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
        isOver ? 'scale-105 border-white bg-white/50' : 'border-white/50 bg-white/30'
      }`}
    >
      <div className="absolute top-2 left-2 text-3xl">
        {isLike ? '😋 I like' : "🤢 I don't like"}
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-2 mt-8 z-10">
        {items.map(f => (
          <div key={f.id} className="text-5xl md:text-6xl animate-in zoom-in">{f.emoji}</div>
        ))}
      </div>
    </div>
  );
};

export default function AndButGame({ onComplete }: Props) {
  const [foods, setFoods] = useState<any[]>([]);
  const [likeFood, setLikeFood] = useState<any>(null);
  const [dislikeFood, setDislikeFood] = useState<any>(null);
  
  const [likedBucket, setLikedBucket] = useState<any[]>([]);
  const [dislikedBucket, setDislikedBucket] = useState<any[]>([]);
  
  const [sentencePhrase, setSentencePhrase] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Pick 4 random foods
    const selected = getRandomFoods(4);
    setFoods(selected);
    
    // Pick 1 to like, 1 to dislike
    const f1 = selected[0];
    const f2 = selected[1];
    
    setLikeFood(f1);
    setDislikeFood(f2);
    
    // Grammar form: "I like X but I don't like Y" OR "I don't like X but I like Y"
    const isFirstLike = Math.random() > 0.5;
    
    let text = '';
    if (isFirstLike) {
      text = `I like ${f1.word} but I don't like ${f2.word}`;
    } else {
      text = `I don't like ${f2.word} but I like ${f1.word}`;
    }
    
    setSentencePhrase(text);
    
    setTimeout(() => {
      playAudio(text);
    }, 500);
  }, []);

  const playAudio = (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    sounds.speak(text);
    setTimeout(() => setIsPlaying(false), 2500); // rough duration
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const foodId = active.id;
      const bucketId = over.id; // 'bucket-like' or 'bucket-dislike'
      
      const draggedFood = foods.find(f => f.id === foodId);
      if (!draggedFood) return;
      
      // Check correctness
      if (bucketId === 'bucket-like' && foodId === likeFood.id) {
        sounds.playTone(600, 'sine', 0.1);
        setLikedBucket(prev => [...prev, draggedFood]);
        checkWinCondition(1, 0); // Need to effectively pass the updated lengths
      } else if (bucketId === 'bucket-dislike' && foodId === dislikeFood.id) {
        sounds.playTone(600, 'sine', 0.1);
        setDislikedBucket(prev => [...prev, draggedFood]);
        checkWinCondition(0, 1);
      } else {
        sounds.playTone(300, 'sawtooth', 0.2);
      }
    }
  };

  const checkWinCondition = (addLike: number, addDislike: number) => {
    if (likedBucket.length + addLike === 1 && dislikedBucket.length + addDislike === 1) {
      setIsSuccess(true);
      sounds.playTone(500, 'sine', 0.1);
      setTimeout(() => sounds.playTone(600, 'sine', 0.1), 100);
      setTimeout(() => sounds.playTone(800, 'sine', 0.2), 200);
      
      setTimeout(() => {
        onComplete(true);
      }, 2000);
    }
  };

  if (foods.length === 0 || !likeFood) return null;

  const availableFoods = foods.filter(f => 
    !likedBucket.find(l => l.id === f.id) && !dislikedBucket.find(d => d.id === f.id)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full max-w-5xl mx-auto gap-8"
    >
      {/* Header / Audio button */}
      <div className="bg-white/80 p-6 md:p-8 rounded-[40px] border-[6px] border-[#A06CD5] shadow-xl w-full text-center relative overflow-hidden backdrop-blur-md">
        <h2 className="text-3xl font-black text-[#8B5BB8] uppercase tracking-widest mb-4">
          ¡Escucha y clasifica!
        </h2>
        
        <button
          onClick={() => playAudio(sentencePhrase)}
          className={`px-8 py-4 rounded-full font-black text-2xl transition-all shadow-xl flex items-center justify-center mx-auto gap-4 ${
            isPlaying ? 'bg-pink-300 text-white scale-95' : 'bg-[#FF9CEE] text-white hover:bg-pink-500 hover:scale-105 active:scale-95'
          }`}
        >
          🔊 {isPlaying ? 'Escuchando...' : 'Escuchar de nuevo'}
        </button>

        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 bg-[#A06CD5]/90 backdrop-blur-sm flex items-center justify-center z-50 text-white text-5xl font-black"
          >
            ¡Perfecto! 🎉
          </motion.div>
        )}
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        {/* Buckets */}
        <div className="flex flex-col md:flex-row gap-6 w-full px-4">
          <div className="flex-1 bg-[#8FDAA8] rounded-[40px] p-4 md:p-6 shadow-xl border-b-8 border-[#6BC589]">
            <DroppableBucket id="bucket-like" type="like" items={likedBucket} />
          </div>
          <div className="flex-1 bg-[#FF8E8E] rounded-[40px] p-4 md:p-6 shadow-xl border-b-8 border-[#E56B6B]">
            <DroppableBucket id="bucket-dislike" type="dislike" items={dislikedBucket} />
          </div>
        </div>

        {/* Tray */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-[40px] border-4 border-white/50 w-full flex justify-center gap-4 md:gap-8 flex-wrap">
          {availableFoods.map(food => (
            <DraggableItem key={food.id} food={food} />
          ))}
        </div>
      </DndContext>
    </motion.div>
  );
}
