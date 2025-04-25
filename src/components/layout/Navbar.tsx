'use client';

import Link from 'next/link';
import ConnectWalletButton from '../ui/ConnectWalletButton';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 rounded bg-[#00FF00] flex items-center justify-center">
              <span className="text-black font-bold">N</span>
            </div>
            <span className="ml-2 text-sm font-medium">NFT Battles</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-1">
              <Link 
                href="/tournaments" 
                className="text-sm text-gray-600 hover:text-gray-900 px-2"
              >
                Tournaments
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/leaderboard" 
                className="text-sm text-gray-600 hover:text-gray-900 px-2"
              >
                Leaderboard
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/how-to-play" 
                className="text-sm text-gray-600 hover:text-gray-900 px-2"
              >
                How to play
              </Link>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
