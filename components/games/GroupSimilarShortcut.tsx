// File: src/components/games/GroupSimilarShortcut.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSequentialShortcut } from '@/utils/shortcut';

interface Position { 
  x: number; 
  y: number; 
  color: string;
}

interface GroupSimilarShortcutProps { 
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

const shortcutSequence = ['alt', 'x', 'b', 's'];

const GroupSimilarShortcut: React.FC<GroupSimilarShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [grouped, setGrouped] = useState<boolean>(false);
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
    const initial: Position[] = [
      { x: 30, y: 40, color: 'red' },
      { x: 160, y: 60, color: 'red' },
      { x: 70, y: 160, color: 'blue' },
      { x: 200, y: 140, color: 'blue' },
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
    if (completed || grouped) return;
    const handler = (e: KeyboardEvent) => {
      seq.handleKey(e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [seq, completed, grouped]);

  // On successful completion
  useEffect(() => {
    if (seq.completed && !done.current) {
      done.current = true;
      setGrouped(true);
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
            Group Similar Elements
          </h2>
          {isRandomMode && (
            <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          {positions.map((pos, i) => {
            const target = grouped 
              ? { x: pos.color === 'red' ? 50 : 150, y: 100 } 
              : { x: pos.x, y: pos.y };
            return (
              <motion.div
                key={i}
                className={`absolute w-10 h-10 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm ${
                  pos.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                }`}
                initial={{ x: pos.x, y: pos.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>
        
        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">Alt + X + B + S</span> to group similar elements
        </p>
        
        {/* Chip progress indicator */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {shortcutSequence.map((k, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm font-mono border transition-all duration-200 ${getChipClass(idx)}`}
            >
              {k === 'alt' ? 'Alt' : k.toUpperCase()}
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

export default GroupSimilarShortcut; 