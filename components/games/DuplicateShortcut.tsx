// File: src/components/DuplicateShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position { x: number; y: number; }
interface DuplicateShortcutProps { 
  onComplete?: () => void; 
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

// Key mapping for Mac special characters
const macKeyMap: Record<string, string> = {
  '∂': 'd',  // Alt + D (though Cmd+D shouldn't produce this)
};

const DuplicateShortcut: React.FC<DuplicateShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  // Start with one box centered
  const [positions, setPositions] = useState<Position[]>([{ x: 100, y: 100 }]);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Start timer immediately
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Timer countdown - only for random mode
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

  const normalizeKey = (key: string): string => {
    if (macKeyMap[key]) {
      return macKeyMap[key];
    }
    return key.toLowerCase();
  };

  // Keydown handler duplicates and tracks keys
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const normalizedKey = normalizeKey(e.key);
    const mappedKey = normalizedKey === 'meta' ? 'cmd' : normalizedKey;

    setPressedKeys(prev => prev.includes(mappedKey) ? prev : [...prev, mappedKey]);

    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    if (!done.current && ctrl && normalizedKey === 'd') {
      done.current = true;
      // Duplicate the single box
      setPositions(prev => [...prev, { x: prev[0].x + 20, y: prev[0].y + 20 }]);
      // Record completion time
      const end = Date.now();
      setCompletionTime(end - (startTime || end));
      if (timerRef.current) clearInterval(timerRef.current);
      if (isRandomMode) {
        setTimeout(() => onComplete?.(), 800);
      } else {
        // Show congratulations
        setTimeout(() => setCompleted(true), 800);
      }
    }
    e.preventDefault();
  }, [isMac, startTime, onComplete, isRandomMode]);

  // Keyup handler to clear keys
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const normalizedKey = normalizeKey(e.key);
    const mappedKey = normalizedKey === 'meta' ? 'cmd' : normalizedKey;
    setPressedKeys(prev => prev.filter(k => k !== mappedKey));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  if (completed && !isRandomMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center border-l-4 border-blue-900 z-10">
          <CheckCircle className="w-12 h-12 mx-auto text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Great Duplication! 📋
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

  // Challenge view
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
            Duplicate Object
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
              initial={{ x: pos.x, y: pos.y, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
        
        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">{isMac ? '⌘ + D' : 'Ctrl + D'}</span> to duplicate
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-mono border border-blue-200"
            >
              {k === 'cmd' ? '⌘' : k === 'ctrl' ? 'Ctrl' : k === 'alt' ? (isMac ? '⌥' : 'Alt') : k.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DuplicateShortcut;