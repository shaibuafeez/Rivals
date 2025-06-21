'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ShareTournamentEntryProps {
  tournamentId: string;
  entryId: string;
  tournamentName?: string;
  nftName?: string;
}

export default function ShareTournamentEntry({ tournamentId, entryId, tournamentName, nftName }: ShareTournamentEntryProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const shareUrl = `${window.location.origin}/tournaments/${tournamentId}?entry=${entryId}`;
  const shareText = `I just entered ${nftName ? `my "${nftName}" NFT in ` : ''}${tournamentName ? `the "${tournamentName}" tournament` : 'a tournament'}! Check out my entry and join the competition!`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl} #NFTTournament #SuiNetwork`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };
  
  const shareOnDiscord = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    navigator.clipboard.writeText(decodeURIComponent(text));
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  // Animation variants for smoother transitions
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 * custom, duration: 0.3 }
    })
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-500/5 to-transparent rounded-full -ml-32 -mb-32"></div>
      
      <motion.div 
        className="relative z-10"
        variants={itemVariants}
        custom={0}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} custom={1}>
        <h3 className="text-xl font-bold mb-2 text-center text-white">Entry Confirmed!</h3>
        <p className="text-gray-300 mb-6 text-center">
          You&apos;ve successfully entered {tournamentName ? `the "${tournamentName}" tournament` : 'the tournament'}. 
          Share your entry with friends and invite them to join!
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} custom={2} className="relative mb-5">
        <div className="relative">
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            className="w-full p-3 pr-28 border border-gray-700 rounded-lg text-sm bg-gray-700/50 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={copyToClipboard}
            className={`absolute right-1 top-1 text-white px-4 py-2 rounded-md text-sm font-medium transition-all ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} custom={3} className="grid grid-cols-2 gap-3 mb-5">
        <button 
          onClick={shareOnTwitter}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#1DA1F2] to-[#0d8bd9] text-white p-3 rounded-lg hover:from-[#1a94df] hover:to-[#0d8bd9] transition-all shadow-lg shadow-blue-900/20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
          Share on Twitter
        </button>
        <div className="relative">
          <button 
            onClick={shareOnDiscord}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#5865F2] to-[#4752c4] text-white p-3 rounded-lg hover:from-[#4a57e0] hover:to-[#3a45b3] transition-all shadow-lg shadow-indigo-900/20"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Share on Discord
          </button>
          {showTooltip && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap"
            >
              Copied to clipboard!
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} custom={4} className="text-center">
        <Link 
          href="/tournaments" 
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to tournaments
        </Link>
      </motion.div>
    </motion.div>
  );
}
