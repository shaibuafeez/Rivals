'use client';

import Link from 'next/link';
import Image from 'next/image';
import ConnectWalletButton from '../ui/ConnectWalletButton';
import { NetworkStatus } from '../ui/NetworkStatus';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center h-16">
          {/* Logo - Fixed width */}
          <div className="flex-shrink-0 w-[350px]">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ink-900 to-ink-700 p-0.5">
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[5px] flex items-center justify-center">
                  <span className="text-base font-bold bg-gradient-to-r from-ink-900 to-ink-600 bg-clip-text text-transparent">R</span>
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-ink-700 dark:group-hover:text-ink-400 transition-colors">Rivals</span>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <nav className="flex items-center space-x-8">
              <Link 
                href="/tournaments" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-ink-800 dark:hover:text-ink-300 transition-colors whitespace-nowrap"
              >
                Tournaments
              </Link>
              <Link 
                href="/create-tournament" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-ink-800 dark:hover:text-ink-300 transition-colors whitespace-nowrap"
              >
                Create Tournament
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-ink-800 dark:hover:text-ink-300 transition-colors whitespace-nowrap"
              >
                Leaderboard
              </Link>
              <Link 
                href="/how-to-play" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-ink-800 dark:hover:text-ink-300 transition-colors whitespace-nowrap"
              >
                How to Play
              </Link>
            </nav>
          </div>

          {/* Right side items - Fixed width */}
          <div className="flex items-center space-x-2 w-[350px] justify-end">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                const html = document.documentElement;
                const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
                
                if (currentTheme === 'dark') {
                  html.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } else {
                  html.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }
              }}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 block dark:hidden" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            </button>

            {/* Network Status */}
            <NetworkStatus />

            {/* Connect Wallet Button */}
            <ConnectWalletButton />

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
