// File: src/components/games/DuplicateShortcut.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSequentialShortcut } from '@/utils/shortcut';

interface Position { 
  x: number; 
  y: number; 
}

interface DuplicateShortcutProps { 
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

const shortcutSequence = ['ctrl', 'd'];

const DuplicateShortcut: React.FC<DuplicateShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [duplicated, setDuplicated] = useState<boolean>(false);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Sequential shortcut logic
  const seq = useSequentialShortcut(shortcutSequence, 1500);

  // Initialize scattered positions and start timer immediately
  useEffect(() => {
    const initial = [{ x: 100, y: 100 }];
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
    if (completed || duplicated) return;
    const handler = (e: KeyboardEvent) => {
      seq.handleKey(e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [seq, completed, duplicated]);

  // On successful completion
  useEffect(() => {
    if (seq.completed && !done.current) {
      done.current = true;
      setDuplicated(true);
      // Duplicate the single box
      setPositions(prev => [...prev, { x: prev[0].x + 20, y: prev[0].y + 20 }]);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
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

      <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-blue-900 z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-900">
            Duplicate Slide
          </h2>
          {isRandomMode && (
            <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          {positions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12 bg-blue-900 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm"
              initial={{ x: pos.x, y: pos.y, opacity: 0, scale: 0.8 }}
              animate={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.1 }}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
        
        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">{isMac ? '⌘ + D' : 'Ctrl + D'}</span> to duplicate
        </p>
        
        {/* Chip progress indicator */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {shortcutSequence.map((k, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm font-mono border transition-all duration-200 ${getChipClass(idx)}`}
            >
              {k === 'ctrl' ? (isMac ? '⌘' : 'Ctrl') : k.toUpperCase()}
            </span>
          ))}
        </div>
        {seq.error && (
          <div className="text-center mt-2">
            <span className="text-red-600 font-semibold">Wrong key! Sequence reset.</span>
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

export default DuplicateShortcut;