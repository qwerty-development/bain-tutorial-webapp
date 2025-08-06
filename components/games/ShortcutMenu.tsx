'use client';

import React, { useState } from 'react';
import { Play, Shuffle, Keyboard, Clock, Star } from 'lucide-react';

// Assuming the company logo is placed in /public/logo.svg
import Image from 'next/image';
import { shortcuts } from '@/utils/shortcut';

type GameCommand = 'group' | 'duplicate' | 'alignTop' | 'distributeHorizontally' | 'alignTopFirst' | 'swapPositions' | 'groupSimilar';

interface MenuProps {
  onSelect: (cmd: GameCommand) => void;
  onRandom: (cfg: { count: number; difficulty: 'easy' | 'normal' | 'hard' }) => void;
  os: 'mac' | 'windows';
}

const ShortcutMenu: React.FC<MenuProps> = ({ onSelect, onRandom, os }) => {
  const implementedShortcuts: GameCommand[] = ['group', 'duplicate', 'alignTop', 'alignTopFirst', 'distributeHorizontally'];
  const comingSoonShortcuts: GameCommand[] = ['swapPositions', 'groupSimilar'];
  const [selectCount, setSelectCount] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showConfig, setShowConfig] = useState(false);
  const maxGames = implementedShortcuts.length;

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-white">
      <div className="max-w-4xl w-full text-center">      
        <div className="mb-8">
          <Image src="/logo.svg" alt="Company Logo" width={400} height={120} className="mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-brand-blue mb-4">
            PowerPoint Shortcut Trainer
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Master PowerPoint shortcuts with interactive challenges
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-blue-100">
            <Keyboard className="w-4 h-4 mr-2 text-brand-blue" />
            <span className="text-sm text-brand-blue font-medium">
              Detected: {os === 'mac' ? 'macOS' : 'Windows'}
            </span>
          </div>
          {os === 'mac' && (
            <p className="mt-2 text-xs text-yellow-600 flex items-center justify-center">
              ⚠️ Some shortcuts may be limited on macOS due to system key restrictions
            </p>
          )}
        </div>

        {/* Implemented Shortcuts */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-blue mb-6">Available Challenges</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {implementedShortcuts.map((key) => {
              const s = shortcuts[key];
              return (
                <button
                  key={key}
                  onClick={() => onSelect(key)}
                  className="group p-6 bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-brand-gray/20 hover:border-brand-gray text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Play className="w-6 h-6 text-brand-blue group-hover:text-brand-blue/80" />
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
                  <h3 className="text-lg font-semibold text-brand-red mb-2">
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
          <div className="space-y-4 mt-8">
            <button
              onClick={()=>setShowConfig(true)}
              className="inline-flex items-center px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Shuffle className="w-5 h-5 mr-3" />
              🎯 Test Mode
              <div className="ml-4 flex items-center gap-2 bg-blue-700 px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm">5 Points</span>
              </div>
            </button>
          </div>
        </div>

        {/* Config Overlay */}
        {showConfig && (
          <div className="fixed inset-0 bg-brand-gray/80 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-brand-blue mb-6 text-center">Test Setup</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-blue mb-2">Number of Challenges: {selectCount}</label>
                <input type="range" min={2} max={maxGames} value={selectCount} onChange={e=>setSelectCount(Number(e.target.value))} className="w-full" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-blue mb-2">Difficulty</label>
                <div className="flex justify-between gap-2">
                  {[
                    {id:'easy',label:'Easy'},
                    {id:'normal',label:'Not Bad'},
                    {id:'hard',label:'Bain Consultant'}
                  ].map(({id,label})=> (
                    <button key={id} onClick={()=>setDifficulty(id as any)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${difficulty===id?'bg-brand-blue text-white':'bg-gray-200 text-brand-blue'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button onClick={()=>setShowConfig(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-brand-blue font-semibold">Cancel</button>
                <button onClick={()=>{onRandom({count:selectCount,difficulty});setShowConfig(false);}} className="px-4 py-2 rounded-lg bg-brand-blue text-white font-semibold">Start</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Each challenge has a 5-second time limit • Press shortcuts exactly as shown
          </p>
          <p className="text-xs text-gray-400">
            Test Mode: Start with 5 points, lose 1 point for each timeout
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutMenu;