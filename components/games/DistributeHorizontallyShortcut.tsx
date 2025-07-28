// File: src/components/games/DistributeHorizontallyShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position { 
  x: number; 
  y: number; 
}

interface DistributeHorizontallyShortcutProps { 
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
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

const DistributeHorizontallyShortcut: React.FC<DistributeHorizontallyShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [distributed, setDistributed] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const [sequence, setSequence] = useState<string[]>([]);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize clustered positions and start timer immediately
  useEffect(() => {
    const baseY = 120;
    const initial = [
      { x: 30, y: baseY },
      { x: 50, y: baseY - 10 },
      { x: 70, y: baseY + 15 },
      { x: 200, y: baseY - 5 },
    ];
    setPositions(initial);
    
    // Start timer immediately
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

    // Track sequence for Alt + X + D + H
    if (e.altKey && normalizedKey === 'x') {
      setSequence(['x']);
      console.log('Started sequence with X');
    } else if (e.altKey && sequence.length === 1 && sequence[0] === 'x' && normalizedKey === 'd') {
      setSequence(['x', 'd']);
      console.log('Added D to sequence');
    } else if (e.altKey && sequence.length === 2 && sequence[1] === 'd' && normalizedKey === 'h') {
      console.log('Completed sequence with H');
      if (!done.current) {
        done.current = true;
        setDistributed(true);
        const end = Date.now();
        setCompletionTime(end - (startTime || end));
        if (timerRef.current) clearInterval(timerRef.current);
        if (isRandomMode) {
          setTimeout(() => onComplete?.(), 800);
        } else {
          setTimeout(() => setCompleted(true), 800);
        }
      }
    } else if (!e.altKey) {
      setSequence([]);
    }
    
    e.preventDefault();
  }, [completed, startTime, sequence, onComplete, isRandomMode]);

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

  if (completed && !isRandomMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center border-l-4 border-blue-900 z-10">
          <CheckCircle className="w-12 h-12 mx-auto text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Perfect Distribution! 📐
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
            Distribute Horizontally
          </h2>
          {isRandomMode && (
            <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          {/* Guide lines */}
          {distributed && (
            <>
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-300 opacity-50"></div>
              <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-blue-300 opacity-50"></div>
              <div className="absolute left-32 top-0 bottom-0 w-0.5 bg-blue-300 opacity-50"></div>
              <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-blue-300 opacity-50"></div>
            </>
          )}
          
          {positions.map((pos, i) => {
            const distributedPositions = [
              { x: 20, y: 120 },
              { x: 75, y: 120 },
              { x: 130, y: 120 },
              { x: 185, y: 120 }
            ];
            const target = distributed ? distributedPositions[i] : { x: pos.x, y: pos.y };
            
            return (
              <motion.div
                key={i}
                className="absolute w-10 h-10 bg-blue-900 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm"
                initial={{ x: pos.x, y: pos.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.1 }}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>
        
        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">Alt + X + D + H</span> to distribute evenly
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

export default DistributeHorizontallyShortcut;