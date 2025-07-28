// File: src/components/PowerPointShortcutTrainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ShortcutMenu from './games/ShortcutMenu';
import ShortcutGameWrapper from './games/ShortcutGameWrapper';
import { detectOS } from '@/utils/detectOS';

type View = 'menu' | 'config' | 'game';
type Difficulty = 'easy' | 'normal' | 'hard';

interface TestConfig {
  count: number;
  difficulty: Difficulty;
}

type Command = 'group' | 'duplicate' | 'alignTop' | 'distributeHorizontally' | 'alignTopFirst' | 'swapPositions' | 'groupSimilar' | null;

const PowerPointShortcutTrainer: React.FC = () => {
  const [view, setView] = useState<View>('menu');
  const [command, setCommand] = useState<Command>(null);
  const [randomMode, setRandomMode] = useState<boolean>(false);
  const [testConfig, setTestConfig] = useState<TestConfig>({ count: 5, difficulty: 'normal' });
  const [os, setOs] = useState<'mac' | 'windows'>('windows');

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const handleSelect = (cmd: Exclude<Command, null>) => {
    setCommand(cmd);
    setRandomMode(false);
    setView('game');
  };

  const handleRandom = (cfg: TestConfig) => {
    setTestConfig(cfg);
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
    <div className="min-h-screen bg-white">
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
          testConfig={testConfig}
          os={os}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default PowerPointShortcutTrainer;