'use client';

import React from 'react';
import { Play, Shuffle, Keyboard } from 'lucide-react';
import { shortcuts } from '@/utils/shortcut';

interface MenuProps {
  onSelect: (cmd: 'group' | 'duplicate') => void;
  onRandom: () => void;
  os: 'mac' | 'windows';
}

const ShortcutMenu: React.FC<MenuProps> = ({ onSelect, onRandom, os }) => (
  <div className="flex items-center justify-center min-h-screen p-8">
    <div className="max-w-2xl w-full text-center">      
      <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
        PowerPoint Shortcut Trainer
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        Master PowerPoint shortcuts with interactive challenges
      </p>
      <div className="mb-8 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
        <Keyboard className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-blue-800 dark:text-blue-200">
          Detected: {os === 'mac' ? 'macOS' : 'Windows'}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {Object.entries(shortcuts).map(([key, s]) => (
          <button
            key={key}
            onClick={() => onSelect(key as 'group' | 'duplicate')}
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-gray-700 dark:text-gray-300">
                {os === 'mac' ? s.displayMac : s.displayWindows}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {s.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {s.description}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={onRandom}
        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Shuffle className="w-5 h-5 mr-2" />
        🎲 Random Mode
      </button>
    </div>
  </div>
);

export default ShortcutMenu;