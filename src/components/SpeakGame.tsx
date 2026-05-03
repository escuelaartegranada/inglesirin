import React, { useState, useEffect, useRef } from 'react';
import { getRandomFood } from '../data/foods';
import { motion } from 'motion/react';
import { sounds } from '../lib/sounds';
import { Mic, MicOff, SkipForward } from 'lucide-react';

interface Props {
  onComplete: (won: boolean) => void;
  key?: string | number;
}

export default function SpeakGame({ onComplete }: Props) {
  const [food, setFood] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [feedback, setFeedback] = useState("Press the mic and say the word!");
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const target = getRandomFood();
    setFood(target);

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSupported(false);
      setFeedback("Oh no! Microphone is not supported here.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Standard English for detection

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening... 👂");
      sounds.playPop();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Heard:', transcript);
      
      // Simple verification (allowing some leeway for homophones or kid speech could be added here)
      if (transcript.includes(target.word)) {
        setFeedback(`You said: "${transcript}" - Great!`);
        setIsListening(false);
        setTimeout(() => onComplete(true), 1500);
      } else {
        setFeedback(`You said: "${transcript}". Try again!`);
        setIsListening(false);
        sounds.playError();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setFeedback("Oops, couldn't hear you. Try again!");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!food) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center gap-8"
    >
      <div className="bg-gradient-to-r from-[#FFD23F] to-[#FFC000] rounded-full flex items-center justify-center px-10 py-5 shadow-xl border-[6px] border-white w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
        <span className="font-black text-[#4A1D34] text-2xl uppercase tracking-widest drop-shadow-sm">Speaking Mission</span>
      </div>

      <div className="bg-white p-10 rounded-full shadow-2xl flex items-center justify-center border-[12px] border-[#FFF0F3] w-64 h-64 relative group">
        <div className="absolute inset-0 bg-yellow-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="text-[140px] drop-shadow-2xl group-hover:scale-110 transition-transform">
          {food.emoji}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md px-10 py-6 rounded-[30px] border-[6px] border-dashed border-[#A06CD5] shadow-xl relative mt-4">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-[4px] border-dashed border-[#A06CD5] rotate-45"></div>
        <div className="font-black text-2xl text-[#4A1D34] uppercase tracking-wider text-center flex items-center justify-center min-h-[40px]">
          {feedback}
        </div>
      </div>

      {supported ? (
        <div className={`w-full max-w-md rounded-[40px] p-8 flex flex-col items-center justify-center gap-6 shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-b border-b-[10px] ${isListening ? 'from-[#FF4D6D] to-[#D90429] border-red-900 scale-105' : 'from-[#A06CD5] to-[#7251B5] border-purple-900'}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMicClick}
            className={`w-28 h-28 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm border-[4px] border-white/30 shadow-inner overflow-hidden relative ${isListening ? 'animate-pulse' : ''}`}
          >
            {isListening && <div className="absolute inset-0 bg-red-400 opacity-50 animate-ping rounded-full"></div>}
            {isListening ? <MicOff className="w-14 h-14 relative z-10" /> : <Mic className="w-14 h-14 relative z-10 drop-shadow-md" />}
          </motion.button>
          
          <div className="flex flex-col items-center">
            <div className="text-white/80 text-sm font-black tracking-widest uppercase mb-1 drop-shadow-sm">
              {isListening ? 'Say loud and clear...' : 'Tap to Speak'}
            </div>
            <div className="text-white text-[40px] font-black italic uppercase tracking-wider drop-shadow-xl bg-black/10 px-8 py-2 rounded-full border-2 border-white/20">"{food.word}"</div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => onComplete(true)} // Skip if not supported but give points to not penalize
          className="px-10 py-5 bg-gradient-to-br from-[#FF85A1] to-[#FF4D6D] text-white rounded-full font-black text-xl shadow-xl flex items-center gap-3 border-b-[6px] border-pink-700 active:scale-95 uppercase tracking-wider hover:shadow-2xl"
        >
          <SkipForward className="w-8 h-8" strokeWidth={3} /> Skip Mission
        </button>
      )}
    </motion.div>
  );
}
