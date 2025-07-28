// File: src/components/games/SwapPositionsShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeftRight } from 'lucide-react';

interface Position { 
  x: number; 
  y: number; 
}

interface SwapPositionsShortcutProps { 
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

const SwapPositionsShortcut: React.FC<SwapPositionsShortcutProps> = ({ onComplete, onTimeout }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [swapped, setSwapped] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [sequence, setSequence] = useState<string[]>([]);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize two distinct positions and start timer immediately
  useEffect(() => {
    const initial = [
      { x: 60, y: 100 },   // Left position - Circle
      { x: 160, y: 100 },  // Right position - Square
    ];
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

    // Track sequence for Alt + P + S + W
    if (e.altKey && normalizedKey === 'p') {
      setSequence(['p']);
      console.log('Started sequence with P');
    } else if (e.altKey && sequence.length === 1 && sequence[0] === 'p' && normalizedKey === 's') {
      setSequence(['p', 's']);
      console.log('Added S to sequence');
    } else if (e.altKey && sequence.length === 2 && sequence[1] === 's' && normalizedKey === 'w') {
      console.log('Completed sequence with W');
      if (!done.current) {
        done.current = true;
        setSwapped(true);
        const end = Date.now();
        setCompletionTime(end - (startTime || end));
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => setCompleted(true), 800);
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
            Smooth Swap! 🔄
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

  const swappedPositions = [
    { x: 160, y: 100 }, // Circle moves right
    { x: 60, y: 100 },  // Square moves left
  ];

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
            Swap Positions
          </h2>
          <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
            {timeLeft}s
          </div>
        </div>
        
        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          {/* Swap arrow indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <ArrowLeftRight className="w-6 h-6 text-blue-300" />
          </div>
          
          {/* Circle */}
          <motion.div
            className="absolute w-12 h-12 bg-blue-900 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-sm border-2 border-white"
            initial={{ x: positions[0]?.x || 60, y: positions[0]?.y || 100 }}
            animate={{ 
              x: swapped ? swappedPositions[0].x : (positions[0]?.x || 60), 
              y: swapped ? swappedPositions[0].y : (positions[0]?.y || 100) 
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            ●
          </motion.div>
          
          {/* Square */}
          <motion.div
            className="absolute w-12 h-12 bg-white border-4 border-blue-900 shadow-lg flex items-center justify-center text-blue-900 font-bold text-sm"
            initial={{ x: positions[1]?.x || 160, y: positions[1]?.y || 100 }}
            animate={{ 
              x: swapped ? swappedPositions[1].x : (positions[1]?.x || 160), 
              y: swapped ? swappedPositions[1].y : (positions[1]?.y || 100) 
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            ■
          </motion.div>
        </div>
        
        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">Alt + P + S + W</span> to swap positions
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

export default SwapPositionsShortcut;