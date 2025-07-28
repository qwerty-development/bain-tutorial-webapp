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