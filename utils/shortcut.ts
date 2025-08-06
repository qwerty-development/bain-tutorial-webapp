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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setProgress(0);
    setError(false);
    setCompleted(false);
    setCurrentKey(null);
    setPressedKeys([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Handle key input
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (completed) return;
      const key = e.key.toLowerCase();
      // Always start with alt
      if (progress === 0 && key !== 'alt') {
        setError(true);
        setProgress(0);
        setPressedKeys([]);
        setCurrentKey(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        return;
      }
      // Check if key matches expected
      if (key === sequence[progress]) {
        setProgress((p) => p + 1);
        setError(false);
        setCurrentKey(key);
        setPressedKeys((prev) => [...prev, key]);
        if (timerRef.current) clearTimeout(timerRef.current);
        // If completed
        if (progress + 1 === sequence.length) {
          setCompleted(true);
        } else {
          // Set timeout for next key
          timerRef.current = setTimeout(() => {
            setError(true);
            setProgress(0);
            setPressedKeys([]);
            setCurrentKey(null);
          }, timeoutMs);
        }
      } else {
        setError(true);
        setProgress(0);
        setPressedKeys([]);
        setCurrentKey(null);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    },
    [progress, sequence, completed, timeoutMs]
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