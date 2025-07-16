'use client';

import { InfoIcon, ExternalLink } from 'lucide-react';

export default function AzurGuardianInfo() {
  return (
    <div className="bg-gradient-to-r from-ink-50 to-blue-50 dark:from-ink-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-ink-200 dark:border-ink-800">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-ink-100 dark:bg-ink-900/50 rounded-full flex items-center justify-center">
            <InfoIcon className="w-5 h-5 text-ink-600 dark:text-ink-400" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            About Azur Guardian NFTs
          </h3>
          
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              Azur Guardian NFTs are exclusive digital collectibles required to participate in Azur Guardian tournaments.
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Important Distinction:</h4>
              <ul className="space-y-1 ml-4 list-disc">
                <li>
                  <span className="font-medium">AZUR Tokens</span> - Cryptocurrency tokens (you have 2,500 AZUR)
                </li>
                <li>
                  <span className="font-medium">Azur Guardian NFTs</span> - Digital collectibles required for tournaments
                </li>
              </ul>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                These are two different assets. Owning AZUR tokens does not grant access to Azur Guardian tournaments.
              </p>
            </div>
            
            <div className="pt-2">
              <p className="font-medium mb-2">Where to get Azur Guardian NFTs:</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.tradeport.xyz/sui/collection/${process.env.NEXT_PUBLIC_AZUR_GUARDIAN_NFT_TYPE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Tradeport Marketplace
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://app.clutchy.io/collection/mainnet/0xfc9d0c6972cae3f303030b993485af37e2d86ebf3b409d1e6a40cde955a43a77"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink-600 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
                >
                  Clutchy Marketplace
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}