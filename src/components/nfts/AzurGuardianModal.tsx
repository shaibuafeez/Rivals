'use client';

import { useState } from 'react';
import { AzurGuardianNFT } from '@/services/azurGuardianService';
import AzurGuardianSelector from './AzurGuardianSelector';

interface AzurGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNFT: (nft: AzurGuardianNFT) => void;
  selectedNftId?: string;
  onConfirm?: () => void;
}

export default function AzurGuardianModal({
  isOpen,
  onClose,
  onSelectNFT,
  selectedNftId,
  onConfirm
}: AzurGuardianModalProps) {
  const [selectedNft, setSelectedNft] = useState<AzurGuardianNFT | null>(null);

  if (!isOpen) return null;

  const handleSelect = (nft: AzurGuardianNFT) => {
    setSelectedNft(nft);
  };

  const handleConfirm = () => {
    if (selectedNft) {
      onSelectNFT(selectedNft);
      
      // If an external onConfirm is provided, call it
      if (onConfirm) {
        onConfirm();
      } else {
        // Otherwise just close the modal
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Select Azur Guardian NFT for Tournament
              </h3>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Only Azur Guardian NFT holders can enter this tournament. Select one of your NFTs to continue.
                </p>
                
                <AzurGuardianSelector 
                  onSelect={handleSelect} 
                  selectedNftId={selectedNft?.id || selectedNftId}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white rounded-md sm:ml-3 sm:w-auto sm:text-sm ${
                selectedNft 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-blue-400 cursor-not-allowed'
              }`}
              onClick={handleConfirm}
              disabled={!selectedNft}
            >
              Confirm Selection
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
