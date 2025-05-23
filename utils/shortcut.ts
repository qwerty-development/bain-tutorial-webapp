export interface Shortcut {
  name: string;
  description: string;
  mac: string[];
  windows: string[];
  displayMac: string;
  displayWindows: string;
}

export const shortcuts: Record<'group' | 'duplicate', Shortcut> = {
  group: {
    name: 'Group Objects',
    description: 'Group selected objects together',
    mac: ['cmd', 'alt', 'g'],
    windows: ['ctrl', 'alt', 'g'],
    displayMac: '⌘ + ⌥ + G',
    displayWindows: 'Ctrl + Alt + G',
  },
  duplicate: {
    name: 'Duplicate Slide',
    description: 'Duplicate the current slide',
    mac: ['cmd', 'd'],
    windows: ['ctrl', 'd'],
    displayMac: '⌘ + D',
    displayWindows: 'Ctrl + D',
  },
};

export const keyDisplayMap: Record<string, string> = {
  cmd: '⌘',
  ctrl: 'Ctrl',
  alt: '⌥',
  shift: '⇧',
  meta: '⌘',
};