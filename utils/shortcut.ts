export interface Shortcut {
  name: string;
  description: string;
  mac: string[];
  windows: string[];
  displayMac: string;
  displayWindows: string;
}

export const shortcuts: Record<'group' | 'duplicate' | 'alignTop' | 'distributeHorizontally' | 'alignTopFirst' | 'swapPositions' | 'groupSimilar', Shortcut> = {
  group: {
    name: 'Group Objects',
    description: 'Group selected objects together',
    mac: ['cmd', 'g'],
    windows: ['ctrl', 'g'],
    displayMac: '⌘ + G',
    displayWindows: 'Ctrl + G',
  },
  duplicate: {
    name: 'Duplicate Slide',
    description: 'Duplicate the current slide',
    mac: ['cmd', 'd'],
    windows: ['ctrl', 'd'],
    displayMac: '⌘ + D',
    displayWindows: 'Ctrl + D',
  },
  alignTop: {
    name: 'Align Top',
    description: 'Align selected objects to the top',
    mac: ['alt', 'x', 'a', 't'],
    windows: ['alt', 'x', 'a', 't'],
    displayMac: '⌥ + X + A + T',
    displayWindows: 'Alt + X + A + T',
  },
  distributeHorizontally: {
    name: 'Distribute Horizontally',
    description: 'Distribute objects horizontally with equal spacing',
    mac: ['alt', 'x', 'd', 'h'],
    windows: ['alt', 'x', 'd', 'h'],
    displayMac: '⌥ + X + D + H',
    displayWindows: 'Alt + X + D + H',
  },
  alignTopFirst: {
    name: 'Align Top to First',
    description: 'Align objects to the top of the first selected element',
    mac: ['alt', 'p', 'a', 't'],
    windows: ['alt', 'p', 'a', 't'],
    displayMac: '⌥ + P + A + T',
    displayWindows: 'Alt + P + A + T',
  },
  swapPositions: {
    name: 'Swap Positions',
    description: 'Swap positions between two selected elements',
    mac: ['alt', 'p', 's', 'w'],
    windows: ['alt', 'p', 's', 'w'],
    displayMac: '⌥ + P + S + W',
    displayWindows: 'Alt + P + S + W',
  },
  groupSimilar: {
    name: 'Group Similar Elements',
    description: 'Group similar elements together',
    mac: ['alt', 'x', 'b', 's'],
    windows: ['alt', 'x', 'b', 's'],
    displayMac: '⌥ + X + B + S',
    displayWindows: 'Alt + X + B + S',
  },
};

export const keyDisplayMap: Record<string, string> = {
  cmd: '⌘',
  ctrl: 'Ctrl',
  alt: '⌥',
  shift: '⇧',
  meta: '⌘',
  x: 'X',
  a: 'A',
  t: 'T',
  d: 'D',
  h: 'H',
  p: 'P',
  s: 'S',
  w: 'W',
  b: 'B',
  g: 'G',
};

import { useState, useRef, useEffect, useCallback } from 'react';

export interface SequentialShortcutState {
  progress: number; // how many keys correct so far
  error: boolean;
  completed: boolean;
  currentKey: string | null;
  reset: () => void;
  handleKey: (e: KeyboardEvent) => void;
  pressedKeys: string[];
}

/**
 * PowerPoint-style sequential shortcut input hook
 * @param sequence The shortcut sequence (e.g., ['alt', 'x', 'a', 't'])
 * @param timeoutMs Timeout between key presses (default 1500ms)
 * @returns SequentialShortcutState
 */
export function useSequentialShortcut(
  sequence: string[],
  timeoutMs: number = 1500
): SequentialShortcutState {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [altPressed, setAltPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Reset state
  const reset = useCallback(() => {
    setProgress(0);
    setError(false);
    setCompleted(false);
    setCurrentKey(null);
    setPressedKeys([]);
    setAltPressed(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Handle key input
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (completed) return;
      
      const key = e.key.toLowerCase();
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      const alt = e.altKey;
      
      // Track Alt key state
      if (key === 'alt') {
        setAltPressed(alt);
        if (alt) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
      
      // Handle Ctrl+D type shortcuts (simultaneous press)
      if (sequence.length === 2 && sequence[0] === 'ctrl' && sequence[1] === 'd') {
        if (ctrl && key === 'd') {
          setCompleted(true);
          setProgress(2);
          setPressedKeys(['ctrl', 'd']);
          e.preventDefault();
          return;
        }
        return;
      }
      
      // Handle Ctrl+G type shortcuts (simultaneous press)
      if (sequence.length === 2 && sequence[0] === 'ctrl' && sequence[1] === 'g') {
        if (ctrl && key === 'g') {
          setCompleted(true);
          setProgress(2);
          setPressedKeys(['ctrl', 'g']);
          e.preventDefault();
          return;
        }
        return;
      }
      
      // Handle sequential shortcuts (Alt + X + A + T, etc.)
      if (sequence.length > 2) {
        // Start sequence with Alt
        if (progress === 0 && key === 'alt' && alt) {
          setProgress(1);
          setError(false);
          setCurrentKey(key);
          setPressedKeys([key]);
          setAltPressed(true);
          e.preventDefault();
          e.stopPropagation();
          
          // Set timeout for next key
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setError(true);
            setProgress(0);
            setPressedKeys([]);
            setCurrentKey(null);
            setAltPressed(false);
          }, timeoutMs);
          return;
        }
        
        // Continue sequence after Alt (X, A, T, etc.)
        if (progress > 0 && key === sequence[progress]) {
          setProgress(progress + 1);
          setError(false);
          setCurrentKey(key);
          setPressedKeys(prev => [...prev, key]);
          e.preventDefault();
          e.stopPropagation();
          
          // If completed
          if (progress + 1 === sequence.length) {
            setCompleted(true);
            if (timerRef.current) clearTimeout(timerRef.current);
          } else {
            // Set timeout for next key
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setError(true);
              setProgress(0);
              setPressedKeys([]);
              setCurrentKey(null);
              setAltPressed(false);
            }, timeoutMs);
          }
          return;
        }
        
        // Wrong key in sequence
        if (progress > 0 && key !== sequence[progress]) {
          setError(true);
          setProgress(0);
          setPressedKeys([]);
          setCurrentKey(null);
          setAltPressed(false);
          if (timerRef.current) clearTimeout(timerRef.current);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    [progress, sequence, completed, timeoutMs, isMac]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    progress,
    error,
    completed,
    currentKey,
    reset,
    handleKey,
    pressedKeys,
  };
}