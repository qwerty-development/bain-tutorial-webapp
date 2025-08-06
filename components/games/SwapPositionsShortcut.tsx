// File: src/components/games/SwapPositionsShortcut.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSequentialShortcut } from '@/utils/shortcut';

interface Position { 
  x: number; 
  y: number; 
}

interface SwapPositionsShortcutProps { 
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

const shortcutSequence = ['alt', 'p', 's', 'w'];

const SwapPositionsShortcut: React.FC<SwapPositionsShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [swapped, setSwapped] = useState<boolean>(false);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sequential shortcut logic
  const seq = useSequentialShortcut(shortcutSequence, 1500);

  // Initialize scattered positions and start timer immediately
  useEffect(() => {
    const initial = [
      { x: 50, y: 100 },
      { x: 150, y: 100 },
    ];
    setPositions(initial);
    setStartTime(Date.now());
  }, []);

  // Timer countdown - only in random mode
  useEffect(() => {
    if (!isRandomMode) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRandomMode, timeLimit]);

  // Handle timeout separately
  useEffect(() => {
    if (!isRandomMode) return;
    if (timeLeft === 0 && !completed) {
      onTimeout?.();
    }
  }, [timeLeft, completed, onTimeout, isRandomMode]);

  // Listen for keydown events
  useEffect(() => {
    if (completed || swapped) return;
    const handler = (e: KeyboardEvent) => {
      seq.handleKey(e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [seq, completed, swapped]);

  // On successful completion
  useEffect(() => {
    if (seq.completed && !done.current) {
      done.current = true;
      setSwapped(true);
      const end = Date.now();
      setCompletionTime(end - (startTime || end));
      if (timerRef.current) clearInterval(timerRef.current);
      if (isRandomMode) {
        setTimeout(() => onComplete?.(), 1000);
      } else {
        setTimeout(() => setCompleted(true), 1000);
      }
    }
  }, [seq.completed, onComplete, isRandomMode, startTime]);

  // Reset shake after error
  useEffect(() => {
    if (seq.error) {
      const t = setTimeout(() => seq.reset(), 600);
      return () => clearTimeout(t);
    }
  }, [seq.error, seq]);

  if (completed && !isRandomMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center border-l-4 border-blue-900 z-10">
          <CheckCircle className="w-12 h-12 mx-auto text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Excellent! 🎯
          </h2>
          {!isRandomMode && (
            <p className="text-gray-600 font-mono mb-4">
              Completed in {(completionTime / 1000).toFixed(2)}s
            </p>
          )}
          <button
            onClick={() => onComplete?.()}
            className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Chip progress UI
  const getChipClass = (idx: number) => {
    if (seq.error) return 'bg-red-200 text-red-800 border-red-400 animate-shake';
    if (idx < seq.progress) return 'bg-green-600 text-white border-green-700';
    if (idx === seq.progress) return 'bg-blue-900 text-white border-blue-900';
    return 'bg-blue-100 text-blue-900 border-blue-200';
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 relative">
      {/* Big Background Timer */}
      {isRandomMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-[20rem] font-bold opacity-10 transition-all duration-300 ${
            timeLeft <= 2 ? 'text-red-500 animate-pulse' : 'text-blue-900'
          }`}>
            {timeLeft}
          </div>
        </div>
      )}

      <div className="p-8 bg-white rounded-3xl shadow-2xl border-l-4 border-blue-900 z-10 relative max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900">
            Swap Positions
          </h2>
          {isRandomMode && (
            <div className={`text-3xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="relative w-96 h-96 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-6 border-2 border-gray-200 shadow-inner">
          {positions.map((pos, i) => {
            const target = swapped 
              ? { x: positions[1 - i].x, y: positions[1 - i].y } 
              : { x: pos.x, y: pos.y };
            return (
              <motion.div
                key={i}
                className="absolute w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg border-2 border-white"
                initial={{ x: pos.x, y: pos.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>
        
        {/* Only show instruction in practice mode */}
        {!isRandomMode && (
          <p className="mt-6 text-center text-gray-600 text-lg">
            Press <span className="font-mono bg-blue-100 px-3 py-2 rounded-lg text-lg">{isMac ? '⌥ + P + S + W' : 'Alt + P + S + W'}</span> to swap positions
          </p>
        )}
        
        {/* Show pressed keys but no guidance */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {seq.pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-xl text-base font-mono border-2 bg-green-100 text-green-800 border-green-300"
            >
              {k === 'alt' ? (isMac ? '⌥' : 'Alt') : k.toUpperCase()}
            </span>
          ))}
        </div>
        {seq.error && (
          <div className="text-center mt-3">
            <span className="text-red-600 font-semibold text-lg">Wrong key! Sequence reset.</span>
          </div>
        )}
      </div>
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default SwapPositionsShortcut;