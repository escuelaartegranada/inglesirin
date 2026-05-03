import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from './lib/sounds';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import MatchGame from './components/MatchGame';
import SpellGame from './components/SpellGame';
import QuestionGame from './components/QuestionGame';
import StatementGame from './components/StatementGame';
import SpeakGame from './components/SpeakGame';
import ListenSequenceGame from './components/ListenSequenceGame';
import LessonScreen from './components/LessonScreen';
import DragFacesGame from './components/DragFacesGame';
import AndButGame from './components/AndButGame';
import ArrowMatchGame from './components/ArrowMatchGame';
import SentenceBuilderGame from './components/SentenceBuilderGame';

type GameMode = 'lesson' | 'match' | 'spell' | 'arrowMatch' | 'listen' | 'dragFaces' | 'statement' | 'question' | 'andBut' | 'sentenceBuilder' | 'speak';

const MIXED_CURRICULUM: Array<GameMode> = Array.from({ length: 200 }, (_, i) => {
  if (i === 0) return 'lesson';
  if (i < 4) return 'match';
  if (i < 7) return i % 2 === 0 ? 'arrowMatch' : 'spell';
  if (i === 7) return 'lesson';
  if (i < 12) return i % 2 === 0 ? 'dragFaces' : 'listen';
  if (i < 14) return 'andBut';
  if (i < 17) return i % 2 === 0 ? 'statement' : 'sentenceBuilder';
  if (i < 20) return i % 2 === 0 ? 'question' : 'speak';
  
  const cycle: GameMode[] = ['arrowMatch', 'dragFaces', 'sentenceBuilder', 'andBut', 'statement', 'listen', 'spell', 'match', 'question', 'speak'];
  if (i % 12 === 0) return 'lesson';
  return cycle[i % cycle.length];
});

const LESSONS_CURRICULUM: Array<GameMode> = Array.from({ length: 100 }, () => 'lesson');

