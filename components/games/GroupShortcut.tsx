// File: src/components/GroupShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface GroupShortcutProps {
  onComplete: () => void;
}

const GroupShortcut: React.FC<GroupShortcutProps> = ({ onComplete }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [grouped, setGrouped] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const done = useRef(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Scatter boxes on mount
  useEffect(() => {
    const initial = Array.from({ length: 5 }, () => ({
      x: Math.random() * 200,
      y: Math.random() * 200,
    }));
    setPositions(initial);
  }, []);

  // Key handling for grouping
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    if (!startTime) setStartTime(Date.now());

    let key = e.key;
    if (key === '©') key = 'g';
    key = key.toLowerCase();
    const mappedKey = key === 'meta' ? 'cmd' : key;

    setPressedKeys(prev => (prev.includes(mappedKey) ? prev : [...prev, mappedKey]));

    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    if (!done.current && ctrl && e.altKey && key === 'g') {
      done.current = true;
      setGrouped(true);
      const end = Date.now();
      setCompletionTime(end - (startTime || end));
      setTimeout(() => setCompleted(true), 500);
    }
    e.preventDefault();
  }, [completed, startTime, isMac]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    let key = e.key;
    if (key === '©') key = 'g';
    key = key.toLowerCase();
    const mappedKey = key === 'meta' ? 'cmd' : key;
    setPressedKeys(prev => prev.filter(k => k !== mappedKey));
  }, [completed]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Show congratulations when done
  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-6 shadow-lg text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
            Congratulations! 🎉
          </h2>
          {completionTime !== null && (
            <p className="text-blue-700 dark:text-blue-300 font-mono mb-4">
              Completed in {(completionTime / 1000).toFixed(2)}s
            </p>
          )}
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Default challenge UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">
          Group Objects
        </h2>
        <div className="relative w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
          {positions.map((pos, i) => {
            const target = grouped ? { x: 100, y: 100 } : { x: pos.x, y: pos.y };
            return (
              <motion.div
                key={i}
                className="absolute w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-lg"
                initial={{ x: pos.x, y: pos.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 rounded-full text-sm font-mono"
            >
              {k === 'cmd' ? '⌘' : k === 'alt' ? (isMac ? '⌥' : 'Alt') : k.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupShortcut;