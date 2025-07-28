import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Position { x: number; y: number; color: 'red' | 'blue'; }
interface GroupSimilarShortcutProps {
  onComplete?: () => void;
  onTimeout?: () => void;
  isRandomMode?: boolean;
  timeLimit?: number;
}

const macKeyMap: Record<string, string> = { '∫': 'b', 'ß': 's', '≈': 'x', 'å': 'a', '©': 'g' };

const GroupSimilarShortcut: React.FC<GroupSimilarShortcutProps> = ({ onComplete, onTimeout, isRandomMode = false, timeLimit = 5 }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [grouped, setGrouped] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(isRandomMode ? timeLimit : 0);
  const [sequence, setSequence] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const done = useRef(false);

  // init
  useEffect(() => {
    const initial: Position[] = [
      { x: 30, y: 40, color: 'red' },
      { x: 160, y: 60, color: 'red' },
      { x: 70, y: 160, color: 'blue' },
      { x: 200, y: 140, color: 'blue' },
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

  useEffect(() => {
    if (!isRandomMode) return;
    if (timeLeft === 0 && !completed) {
      onTimeout?.();
    }
  }, [timeLeft, completed, onTimeout, isRandomMode]);

  const normalizeKey = (key: string, alt: boolean) => {
    if (alt && /^[a-z]$/i.test(key)) return key.toLowerCase();
    return macKeyMap[key] ?? key.toLowerCase();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (completed) return;
    const normalized = normalizeKey(e.key, e.altKey);
    const mapped = normalized === 'meta' ? 'cmd' : normalized;
    setPressedKeys((prev) => (prev.includes(mapped) ? prev : [...prev, mapped]));

    // sequence alt + x + b + s
    if (e.altKey && normalized === 'x') setSequence(['x']);
    else if (e.altKey && sequence.length === 1 && sequence[0] === 'x' && normalized === 'b') setSequence(['x', 'b']);
    else if (e.altKey && sequence.length === 2 && sequence[1] === 'b' && normalized === 's') {
      if (!done.current) {
        done.current = true;
        setGrouped(true);
        const end = Date.now();
        setCompletionTime(end - (startTime || end));
        if (timerRef.current) clearInterval(timerRef.current);
        if (isRandomMode) setTimeout(() => onComplete?.(), 800);
        else setTimeout(() => setCompleted(true), 800);
      }
    } else if (!e.altKey) setSequence([]);
    e.preventDefault();
  }, [sequence, completed, startTime, isRandomMode, onComplete]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const normalized = normalizeKey(e.key, e.altKey);
    const mapped = normalized === 'meta' ? 'cmd' : normalized;
    setPressedKeys((prev) => prev.filter((k) => k !== mapped));
  }, []);

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
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Grouped! 🎉</h2>
          <p className="text-gray-600 font-mono mb-4">Completed in {(completionTime / 1000).toFixed(2)}s</p>
          <button onClick={() => onComplete?.()} className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg">Continue</button>
        </div>
      </div>
    );
  }

  const redTarget = { x: 40, y: 80 };
  const blueTarget = { x: 160, y: 80 };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8 relative">
      {isRandomMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-[20rem] font-bold opacity-10 transition-all duration-300 ${timeLeft <= 2 ? 'text-red-500 animate-pulse' : 'text-blue-900'}`}>{timeLeft}</div>
        </div>
      )}

      <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-blue-900 z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-900">Group Similar Elements</h2>
          {isRandomMode && <div className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-900'}`}>{timeLeft}s</div>}
        </div>

        <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl mb-4 border-2 border-gray-200">
          {positions.map((pos, i) => {
            const target = grouped ? (pos.color === 'red' ? redTarget : blueTarget) : { x: pos.x, y: pos.y };
            return (
              <motion.div
                key={i}
                className={`absolute w-10 h-10 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm ${pos.color === 'red' ? 'bg-brand-red' : 'bg-brand-blue'}`}
                initial={{ x: pos.x, y: pos.y }}
                animate={{ x: target.x, y: target.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-gray-600">Press <span className="font-mono bg-blue-100 px-2 py-1 rounded">Alt + X + B + S</span> to group similar</p>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {pressedKeys.map((k, idx) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-mono border border-blue-200">{k === 'alt' ? 'Alt' : k.toUpperCase()}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupSimilarShortcut; 