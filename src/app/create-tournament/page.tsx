'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Transaction } from '@mysten/sui/transactions';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Trophy, Coins, Users, Shield } from 'lucide-react';

export default function CreateTournamentPage() {
  const { isConnected, address, executeTransaction } = useWallet();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [duration, setDuration] = useState(72); // Default 72 hours
  const [creating, setCreating] = useState(false);

  const handleCreateTournament = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!name || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      
      // Create transaction using the simple tournament package
      const tx = new Transaction();
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID!;
      
      // Convert strings to Uint8Array for the Move function
      const nameBytes = Array.from(new TextEncoder().encode(name));
      const descriptionBytes = Array.from(new TextEncoder().encode(description));
      const bannerUrlBytes = Array.from(new TextEncoder().encode(bannerUrl || '/images/tournament-banner-default.jpg'));
      
      tx.moveCall({
        target: `${PACKAGE_ID}::simple_tournament::create_tournament`,
        arguments: [
          tx.pure.vector('u8', nameBytes),
          tx.pure.vector('u8', descriptionBytes),
          tx.pure.vector('u8', bannerUrlBytes),
          tx.pure.u64(duration),
          tx.object('0x6'), // Clock
        ],
      });
      
      const result = await executeTransaction(tx);
      
      if (result?.effects?.status?.status === 'success') {
        toast.success('Tournament created successfully!');
        
        // Find tournament ID from events
        const event = result.events?.find(e => e.type.includes('TournamentCreated'));
        if (event && (event.parsedJson as any)?.tournament_id) {
          const tournamentId = (event.parsedJson as any).tournament_id;
          setTimeout(() => {
            window.location.href = `/tournaments/${tournamentId}`;
          }, 2000);
        }
      } else {
        toast.error('Failed to create tournament');
      }
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      toast.error(error.message || 'Failed to create tournament');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Tournament
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create an Azur Guardian exclusive tournament for the community
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Tournament Details
              </h2>

              <div className="space-y-6">
                {/* Tournament Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Epic NFT Battle"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={creating}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your tournament..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={creating}
                  />
                </div>

                {/* Banner URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={creating}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to use default banner
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (hours)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={creating}
                  >
                    <option value={24}>24 hours (Daily)</option>
                    <option value={72}>72 hours (3 Days)</option>
                    <option value={168}>168 hours (Weekly)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleCreateTournament}
                    disabled={!isConnected || creating || !name || !description}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      !isConnected || creating || !name || !description
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {creating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Tournament...
                      </span>
                    ) : !isConnected ? (
                      'Connect Wallet to Create'
                    ) : (
                      'Create Tournament'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="space-y-6">
            {/* Tournament Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tournament Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Coins className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Entry Fee</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">0.01 SUI per NFT</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Trophy className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Prize Pool</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Grows with each entry (0.01 SUI per NFT)</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Prize Distribution</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      5+ participants: 60%/30%/10%<br />
                      &lt;5 participants: Full refund
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-ink-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Azur Guardian Exclusive</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Only Azur Guardian NFTs can enter</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Creating a tournament is free! The prize pool starts at 0 SUI and grows with each participant 
                who enters with their NFT (0.01 SUI entry fee).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}