export default function App() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [showCombo, setShowCombo] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'transition'>('start');
  const [key, setKey] = useState(0);
  const [playMode, setPlayMode] = useState<'mixed' | 'lessonsOnly'>('mixed');

  const currentCurriculum = playMode === 'mixed' ? MIXED_CURRICULUM : LESSONS_CURRICULUM;
  const gameMode = currentCurriculum[levelIndex % currentCurriculum.length];

  const startGame = (mode: 'mixed' | 'lessonsOnly') => {
    sounds.playPop();
    setScore(0);
    setCombo(1);
    setLevelIndex(0);
    setPlayMode(mode);
    setGameState('playing');
    setKey(k => k + 1);
  };

  useEffect(() => {
    if (gameState === 'transition') {
      const timer = setTimeout(() => {
        handleNextGame();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleComplete = (won: boolean) => {
    if (won) {
      const currentCombo = combo;
      const pointsEarned = 10 * currentCombo;
      
      setScore(s => s + pointsEarned);
      
      if (currentCombo > 1) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 2000);
      }
      
      setCombo(c => Math.min(c + 1, 5)); // Max combo x5
      
      sounds.playSuccess();
      confetti({
        particleCount: 150 + (currentCombo * 20),
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#8A2BE2', '#FFD700', '#00BFFF']
      });
      setGameState('transition');
    } else {
      setCombo(1); // Reset combo on mistake
      sounds.playError();
    }
  };

  const handleNextGame = () => {
    sounds.playPop();
    setLevelIndex(idx => idx + 1);
    setGameState('playing');
    setKey(k => k + 1);
  };

  const handleSkip = () => {
    sounds.playPop();
    setCombo(1);
    setLevelIndex(idx => idx + 1);
    setGameState('playing');
    setKey(k => k + 1);
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F3] to-[#FFE3E9] text-[#4A1D34] flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none text-4xl select-none">
          <div className="absolute top-[10%] left-[10%] animate-bounce delay-100">🎀</div>
          <div className="absolute top-[30%] right-[15%] animate-bounce delay-300">🦄</div>
          <div className="absolute bottom-[25%] left-[20%] animate-bounce delay-500">💖</div>
          <div className="absolute bottom-[40%] right-[10%] animate-bounce delay-700">✨</div>
          <div className="absolute top-[60%] left-[8%] animate-bounce delay-200">🍭</div>
          <div className="absolute top-[20%] left-[50%] animate-bounce delay-150">🍒</div>
        </div>

        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border-[6px] border-[#FFB8D1] text-center p-8 space-y-6 relative z-10 transform scale-105">
          <div className="flex justify-center">
            <div className="h-40 w-40 bg-[#FFF5F7] rounded-full border-[8px] border-[#FFB8D1] flex items-center justify-center text-[80px] shadow-inner relative">
              👧🏻
              <div className="absolute -top-4 -right-4 text-5xl">👑</div>
            </div>
          </div>
          <h1 className="text-5xl font-black text-[#A06CD5] tracking-tight uppercase drop-shadow-sm">Yummy <br/>English!</h1>
          <p className="text-xl text-[#FF85A1] font-bold uppercase tracking-widest bg-pink-50 inline-block px-4 py-2 rounded-full border-2 border-pink-100">Let's play!</p>
          <div className="flex flex-col gap-4 mt-4 w-full px-4">
            <button 
              onClick={() => startGame('mixed')}
              className="w-full py-5 px-8 bg-gradient-to-br from-[#FF85A1] to-[#FF4D6D] text-white rounded-full text-2xl font-black shadow-lg hover:shadow-xl shadow-pink-300 transform transition active:scale-95 hover:scale-[1.03] flex items-center justify-center gap-3 uppercase tracking-wide border-b-[6px] border-pink-700"
            >
              <Sparkles className="w-8 h-8 fill-yellow-300 text-yellow-300" /> ¡JUEGO COMPLETO!
            </button>
            <button 
              onClick={() => startGame('lessonsOnly')}
              className="w-full py-4 px-8 bg-gradient-to-br from-[#A06CD5] to-[#8B5BB8] text-white rounded-full text-xl font-bold shadow-lg hover:shadow-xl shadow-purple-300 transform transition active:scale-95 hover:scale-[1.03] flex items-center justify-center gap-3 uppercase tracking-wide border-b-[6px] border-purple-800"
            >
              📚 SOLO LECCIONES
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#FFF0F3] to-[#FFE3E9] text-[#4A1D34] flex flex-col font-sans overflow-hidden relative">
      {/* Background Sparkles */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none text-4xl select-none">
        <div className="absolute top-[15%] left-[5%] animate-pulse">🌸</div>
        <div className="absolute bottom-[10%] left-[8%] animate-pulse delay-150">🍓</div>
        <div className="absolute top-[40%] right-[5%] animate-pulse delay-300">🎀</div>
        <div className="absolute bottom-[20%] right-[8%] animate-pulse delay-500">✨</div>
      </div>

      {/* Header / Score Board */}
      <header className="h-20 w-full px-4 sm:px-8 flex items-center justify-between bg-white/70 backdrop-blur-md border-b-[4px] border-[#FFB8D1] sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="bg-[#FF85A1] text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 sm:gap-3 border-b-4 border-pink-600 relative">
            <span className="text-xl sm:text-2xl text-yellow-300 drop-shadow-sm">⭐</span>
            <span className="text-lg sm:text-xl tracking-tight uppercase font-black">{score}</span>
            {combo > 1 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3" /> x{combo}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[10px] sm:text-xs font-black text-[#A06CD5] uppercase tracking-widest bg-purple-100 px-4 py-1 rounded-full border-2 border-purple-200">
            Mission {levelIndex + 1} / {currentCurriculum.length}
          </div>
          <div className="w-32 sm:w-48 h-4 bg-gray-200 rounded-full mt-2 overflow-hidden border-2 border-white shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#A06CD5] to-[#FF85A1] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(5, ((levelIndex + 1) / currentCurriculum.length) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button onClick={handleSkip} className="px-4 py-2 bg-gradient-to-b from-purple-100 to-purple-200 text-purple-700 font-bold uppercase rounded-full shadow border-b-4 border-purple-300 active:scale-95 text-xs sm:text-sm tracking-wider">
            Skip ⏭️
          </button>
        </div>
      </header>

      {/* Dynamic Combo Popup Animation */}
      {showCombo && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] animate-[bounce_0.5s_ease-in-out_infinite] flex items-center gap-2">
            <Flame className="w-16 h-16 text-orange-500 fill-orange-400 drop-shadow-md" /> 
            COMBO x{combo}!
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col items-center justify-center z-10 relative">
        <div className={`w-full transition-opacity duration-300 ${gameState === 'transition' ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100'}`}>
          {gameMode === 'lesson' && <LessonScreen key={key} onComplete={handleComplete} />}
          {gameMode === 'match' && <MatchGame key={key} onComplete={handleComplete} />}
          {gameMode === 'arrowMatch' && <ArrowMatchGame key={key} onComplete={handleComplete} />}
          {gameMode === 'dragFaces' && <DragFacesGame key={key} onComplete={handleComplete} />}
          {gameMode === 'andBut' && <AndButGame key={key} onComplete={handleComplete} />}
          {gameMode === 'sentenceBuilder' && <SentenceBuilderGame key={key} onComplete={handleComplete} />}
          {gameMode === 'spell' && <SpellGame key={key} onComplete={handleComplete} />}
          {gameMode === 'question' && <QuestionGame key={key} onComplete={handleComplete} />}
          {gameMode === 'statement' && <StatementGame key={key} onComplete={handleComplete} />}
          {gameMode === 'speak' && <SpeakGame key={key} onComplete={handleComplete} />}
          {gameMode === 'listen' && <ListenSequenceGame key={key} onComplete={handleComplete} />}
        </div>

        {gameState === 'transition' && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div 
              onClick={handleNextGame}
              className="bg-gradient-to-br from-[#FF85A1] to-[#FF4D6D] rounded-3xl p-12 flex flex-col items-center justify-center text-white shadow-2xl cursor-pointer hover:brightness-110 transform hover:scale-105 active:scale-95 transition-all border-b-8 border-pink-700 animate-bounce"
            >
              <div className="text-6xl mb-4"><ArrowRight strokeWidth={4} /></div>
              <div className="text-3xl font-black uppercase text-center leading-tight tracking-wider">Next <br/>Game</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Mini Nav */}
      <footer className="h-12 bg-white/30 backdrop-blur-md flex items-center justify-center gap-12 text-[10px] font-bold text-[#A06CD5] uppercase">
        <div className="flex items-center gap-2"><span>📁</span> LESSON: FOOD</div>
        <div className="flex items-center gap-2"><span>🎯</span> BE THE BEST!</div>
      </footer>

      {/* Decorative Floating Elements */}
      <div className="absolute top-32 left-8 w-12 h-12 bg-[#FFD23F]/20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-12 right-24 w-24 h-24 bg-[#A06CD5]/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
}
