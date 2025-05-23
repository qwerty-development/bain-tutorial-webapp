// File: src/components/DuplicateShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position { x: number; y: number; }
interface DuplicateShortcutProps { onComplete?: () => void; }

const DuplicateShortcut: React.FC<DuplicateShortcutProps> = ({ onComplete }) => {
  // Start with one box centered
  const [positions, setPositions] = useState<Position[]>([{ x: 100, y: 100 }]);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const done = useRef(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Keydown handler duplicates and tracks keys
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const rawKey = e.key === '∂' ? 'd' : e.key;
    const key = rawKey.toLowerCase();
    const mappedKey = key === 'meta' ? 'cmd' : key;

    setPressedKeys(prev => prev.includes(mappedKey) ? prev : [...prev, mappedKey]);

    if (!startTime) setStartTime(Date.now());
    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    if (!done.current && ctrl && key === 'd') {
      done.current = true;
      // Duplicate the single box
      setPositions(prev => [...prev, { x: prev[0].x + 20, y: prev[0].y + 20 }]);
      // Record completion time
      const end = Date.now();
      setCompletionTime(end - (startTime || end));
      // Show congratulations
      setTimeout(() => setCompleted(true), 300);
      // Notify parent
    }
    e.preventDefault();
  }, [isMac, onComplete, startTime]);

  // Keyup handler to clear keys
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const rawKey = e.key === '∂' ? 'd' : e.key;
    const key = rawKey.toLowerCase();
    const mappedKey = key === 'meta' ? 'cmd' : key;
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

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="bg-green-50 dark:bg-green-900 rounded-xl p-6 shadow-lg text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-green-700 dark:text-green-300 font-mono mb-4">
            Completed in {(completionTime / 1000).toFixed(2)}s
          </p>
          <button
            onClick={() => onComplete?.()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Challenge view
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">
          Duplicate Object
        </h2>
        <div className="relative w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
          {positions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12 bg-green-500 dark:bg-green-600 rounded-lg shadow-lg"
              initial={{ x: pos.x, y: pos.y, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          ))}
        </div>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Press {isMac ? '⌘' : 'Ctrl'} + D to duplicate
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 rounded-full text-sm font-mono"
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
