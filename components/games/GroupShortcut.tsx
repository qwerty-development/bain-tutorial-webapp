// File: src/components/GroupShortcut.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MousePointer } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Object {
  id: number;
  position: Position;
  selected: boolean;
  grouped: boolean;
}

interface GroupShortcutProps {
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

const GroupShortcut: React.FC<GroupShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [objects, setObjects] = useState<Object[]>([]);
  const [selectionMode, setSelectionMode] = useState<boolean>(true);
  const [grouped, setGrouped] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const [instructions, setInstructions] = useState<string>('Click to select objects, then press Ctrl+G to group');
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Initialize objects on mount
  useEffect(() => {
    const initialObjects = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      position: {
        x: Math.random() * 180 + 20,
        y: Math.random() * 180 + 20,
      },
      selected: false,
      grouped: false,
    }));
    setObjects(initialObjects);
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

  const normalizeKey = (key: string): string => {
    return key.toLowerCase();
  };

  // Handle object selection
  const handleObjectClick = (objectId: number) => {
    if (completed || grouped) return;
    
    setObjects(prev => prev.map(obj => 
      obj.id === objectId 
        ? { ...obj, selected: !obj.selected }
        : obj
    ));
  };

  // Key handling for grouping
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (completed) return;

    const normalizedKey = normalizeKey(e.key);
    const mappedKey = normalizedKey === 'meta' ? 'cmd' : normalizedKey;

    setPressedKeys(prev => (prev.includes(mappedKey) ? prev : [...prev, mappedKey]));

    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    if (!done.current && ctrl && normalizedKey === 'g') {
      const selectedObjects = objects.filter(obj => obj.selected);
      
      if (selectedObjects.length >= 2) {
        done.current = true;
        setGrouped(true);
        setSelectionMode(false);
        
        // Mark selected objects as grouped
        setObjects(prev => prev.map(obj => 
          obj.selected ? { ...obj, grouped: true } : obj
        ));
        
        const end = Date.now();
        setCompletionTime(end - (startTime || end));
        setInstructions('Objects grouped successfully!');
        
        if (timerRef.current) clearInterval(timerRef.current);
        if (isRandomMode) {
          setTimeout(() => onComplete?.(), 1500);
        } else {
          setTimeout(() => setCompleted(true), 1500);
        }
      } else {
        setInstructions('Select at least 2 objects before grouping!');
        setTimeout(() => setInstructions('Click to select objects, then press Ctrl+G to group'), 2000);
      }
    }
    e.preventDefault();
  }, [completed, startTime, isMac, onComplete, isRandomMode, objects]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    const normalizedKey = normalizeKey(e.key);
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

  // Show congratulations when done
  if (completed && !isRandomMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center border-l-4 border-blue-900 z-10">
          <CheckCircle className="w-12 h-12 mx-auto text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Perfect Grouping! 🎯
          </h2>
          {!isRandomMode && completionTime !== null && (
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

  const selectedCount = objects.filter(obj => obj.selected).length;

  // Default challenge UI
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
            Group Objects
          </h2>
          {isRandomMode && (
            <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200 overflow-hidden">
          {objects.map((obj) => {
            const target = grouped && obj.grouped 
              ? { x: 100, y: 100 } 
              : { x: obj.position.x, y: obj.position.y };
            
            return (
              <motion.div
                key={obj.id}
                className={`absolute w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all duration-200 ${
                  obj.selected 
                    ? 'bg-green-600 ring-4 ring-green-300 scale-110' 
                    : obj.grouped 
                      ? 'bg-blue-600' 
                      : 'bg-blue-900 hover:bg-blue-800'
                }`}
                initial={{ x: obj.position.x, y: obj.position.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => handleObjectClick(obj.id)}
                style={{ zIndex: obj.selected ? 10 : 1 }}
              >
                {obj.selected && <MousePointer className="w-4 h-4" />}
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {instructions}
          </p>
          {selectedCount > 0 && (
            <p className="text-sm font-medium text-green-600">
              {selectedCount} object{selectedCount !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        
        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">{isMac ? '⌘ + G' : 'Ctrl + G'}</span> to group
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-mono border border-blue-200"
            >
              {k === 'cmd' ? '⌘' : k === 'ctrl' ? 'Ctrl' : k.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupShortcut;