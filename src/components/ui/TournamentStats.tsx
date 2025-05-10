'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TournamentStatsProps {
  totalTournaments: number;
  activeTournaments: number;
  totalPrizePool: string;
  totalParticipants: number;
}

export default function TournamentStats({
  totalTournaments,
  activeTournaments,
  totalPrizePool,
  totalParticipants
}: TournamentStatsProps) {
  const [animatedParticipants, setAnimatedParticipants] = useState(0);
  const [animatedPrizePool, setAnimatedPrizePool] = useState(0);
  
  useEffect(() => {
    const participantsDuration = 2000; // 2 seconds
    const prizePoolDuration = 2500; // 2.5 seconds
    const participantsInterval = 20; // Update every 20ms
    const prizePoolInterval = 20; // Update every 20ms
    
    const participantsStep = totalParticipants / (participantsDuration / participantsInterval);
    const prizePoolStep = parseFloat(totalPrizePool) / (prizePoolDuration / prizePoolInterval);
    
    let currentParticipants = 0;
    let currentPrizePool = 0;
    
    const participantsTimer = setInterval(() => {
      currentParticipants += participantsStep;
      if (currentParticipants >= totalParticipants) {
        clearInterval(participantsTimer);
        setAnimatedParticipants(totalParticipants);
      } else {
        setAnimatedParticipants(Math.floor(currentParticipants));
      }
    }, participantsInterval);
    
    const prizePoolTimer = setInterval(() => {
      currentPrizePool += prizePoolStep;
      if (currentPrizePool >= parseFloat(totalPrizePool)) {
        clearInterval(prizePoolTimer);
        setAnimatedPrizePool(parseFloat(totalPrizePool));
      } else {
        setAnimatedPrizePool(currentPrizePool);
      }
    }, prizePoolInterval);
    
    return () => {
      clearInterval(participantsTimer);
      clearInterval(prizePoolTimer);
    };
  }, [totalParticipants, totalPrizePool]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h4 className="text-sm text-gray-500 mb-1">Total Tournaments</h4>
        <p className="text-3xl font-bold">{totalTournaments}</p>
        <div className="mt-2 text-xs text-gray-400">All time</div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h4 className="text-sm text-gray-500 mb-1">Active Tournaments</h4>
        <p className="text-3xl font-bold">{activeTournaments}</p>
        <div className="mt-2 text-xs text-gray-400">Join now</div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h4 className="text-sm text-gray-500 mb-1">Total Prize Pool</h4>
        <p className="text-3xl font-bold">{animatedPrizePool.toFixed(0)} <span className="text-sm font-medium">SUI</span></p>
        <div className="mt-2 text-xs text-gray-400">Up for grabs</div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h4 className="text-sm text-gray-500 mb-1">Total Participants</h4>
        <p className="text-3xl font-bold">{animatedParticipants.toLocaleString()}</p>
        <div className="mt-2 text-xs text-gray-400">And growing</div>
      </div>
    </motion.div>
  );
}
