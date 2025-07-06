'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConnectWalletButton from '../ui/ConnectWalletButton';
import { NetworkStatus } from '../ui/NetworkStatus';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="w-full">
        <div className="flex items-center h-16 px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Logo - Responsive width */}
          <div className="flex-shrink-0 flex-1 md:flex-none md:w-[350px]">
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

          {/* Right side items - Responsive width */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Theme Toggle - Hide on smallest screens */}
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
              className="hidden sm:block p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 block dark:hidden" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            </button>

            {/* Network Status - Hide on mobile */}
            <div className="hidden sm:block">
              <NetworkStatus />
            </div>

            {/* Connect Wallet Button */}
            <ConnectWalletButton />

            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-1 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
            <Link 
              href="/tournaments" 
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Tournaments
            </Link>
            <Link 
              href="/create-tournament" 
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Tournament
            </Link>
            <Link 
              href="/leaderboard" 
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Leaderboard
            </Link>
            <Link 
              href="/how-to-play" 
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Play
            </Link>
            
            {/* Divider */}
            <div className="my-3 border-t border-gray-800"></div>
            
            {/* Mobile Theme Toggle */}
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
                closeMobileMenu();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Theme
              <span className="ml-auto text-sm text-gray-500">
                {typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}
              </span>
            </button>
            
            {/* Mobile Network Status */}
            <div className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Network
              <span className="ml-auto text-sm text-gray-500">Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
