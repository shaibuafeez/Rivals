'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Clock, Trophy, Users } from 'lucide-react';
import { TOURNAMENT_DURATIONS, TournamentDurationKey } from '@/constants/durations';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_IDS } from '@/config/env';
import { useWallet } from '@/hooks/useWallet';

interface TournamentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tournamentId: string) => void;
}

export default function TournamentCreationModal({
  isOpen,
  onClose,
  onSuccess
}: TournamentCreationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bannerUrl: '',
    duration: 'FIVE_MINUTES' as TournamentDurationKey
  });
  const [isCreating, setIsCreating] = useState(false);

  const { executeTransaction } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Tournament name is required');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const duration = TOURNAMENT_DURATIONS[formData.duration];
      const tx = new Transaction();
      
      // Use appropriate function based on duration
      const functionName = duration.minutes < 60 ? 'create_tournament_minutes' : 'create_tournament';
      const durationValue = duration.minutes < 60 ? duration.minutes : Math.floor(duration.minutes / 60);
      
      tx.moveCall({
        target: `${PACKAGE_IDS.SIMPLE_TOURNAMENT_PACKAGE_ID}::simple_tournament::${functionName}`,
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.string(formData.description || `A ${duration.label.toLowerCase()} tournament`),
          tx.pure.string(formData.bannerUrl || 'https://example.com/banner.jpg'),
          tx.pure.u64(durationValue),
          tx.object('0x6'), // Clock object
        ],
      });
      
      const result = await executeTransaction(tx);
      
      if (result?.effects?.status?.status === 'success') {
        console.log('Tournament created:', result);
        
        // Find the created tournament ID
        const created = result.objectChanges?.find(change => 
          change.type === 'created' && 
          change.objectType?.includes('Tournament')
        );
        
        if (created && 'objectId' in created) {
          toast.success(`Tournament "${formData.name}" created successfully!`);
          onSuccess?.(created.objectId);
          onClose();
          
          // Reset form
          setFormData({
            name: '',
            description: '',
            bannerUrl: '',
            duration: 'FIVE_MINUTES'
          });
        }
      } else {
        toast.error('Failed to create tournament');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            Create Rivals Tournament
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tournament Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter tournament name"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe your tournament"
              rows={3}
            />
          </div>
          
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TOURNAMENT_DURATIONS).map(([key, duration]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, duration: key as TournamentDurationKey }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.duration === key
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{duration.label}</div>
                  <div className="text-xs opacity-75">{duration.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tournament Info */}
          <div className="bg-gray-900 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Entry Fee:</span>
              <span className="text-white">0.01 SUI</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Prize Distribution:</span>
              <span className="text-white">60% / 30% / 10%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Min Participants:</span>
              <span className="text-white">5 for prizes</span>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className={`w-full py-3 px-4 rounded-lg font-bold uppercase tracking-wider transition-all ${
              isCreating
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white button-press'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Trophy className="w-5 h-5 mr-2" />
                Create Tournament
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}