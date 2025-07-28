// File: src/components/PowerPointShortcutTrainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ShortcutMenu from './games/ShortcutMenu';
import ShortcutGameWrapper from './games/ShortcutGameWrapper';
import { detectOS } from '@/utils/detectOS';

type View = 'menu' | 'game';
type Command = 'group' | 'duplicate' | 'alignTop' | 'distributeHorizontally' | 'alignTopFirst' | 'swapPositions' | 'groupSimilar' | null;

const PowerPointShortcutTrainer: React.FC = () => {
  const [view, setView] = useState<View>('menu');
  const [command, setCommand] = useState<Command>(null);
  const [randomMode, setRandomMode] = useState<boolean>(false);
  const [os, setOs] = useState<'mac' | 'windows'>('windows');

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const handleSelect = (cmd: Exclude<Command, null>) => {
    setCommand(cmd);
    setRandomMode(false);
    setView('game');
  };

  const handleRandom = () => {
    setRandomMode(true);
    setCommand(null);
    setView('game');
  };

  const handleBack = () => {
    setView('menu');
    setCommand(null);
    setRandomMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {view === 'menu' ? (
        <ShortcutMenu
          onSelect={handleSelect}
          onRandom={handleRandom}
          os={os}
        />
      ) : (
        <ShortcutGameWrapper
          command={command}
          isRandomMode={randomMode}
          os={os}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default PowerPointShortcutTrainer;