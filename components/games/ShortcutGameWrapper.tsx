// File: src/components/ShortcutGameWrapper.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import GroupShortcut from './GroupShortcut';
import DuplicateShortcut from './DuplicateShortcut';
import AlignTopShortcut from './AlignTopShortcut';
import AlignTopFirstShortcut from './AlignTopFirstShortcut';
import GroupSimilarShortcut from './GroupSimilarShortcut';
import DistributeHorizontallyShortcut from './DistributeHorizontallyShortcut';
import SwapPositionsShortcut from './SwapPositionsShortcut';
import { shortcuts } from '@/utils/shortcut';
import { ArrowLeft, X, Trophy, Star } from 'lucide-react';

export type GameCommand = 'group' | 'duplicate' | 'alignTop' | 'distributeHorizontally' | 'alignTopFirst' | 'swapPositions' | 'groupSimilar';

interface ShortcutGameWrapperProps {
  command: GameCommand | null;
  isRandomMode: boolean;
  testConfig: {
    count: number;
    difficulty: 'easy' | 'normal' | 'hard';
  };
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

const ShortcutGameWrapper: React.FC<ShortcutGameWrapperProps> = ({ command, isRandomMode, testConfig, os, onBack }) => {
  const allCommands: GameCommand[] = ['group', 'duplicate', 'alignTop', 'alignTopFirst', 'distributeHorizontally', 'swapPositions', 'groupSimilar'];
  const difficultyTime: Record<'easy' | 'normal' | 'hard', number> = { easy: 8, normal: 5, hard: 3 };
  const timeLimit = difficultyTime[testConfig.difficulty];
  const [randomCommands, setRandomCommands] = useState<GameCommand[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(isRandomMode ? 3 : null);
  const [started, setStarted] = useState(!isRandomMode);
  const [times, setTimes] = useState<number[]>([]);
  const [timeouts, setTimeouts] = useState<boolean[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState(0); // will init later
  const [total, setTotal] = useState(1);
  const startTimeRef = useRef<number>(0);

  // Init random sequence on mode switch
  useEffect(() => {
    if (isRandomMode) {
      const seq = shuffle(allCommands).slice(0, Math.max(2, Math.min(testConfig.count, allCommands.length)));
      setRandomCommands(seq);
      setCurrentIdx(0);
      setTimes([]);
      setTimeouts([]);
      setScore(seq.length); // full score
      setTotal(seq.length);
      setShowSummary(false);
      setCountdown(3);
      setStarted(false);
    } else {
      setScore(1);
      setTotal(1);
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
    } else if (!isRandomMode) {
      setStarted(true);
    }
  }, [countdown, isRandomMode]);

  const handleComplete = () => {
    const elapsed = Date.now() - startTimeRef.current;
    setTimes(prev => [...prev, elapsed]);
    setTimeouts(prev => [...prev, false]);
    // No score deduction for completion

    // Next game or summary
    if (isRandomMode) {
      if (currentIdx < randomCommands.length - 1) {
        setCurrentIdx(i => i + 1);
        startTimeRef.current = Date.now();
      } else {
        setShowSummary(true);
      }
    } else {
      onBack();
    }
  };

  const handleTimeout = () => {
    setTimes(prev => [...prev, 5000]); // 5 seconds
    setTimeouts(prev => [...prev, true]);
    setScore(prev => Math.max(0, prev - 1)); // Lose 1 point, minimum 0

    // Next game or summary
    if (isRandomMode) {
      if (currentIdx < randomCommands.length - 1) {
        setCurrentIdx(i => i + 1);
        startTimeRef.current = Date.now();
      } else {
        setShowSummary(true);
      }
    } else {
      onBack();
    }
  };

  // Determine active command
  const activeCmd: GameCommand | null = isRandomMode
    ? randomCommands[currentIdx]
    : command;

  // Render countdown
  if (isRandomMode && !started) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-8xl font-bold animate-pulse text-blue-900 mb-4">
            {countdown}
          </div>
          <p className="text-xl text-gray-600">
            Get ready for: <strong className="text-blue-900">{shortcuts[randomCommands[currentIdx]]?.name}</strong>
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Challenge {currentIdx + 1} of {randomCommands.length} • Score: {score}/{total}
          </div>
        </div>
      </div>
    );
  }

  // Render summary
  if (showSummary) {
    const completedCount = timeouts.filter(t => !t).length;
    const timedOutCount = timeouts.filter(t => t).length;
    const avgTime = completedCount > 0 ? times.filter((_, i) => !timeouts[i]).reduce((a, b) => a + b, 0) / completedCount : 0;
    const percentage = Math.round((score / total) * 100);

    const getScoreColor = (score: number) => {
      if (score >= 4) return 'text-green-600';
      if (score >= 2) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreMessage = (score: number) => {
      if (score === 5) return 'Perfect Score! 🏆';
      if (score >= 4) return 'Excellent Work! 🌟';
      if (score >= 2) return 'Good Effort! 👍';
      return 'Keep Practicing! 💪';
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-8">
        <div className="bg-white rounded-xl p-8 shadow-xl text-center border-l-4 border-blue-900 max-w-md w-full">
          <div className="mb-6">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${getScoreColor(score)}`} />
            <h2 className="text-3xl font-bold mb-2 text-blue-900">Test Complete!</h2>
            <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
              {getScoreMessage(score)}
            </p>
          </div>
          
          <div className="mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
              {score}/{total}
            </div>
            <div className="flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 mx-1 ${
                    i < score 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{completedCount}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{timedOutCount}</div>
              <div className="text-sm text-red-600">Timed Out</div>
            </div>
          </div>

          {completedCount > 0 && (
            <div className="mb-6">
              <p className="text-lg font-semibold text-blue-900 mb-2">Average Time</p>
              <p className="text-3xl font-mono text-blue-700">{(avgTime / 1000).toFixed(2)}s</p>
            </div>
          )}

          <div className="space-y-2 mb-6 text-left">
            {times.map((t, i) => (
              <div key={i} className={`flex justify-between p-2 rounded text-sm ${timeouts[i] ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <span>{shortcuts[randomCommands[i]].name}</span>
                <span className="font-mono">
                  {timeouts[i] ? (
                    <span className="flex items-center">
                      <X className="w-3 h-3 mr-1" />
                      Time Out (-1)
                    </span>
                  ) : (
                    `${(t / 1000).toFixed(2)}s`
                  )}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onBack}
            className="px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Render game view
  const getGameComponent = () => {
    switch (activeCmd) {
      case 'group':
        return <GroupShortcut isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      case 'duplicate':
        return <DuplicateShortcut timeLimit={timeLimit} isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      case 'alignTop':
        return <AlignTopShortcut timeLimit={timeLimit} isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      case 'distributeHorizontally':
        return <DistributeHorizontallyShortcut timeLimit={timeLimit} isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      case 'swapPositions':
        return <SwapPositionsShortcut timeLimit={timeLimit} isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      case 'alignTopFirst':
        return <AlignTopFirstShortcut timeLimit={timeLimit} isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      case 'groupSimilar':
        return <GroupSimilarShortcut timeLimit={timeLimit} isRandomMode={isRandomMode} onComplete={handleComplete} onTimeout={handleTimeout} />;
      default:
        return <div>Game not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen relative bg-white">
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="z-20 inline-flex items-center px-4 py-2 bg-brand-red hover:bg-brand-red/90 text-white rounded-lg shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        
        {isRandomMode && (
          <>
            <div className="bg-white px-4 py-2 rounded-lg shadow border border-blue-100">
              <span className="text-sm text-blue-900 font-medium">
                Challenge {currentIdx + 1} of {randomCommands.length}
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow border border-blue-100">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                <span className="text-sm text-blue-900 font-medium">
                  Score: {score}/{total}
                </span>
              </div>
            </div>
          </>
        )}
        
        {!isRandomMode && (
          <div className="bg-white px-4 py-2 rounded-lg shadow border border-blue-100">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
              <span className="text-sm text-blue-900 font-medium">
                Score: {score}/{total}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {activeCmd && getGameComponent()}
    </div>
  );
};

export default ShortcutGameWrapper;