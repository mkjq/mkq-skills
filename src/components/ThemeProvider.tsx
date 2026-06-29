"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type Direction = 'rtl' | 'ltr';
type ThemeColor = 'emerald' | 'blue' | 'purple' | 'rose';
type ThemeShape = 'sharp' | 'rounded' | 'pill';
type ThemeSize = 'small' | 'medium' | 'large';

type ThemeContextType = {
  theme: Theme;
  direction: Direction;
  themeColor: ThemeColor;
  shape: ThemeShape;
  size: ThemeSize;
  toggleTheme: () => void;
  setDirection: (dir: Direction) => void;
  setThemeColor: (color: ThemeColor) => void;
  setShape: (shape: ThemeShape) => void;
  setSize: (size: ThemeSize) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  direction: 'rtl',
  themeColor: 'emerald',
  shape: 'rounded',
  size: 'medium',
  toggleTheme: () => {},
  setDirection: () => {},
  setThemeColor: () => {},
  setShape: () => {},
  setSize: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [direction, setDirection] = useState<Direction>('rtl');
  const [themeColor, setThemeColor] = useState<ThemeColor>('emerald');
  const [shape, setShape] = useState<ThemeShape>('rounded');
  const [size, setSize] = useState<ThemeSize>('medium');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const st = localStorage.getItem('app-theme') as Theme || 'dark';
    const sd = localStorage.getItem('app-dir') as Direction || 'rtl';
    const sc = localStorage.getItem('app-color') as ThemeColor || 'emerald';
    const ss = localStorage.getItem('app-shape') as ThemeShape || 'rounded';
    const ssz = localStorage.getItem('app-size') as ThemeSize || 'medium';

    setTheme(st);
    setDirection(sd);
    setThemeColor(sc);
    setShape(ss);
    setSize(ssz);

    document.documentElement.setAttribute('data-theme', st);
    document.documentElement.setAttribute('dir', sd);
    document.documentElement.setAttribute('data-color', sc);
    document.documentElement.setAttribute('data-shape', ss);
    document.documentElement.setAttribute('data-size', ssz);
  }, []);

  const updateState = (key: string, val: string, updater: any, attr: string) => {
    updater(val);
    localStorage.setItem(key, val);
    document.documentElement.setAttribute(attr, val);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    updateState('app-theme', newTheme, setTheme, 'data-theme');
  };

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, direction, themeColor, shape, size, 
      toggleTheme, 
      setDirection: (d) => updateState('app-dir', d, setDirection, 'dir'),
      setThemeColor: (c) => updateState('app-color', c, setThemeColor, 'data-color'),
      setShape: (s) => updateState('app-shape', s, setShape, 'data-shape'),
      setSize: (s) => updateState('app-size', s, setSize, 'data-size')
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
