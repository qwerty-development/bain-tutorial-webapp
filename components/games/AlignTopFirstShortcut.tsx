import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface AlignTopFirstShortcutProps {
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

// Mac special char mapping
const macKeyMap: Record<string, string> = {
  '≈': 'x',
  'å': 'a',
  '†': 't',
  '∂': 'd',
  '˙': 'h',
  'π': 'p',
  'ß': 's',
  '∑': 'w',
  '∫': 'b',
  '©': 'g',
};

const AlignTopFirstShortcut: React.FC<AlignTopFirstShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [aligned, setAligned] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const [sequence, setSequence] = useState<string[]>([]);
  const done = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // init positions
  useEffect(() => {
    const initial: Position[] = [
      { x: 100, y: 20 }, // first reference box top
      { x: 40, y: 150 },
      { x: 160, y: 190 },
      { x: 80, y: 120 },
    ];
    setPositions(initial);
    setStartTime(Date.now());
  }, []);

  // timer
  useEffect(() => {
    if (!isRandomMode) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
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

  // timeout
  useEffect(() => {
    if (!isRandomMode) return;
    if (timeLeft === 0 && !completed) {
      onTimeout?.();
    }
  }, [timeLeft, completed, onTimeout, isRandomMode]);

  const normalizeKey = (key: string, altPressed: boolean): string => {
    if (altPressed && /^[a-zA-Z]$/.test(key)) {
      return key.toLowerCase();
    }
    if (macKeyMap[key]) return macKeyMap[key];
    return key.toLowerCase();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    const normalized = normalizeKey(e.key, e.altKey);
    const mapped = normalized === 'meta' ? 'cmd' : normalized;
    setPressedKeys((prev) => (prev.includes(mapped) ? prev : [...prev, mapped]));

    // sequence alt + p + a + t
    if (e.altKey && normalized === 'p') {
      setSequence(['p']);
    } else if (e.altKey && sequence.length === 1 && sequence[0] === 'p' && normalized === 'a') {
      setSequence(['p', 'a']);
    } else if (e.altKey && sequence.length === 2 && sequence[1] === 'a' && normalized === 't') {
      if (!done.current) {
        done.current = true;
        setAligned(true);
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
  }, [completed, sequence, startTime, isRandomMode, onComplete]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    const normalized = normalizeKey(e.key, e.altKey);
    const mapped = normalized === 'meta' ? 'cmd' : normalized;
    setPressedKeys((prev) => prev.filter((k) => k !== mapped));
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
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Aligned! 🎉</h2>
          <p className="text-gray-600 font-mono mb-4">Completed in {(completionTime / 1000).toFixed(2)}s</p>
          <button
            onClick={() => onComplete?.()}
            className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
      {isRandomMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-[20rem] font-bold opacity-10 transition-all duration-300 ${timeLeft <= 2 ? 'text-red-500 animate-pulse' : 'text-blue-900'}`}>{timeLeft}</div>
        </div>
      )}

      <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-blue-900 z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-900">Align Top to First</h2>
          {isRandomMode && (
            <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>{timeLeft}s</div>
          )}
        </div>

        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          {positions.map((pos, i) => {
            const targetY = aligned ? positions[0].y : pos.y;
            return (
              <motion.div
                key={i}
                className="absolute w-10 h-10 bg-blue-900 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm"
                initial={{ x: pos.x, y: pos.y }}
                animate={{ x: pos.x, y: targetY }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {i + 1}
              </motion.div>
            );
          })}
          {/* guide line */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-blue-300 opacity-50"
            initial={{ y: positions[0]?.y || 20, opacity: 0 }}
            animate={{ y: aligned ? (positions[0]?.y || 20) : positions[0]?.y || 20, opacity: aligned ? 1 : 0.3 }}
          />
        </div>

        <p className="mt-4 text-center text-gray-600">
          Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">Alt + P + A + T</span> to align top to first
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {pressedKeys.map((k, idx) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-mono border border-blue-200">
              {k === 'alt' ? 'Alt' : k.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlignTopFirstShortcut; 