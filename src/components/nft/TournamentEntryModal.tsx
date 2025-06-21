import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import UserNFTSelector, { UserNFT } from './UserNFTSelector';

interface TournamentEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nft: UserNFT) => void;
  tournamentName: string;
  tournamentId: string;
  entryFee?: number;
}

const TournamentEntryModal: React.FC<TournamentEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tournamentName,
  tournamentId,
  entryFee = 0
}) => {
  const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedNFT) return;
    
    try {
      setIsSubmitting(true);
      console.log(`Submitting NFT ${selectedNFT.objectId} to tournament ${tournamentId}`);
      // Submit the selected NFT to the tournament
      await onSubmit(selectedNFT);
      onClose();
    } catch (error) {
      console.error('Error entering tournament:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Enter Tournament: {tournamentName}
              </Dialog.Title>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select an Azur Guardian NFT from your wallet to enter this tournament.
                  {entryFee > 0 && ` Entry fee: ${entryFee} SUI`}
                </p>
              </div>

              <div className="mt-6">
                <UserNFTSelector
                  onSelectNFT={setSelectedNFT}
                  selectedNFT={selectedNFT}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                    !selectedNFT || isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={handleSubmit}
                  disabled={!selectedNFT || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Enter Tournament'
                  )}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TournamentEntryModal;
