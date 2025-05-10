'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { TournamentService } from '@/services/tournamentService';
import { useSuiClient } from '@mysten/dapp-kit';
import { castToSuiClient } from '@/types/sui-client';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTournamentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTournamentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tournamentType, setTournamentType] = useState(1); // Default to daily
  const [durationHours, setDurationHours] = useState(24);
  const [entryFee, setEntryFee] = useState(0.01);
  const [initialPrize, setInitialPrize] = useState(0.1);
  const [registrationHours, setRegistrationHours] = useState(6); // Default 6 hour registration period
  const [minParticipants, setMinParticipants] = useState(0); // Default no minimum
  const [isTokenGated, setIsTokenGated] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [allowedCollections, setAllowedCollections] = useState<string[]>([]);
  const [collectionInput, setCollectionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const suiClient = useSuiClient();
  const { executeTransaction, isAdmin, isConnected } = useWallet();
  const tournamentService = new TournamentService(castToSuiClient(suiClient));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      alert('Only website administrators can create tournaments');
      return;
    }
    
    if (!name || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare advanced options if they're enabled
      const advancedOptions = showAdvancedOptions ? {
        registrationHours,
        minParticipants,
        allowedCollections: allowedCollections.length > 0 ? allowedCollections : undefined,
        isTokenGated
      } : undefined;
      
      const txb = tournamentService.createTournamentTransaction(
        name,
        description,
        tournamentType,
        durationHours,
        Math.floor(entryFee * 1e9), // Convert to MIST
        Math.floor(initialPrize * 1e9), // Convert to MIST
        advancedOptions
      );
      
      await executeTransaction(txb);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create Tournament</h2>
            
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-yellow-700 text-sm">Please connect your wallet to create tournaments.</p>
              </div>
            )}
            
            {isConnected && !isAdmin && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-700 text-sm">
                  <strong>Admin Access Required</strong><br />
                  Only website administrators can create tournaments.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tournament Name*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tournament Type
                </label>
                <select
                  value={tournamentType}
                  onChange={e => setTournamentType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>Daily</option>
                  <option value={2}>Weekly</option>
                  <option value={3}>Monthly</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Fee (SUI)
                </label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={e => setEntryFee(Number(e.target.value))}
                  min={0.001}
                  step={0.001}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Prize (SUI)
                </label>
                <input
                  type="number"
                  value={initialPrize}
                  onChange={e => setInitialPrize(Number(e.target.value))}
                  min={0.01}
                  step={0.01}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                >
                  {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {showAdvancedOptions && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Tournament Options</h3>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Period (hours)
                    </label>
                    <input
                      type="number"
                      value={registrationHours}
                      onChange={e => setRegistrationHours(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Time for users to register before the tournament starts</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Participants
                    </label>
                    <input
                      type="number"
                      value={minParticipants}
                      onChange={e => setMinParticipants(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum participants needed to start the tournament</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        checked={isTokenGated}
                        onChange={e => setIsTokenGated(e.target.checked)}
                        className="mr-2"
                      />
                      Token Gated Tournament
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Restrict tournament to specific NFT holders</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Collections
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={collectionInput}
                        onChange={e => setCollectionInput(e.target.value)}
                        placeholder="Collection ID"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (collectionInput && !allowedCollections.includes(collectionInput)) {
                            setAllowedCollections([...allowedCollections, collectionInput]);
                            setCollectionInput('');
                          }
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    
                    {allowedCollections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {allowedCollections.map((collection, index) => (
                          <div key={index} className="flex items-center bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                            {collection.substring(0, 10)}...
                            <button
                              type="button"
                              onClick={() => setAllowedCollections(allowedCollections.filter((_, i) => i !== index))}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Specify which NFT collections can participate</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-sm text-white rounded-lg ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {submitting ? 'Creating...' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
