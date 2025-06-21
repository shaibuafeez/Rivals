'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <span className="text-yellow-500 text-sm font-bold">☀️</span>
      ) : (
        <span className="text-gray-700 text-sm font-bold">🌙</span>
      )}
    </button>
  );
}
