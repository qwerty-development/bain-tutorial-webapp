// File: src/components/games/AlignTopShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position { 
  x: number; 
  y: number; 
}

interface AlignTopShortcutProps { 
  onComplete?: () => void;
  onTimeout?: () => void;
}

// Key mapping for Mac special characters
const macKeyMap: Record<string, string> = {
  '≈': 'x',  // Alt + X
  'å': 'a',  // Alt + A  
  '†': 't',  // Alt + T
  '∂': 'd',  // Alt + D
  '˙': 'h',  // Alt + H
  'π': 'p',  // Alt + P
  'ß': 's',  // Alt + S
  '∑': 'w',  // Alt + W
  '∫': 'b',  // Alt + B
  '©': 'g',  // Alt + G
};

const AlignTopShortcut: React.FC<AlignTopShortcutProps> = ({ onComplete, onTimeout }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [aligned, setAligned] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [sequence, setSequence] = useState<string[]>([]);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize scattered positions and start timer immediately
  useEffect(() => {
    const initial = Array.from({ length: 4 }, () => ({
      x: Math.random() * 180 + 20,
      y: Math.random() * 180 + 40,
    }));
    setPositions(initial);
    
    // Start timer immediately
    setStartTime(Date.now());
  }, []);

  // Timer countdown - starts immediately
  useEffect(() => {
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
  }, []);

  // Handle timeout separately
  useEffect(() => {
    if (timeLeft === 0 && !completed) {
      onTimeout?.();
    }
  }, [timeLeft, completed, onTimeout]);

  const normalizeKey = (key: string, altPressed: boolean): string => {
    // If Alt is pressed and we get a regular letter, use it directly
    if (altPressed && /^[a-zA-Z]$/.test(key)) {
      return key.toLowerCase();
    }
    // Otherwise check for Mac special characters
    if (macKeyMap[key]) {
      return macKeyMap[key];
    }
    return key.toLowerCase();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    
    const normalizedKey = normalizeKey(e.key, e.altKey);
    const mappedKey = normalizedKey === 'meta' ? 'cmd' : normalizedKey;

    setPressedKeys(prev => prev.includes(mappedKey) ? prev : [...prev, mappedKey]);

    // Debug logging
    console.log('Key pressed:', e.key, 'Normalized:', normalizedKey, 'Alt pressed:', e.altKey, 'Sequence:', sequence);

    // Track sequence for Alt + X + A + T
    if (e.altKey && normalizedKey === 'x') {
      setSequence(['x']);
      console.log('Started sequence with X');
    } else if (e.altKey && sequence.length === 1 && sequence[0] === 'x' && normalizedKey === 'a') {
      setSequence(['x', 'a']);
      console.log('Added A to sequence');
    } else if (e.altKey && sequence.length === 2 && sequence[1] === 'a' && normalizedKey === 't') {
      console.log('Completed sequence with T');
      if (!done.current) {
        done.current = true;
        setAligned(true);
        const end = Date.now();
        setCompletionTime(end - (startTime || end));
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => setCompleted(true), 500);
      }
    } else if (!e.altKey) {
      setSequence([]);
    }
    
    e.preventDefault();
  }, [completed, startTime, sequence]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    const normalizedKey = normalizeKey(e.key, e.altKey);
    const mappedKey = normalizedKey === 'meta' ? 'cmd' : normalizedKey;
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

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-8 relative">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center border-l-4 border-blue-900 z-10">
          <CheckCircle className="w-12 h-12 mx-auto text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Excellent! 🎯
          </h2>
          <p className="text-gray-600 font-mono mb-4">
            Completed in {(completionTime / 1000).toFixed(2)}s
          </p>
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-8 relative">
      {/* Big Background Timer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`text-[20rem] font-bold opacity-10 transition-all duration-300 ${
          timeLeft <= 2 ? 'text-red-500 animate-pulse' : 'text-blue-900'
        }`}>
          {timeLeft}
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-blue-900 z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-900">
            Align Top
          </h2>
          <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
            {timeLeft}s
          </div>
        </div>
        
        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-900 opacity-30"></div>
          {positions.map((pos, i) => {
            const target = aligned ? { x: pos.x, y: 20 } : { x: pos.x, y: pos.y };
            return (
              <motion.div
                key={i}
                className="absolute w-10 h-10 bg-blue-900 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm"
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
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">Alt + X + A + T</span> to align to top
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-mono border border-blue-200"
            >
              {k === 'alt' ? 'Alt' : k.toUpperCase()}
            </span>
          ))}
        </div>
        
        {sequence.length > 0 && (
          <div className="mt-2 text-center">
            <span className="text-sm text-blue-600">
              Sequence: {sequence.join(' → ')} {sequence.length < 3 && '→ ?'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlignTopShortcut;