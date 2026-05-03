import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/sounds';
import { FOODS } from '../data/foods';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function LessonScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [foods, setFoods] = useState<typeof FOODS>([]);

  useEffect(() => {
    // Select 4 random foods to teach
    const shuffled = [...FOODS].sort(() => 0.5 - Math.random());
    setFoods(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    if (foods.length > 0 && step < foods.length) {
      setTimeout(() => {
        sounds.speak(foods[step].word);
      }, 500);
    }
  }, [step, foods]);

  if (foods.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-3xl mx-auto"
    >
      <div className="bg-white/90 p-8 rounded-[40px] border-[6px] border-[#8B5BB8] shadow-2xl relative overflow-hidden w-full text-center">
        <h2 className="text-3xl font-black text-[#A06CD5] mb-8 uppercase tracking-widest">
          ¡Aprende con nosotros!
        </h2>

        {step < foods.length ? (
          <div className="flex flex-col items-center space-y-6">
            <motion.div 
              key={step}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-48 h-48 bg-purple-50 rounded-full border-8 border-[#FFB8D1] flex items-center justify-center text-8xl shadow-inner"
            >
              {foods[step].emoji}
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-5xl font-bold text-[#4A1D34] capitalize">
                {foods[step].word}
              </h3>
              <p className="text-2xl font-medium text-gray-500">
                En español: <span className="text-[#8B5BB8] font-bold">{foods[step].translation}</span>
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => sounds.speak(foods[step].word)}
                className="px-6 py-3 bg-[#FF9CEE] text-white rounded-full font-bold text-lg hover:bg-pink-500 active:scale-95 transition-all shadow-lg"
              >
                🔊 Escuchar de nuevo
              </button>
              <button
                onClick={() => {
                  sounds.playTone(600, 'sine', 0.1);
                  setStep(s => s + 1);
                }}
                className="px-8 py-3 bg-[#A06CD5] text-white rounded-full font-bold text-lg hover:bg-purple-600 active:scale-95 transition-all shadow-lg"
              >
                Siguiente ➡
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-4xl font-bold text-[#4A1D34] mb-4">
              ¡Gramática!
            </h3>
            <div className="bg-purple-50 p-6 rounded-2xl border-4 border-purple-200 text-left space-y-4 text-xl text-gray-700 w-full">
              <p>😀 <strong className="text-pink-500">I like</strong> = Me gusta</p>
              <p>🙁 <strong className="text-blue-500">I don't like</strong> = No me gusta</p>
              <p>🔄 <strong className="text-orange-500">but</strong> = pero</p>
              <p className="text-sm font-bold text-gray-800 bg-white p-3 rounded-xl border border-purple-100">
                Ejemplo: I like pizza <span className="text-orange-500">but</span> I don't like fish.
                <br/>
                <span className="text-gray-500 font-normal">(Me gusta la pizza pero no me gusta el pescado.)</span>
              </p>
              <p>🤔 <strong className="text-purple-500">Do you like...?</strong> = ¿Te gusta...?</p>
              <p>✅ <strong className="text-green-500">Yes, I do.</strong> = Sí, me gusta.</p>
              <p>❌ <strong className="text-red-500">No, I don't.</strong> = No, no me gusta.</p>
            </div>
            
            <button
              onClick={() => onComplete(true)}
              className="mt-8 px-10 py-4 bg-green-500 text-white rounded-full font-black text-2xl hover:bg-green-600 active:scale-95 transition-all shadow-xl hover:shadow-green-500/50"
            >
              ¡A Jugar! 🎮
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
