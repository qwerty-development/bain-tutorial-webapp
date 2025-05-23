// File: src/components/ShortcutGameWrapper.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import GroupShortcut from './GroupShortcut';
import DuplicateShortcut from './DuplicateShortcut';
import { shortcuts } from '@/utils/shortcut';
import { ArrowLeft } from 'lucide-react';

export type GameCommand = 'group' | 'duplicate';

interface ShortcutGameWrapperProps {
  command: GameCommand | null; // used in single-mode
  isRandomMode: boolean;
  os: 'mac' | 'windows';
  onBack: () => void;
}

// Utility to shuffle array
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ShortcutGameWrapper: React.FC<ShortcutGameWrapperProps> = ({ command, isRandomMode, os, onBack }) => {
  const allCommands: GameCommand[] = ['group', 'duplicate'];
  const [randomCommands, setRandomCommands] = useState<GameCommand[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(isRandomMode ? 3 : null);
  const [started, setStarted] = useState(!isRandomMode);
  const [times, setTimes] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Init random sequence on mode switch
  useEffect(() => {
    if (isRandomMode) {
      const seq = shuffle(allCommands);
      setRandomCommands(seq);
      setCurrentIdx(0);
      setTimes([]);
      setShowSummary(false);
      setCountdown(3);
      setStarted(false);
    }
  }, [isRandomMode]);

  // Countdown for random mode
  useEffect(() => {
    if (isRandomMode && countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => (c ?? 0) - 1), 1000);
        return () => clearTimeout(timer);
      }
      // Countdown finished
      setCountdown(null);
      setStarted(true);
      startTimeRef.current = Date.now();
    }
  }, [countdown, isRandomMode]);

  const handleComplete = () => {
    const elapsed = Date.now() - startTimeRef.current;
    setTimes(prev => [...prev, elapsed]);

    // Next game or summary
    if (isRandomMode) {
      if (currentIdx < randomCommands.length - 1) {
        setCurrentIdx(i => i + 1);
        // start next
        startTimeRef.current = Date.now();
      } else {
        // finished all
        setShowSummary(true);
      }
    } else {
      // single mode: just go back
      onBack();
    }
  };

  // Determine active command
  const activeCmd: GameCommand | null = isRandomMode
    ? randomCommands[currentIdx]
    : command;

  // Render countdown or summary
  if (isRandomMode && !started) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-8xl font-bold animate-pulse">
            {countdown}
          </div>
          <p className="text-xl mt-2">
            Get ready for: <strong>{shortcuts[randomCommands[currentIdx]]?.name}</strong>
          </p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const total = times.reduce((a, b) => a + b, 0);
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="bg-green-50 dark:bg-green-900 rounded-xl p-6 shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-4">🎉 All Done!</h2>
          <p className="mb-2">Your total time:</p>
          <p className="text-2xl font-mono mb-4">{(total / 1000).toFixed(2)}s</p>
          {times.map((t, i) => (
            <p key={i} className="text-sm">
              {i + 1}. {shortcuts[randomCommands[i]].name}: {(t / 1000).toFixed(2)}s
            </p>
          ))}
          <button
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Render game view
  const GameComponent = activeCmd === 'group' ? GroupShortcut : DuplicateShortcut;
  return (
    <div className="min-h-screen relative">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:shadow-md"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
      </button>
      {activeCmd && (
        <GameComponent onComplete={handleComplete} />
      )}
    </div>
  );
};

export default ShortcutGameWrapper;
