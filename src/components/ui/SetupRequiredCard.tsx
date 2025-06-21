'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

interface SetupRequiredCardProps {
  type: 'setup-needed' | 'no-tournaments' | 'registry-error' | 'error';
  title: string;
  description: string;
}

export default function SetupRequiredCard({ type, title, description }: SetupRequiredCardProps) {
  const { isConnected } = useWallet();
  
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden my-8">
      <div className="md:flex">
        <div className="md:shrink-0 flex items-center justify-center p-6 bg-gradient-to-r from-indigo-500 to-ink-600">
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-white/20">
            {type === 'setup-needed' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {type === 'no-tournaments' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {(type === 'registry-error' || type === 'error') && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{type === 'setup-needed' ? 'Setup Required' : type === 'no-tournaments' ? 'No Tournaments' : 'Error'}</div>
          <h2 className="mt-1 text-xl font-medium text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
          <div className="mt-6">
            {type === 'setup-needed' && (
              <Link href="/setup" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Setup Page
              </Link>
            )}
            {type === 'no-tournaments' && isConnected && (
              <button
                onClick={() => document.getElementById('create-tournament-modal')?.classList.remove('hidden')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Tournament
              </button>
            )}
            {type === 'no-tournaments' && !isConnected && (
              <p className="text-sm text-gray-500">Connect your wallet to create a tournament</p>
            )}
            {(type === 'registry-error' || type === 'error') && (
              <Link href="/setup" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Setup Page
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
