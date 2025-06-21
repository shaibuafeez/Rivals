'use client';

// This component adds a script to initialize dark mode
// It prevents the flash of light mode when the page loads
export default function ThemeScript() {
  const themeScript = `
    (function() {
      // Check for saved theme preference or use the system preference
      const savedTheme = localStorage.getItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      // Apply the theme
      if (savedTheme === 'dark' || (!savedTheme && systemTheme === 'dark')) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
