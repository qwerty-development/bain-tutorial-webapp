// File: src/components/GroupShortcut.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MousePointer } from 'lucide-react';
import { useSequentialShortcut } from '@/utils/shortcut';

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

const shortcutSequence = ['ctrl', 'g'];

const GroupShortcut: React.FC<GroupShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [objects, setObjects] = useState<Object[]>([]);
  const [selectionMode, setSelectionMode] = useState<boolean>(true);
  const [grouped, setGrouped] = useState<boolean>(false);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const [instructions, setInstructions] = useState<string>('Click to select objects, then press Ctrl+G to group');
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Sequential shortcut logic
  const seq = useSequentialShortcut(shortcutSequence, 1500);

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

  // Handle object selection
  const handleObjectClick = (objectId: number) => {
    if (completed || grouped) return;
    
    setObjects(prev => prev.map(obj => 
      obj.id === objectId 
        ? { ...obj, selected: !obj.selected }
        : obj
    ));
  };

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
        seq.reset();
      }
    }
  }, [seq.completed, onComplete, isRandomMode, startTime, objects, seq]);

  // Reset shake after error
  useEffect(() => {
    if (seq.error) {
      const t = setTimeout(() => seq.reset(), 600);
      return () => clearTimeout(t);
    }
  }, [seq.error, seq]);

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

  // Chip progress UI
  const getChipClass = (idx: number) => {
    if (seq.error) return 'bg-red-200 text-red-800 border-red-400 animate-shake';
    if (idx < seq.progress) return 'bg-green-600 text-white border-green-700';
    if (idx === seq.progress) return 'bg-blue-900 text-white border-blue-900';
    return 'bg-blue-100 text-blue-900 border-blue-200';
  };

  // Default challenge UI
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
            Group Objects
          </h2>
          {isRandomMode && (
            <div className={`text-3xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="relative w-96 h-96 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-6 border-2 border-gray-200 shadow-inner overflow-hidden">
          {objects.map((obj) => {
            const target = grouped && obj.grouped 
              ? { x: 100, y: 100 } 
              : { x: obj.position.x, y: obj.position.y };
            
            return (
              <motion.div
                key={obj.id}
                className={`absolute w-14 h-14 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer transition-all duration-200 border-2 border-white ${
                  obj.selected 
                    ? 'bg-gradient-to-br from-green-500 to-green-700 ring-4 ring-green-300 scale-110' 
                    : obj.grouped 
                      ? 'bg-gradient-to-br from-red-500 to-red-700' 
                      : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                }`}
                initial={{ x: obj.position.x, y: obj.position.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => handleObjectClick(obj.id)}
                style={{ zIndex: obj.selected ? 10 : 1 }}
              >
                {obj.selected && <MousePointer className="w-5 h-5" />}
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center mb-6">
          <p className="text-lg text-gray-600 mb-3">
            {instructions}
          </p>
          {selectedCount > 0 && (
            <p className="text-lg font-medium text-green-600">
              {selectedCount} object{selectedCount !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        
        {/* Only show instruction in practice mode */}
        {!isRandomMode && (
          <p className="mt-6 text-center text-gray-600 text-lg">
            Press <span className="font-mono bg-blue-100 px-3 py-2 rounded-lg text-lg">{isMac ? '⌘ + G' : 'Ctrl + G'}</span> to group
          </p>
        )}
        
        {/* Show pressed keys but no guidance */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {seq.pressedKeys.map((k, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-xl text-base font-mono border-2 bg-green-100 text-green-800 border-green-300"
            >
              {k === 'ctrl' ? (isMac ? '⌘' : 'Ctrl') : k.toUpperCase()}
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

export default GroupShortcut;