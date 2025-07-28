'use client';

import React from 'react';
import { Play, Shuffle, Keyboard, Clock, Star } from 'lucide-react';
import { shortcuts } from '@/utils/shortcut';

type GameCommand = 'group' | 'duplicate' | 'alignTop' | 'distributeHorizontally' | 'alignTopFirst' | 'swapPositions' | 'groupSimilar';

interface MenuProps {
  onSelect: (cmd: GameCommand) => void;
  onRandom: () => void;
  os: 'mac' | 'windows';
}

const ShortcutMenu: React.FC<MenuProps> = ({ onSelect, onRandom, os }) => {
  const implementedShortcuts: GameCommand[] = ['group', 'duplicate', 'alignTop', 'distributeHorizontally', 'swapPositions'];
  const comingSoonShortcuts: GameCommand[] = ['alignTopFirst', 'groupSimilar'];

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl w-full text-center">      
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            PowerPoint Shortcut Trainer
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Master PowerPoint shortcuts with interactive challenges
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-blue-100">
            <Keyboard className="w-4 h-4 mr-2 text-blue-900" />
            <span className="text-sm text-blue-900 font-medium">
              Detected: {os === 'mac' ? 'macOS' : 'Windows'}
            </span>
          </div>
        </div>

        {/* Implemented Shortcuts */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">Available Challenges</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {implementedShortcuts.map((key) => {
              const s = shortcuts[key];
              return (
                <button
                  key={key}
                  onClick={() => onSelect(key)}
                  className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-100 hover:border-blue-200 text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Play className="w-6 h-6 text-blue-900 group-hover:text-blue-700" />
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600">5s</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-blue-600">1pt</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-mono bg-blue-50 px-3 py-1 rounded text-blue-800 border border-blue-100">
                      {os === 'mac' ? s.displayMac : s.displayWindows}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {s.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {s.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Shortcuts */}
        {comingSoonShortcuts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Coming Soon</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {comingSoonShortcuts.map((key) => {
                const s = shortcuts[key];
                return (
                  <div
                    key={key}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-left opacity-60"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Play className="w-6 h-6 text-gray-400" />
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-500">
                        Soon
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-600 border border-gray-200">
                        {os === 'mac' ? s.displayMac : s.displayWindows}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {s.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Random Mode Button */}
        <div className="flex justify-center">
          <button
            onClick={onRandom}
            className="inline-flex items-center px-8 py-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Shuffle className="w-5 h-5 mr-3" />
            🎯 Random Test Mode
            <div className="ml-4 flex items-center gap-2 bg-blue-700 px-3 py-2 rounded-lg">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">5 Points</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Each challenge has a 5-second time limit • Press shortcuts exactly as shown
          </p>
          <p className="text-xs text-gray-400">
            Random Test: Start with 5 points, lose 1 point for each timeout
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutMenu;