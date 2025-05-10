'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function TournamentHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Featured tournaments
  const featuredTournaments = [
    {
      id: '0x123',
      name: 'Machines vs Enforcers',
      description: 'The ultimate battle between two legendary collections',
      prizePool: '500',
      participants: 128,
      image: '/images/tournament-bg-1.jpg',
      collections: ['Machines', 'Enforcers']
    },
    {
      id: '0x456',
      name: 'Weekly Puggy Championship',
      description: 'Show off your rarest Puggies and win big rewards',
      prizePool: '250',
      participants: 64,
      image: '/images/tournament-bg-2.jpg',
      collections: ['Puggies']
    },
    {
      id: '0x789',
      name: 'Azur Masters Tournament',
      description: 'The most prestigious Azur NFT competition',
      prizePool: '1000',
      participants: 256,
      image: '/images/tournament-bg-3.jpg',
      collections: ['Azur']
    }
  ];
  
  // Featured collections
  const featuredCollections = [
    { name: 'Machines', image: '/images/nft-machines.png' },
    { name: 'Enforcers', image: '/images/nft-enforcers.png' },
    { name: 'Puggies', image: '/images/nft-puggies.png' },
    { name: 'Fuddies', image: '/images/nft-fuddies.png' },
    { name: 'Azur', image: '/images/nft-azur.png' },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-black py-16 mb-12 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[size:20px_20px] absolute inset-0"></div>
      </div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%', 
              opacity: Math.random() * 0.5 + 0.3 
            }}
            animate={{ 
              y: [null, Math.random() * 100 + '%'],
              opacity: [null, Math.random() * 0.3 + 0.1]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        ))}
      </div>
      
      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        {/* Featured Tournament Carousel */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Carousel slides */}
            <div className="relative h-[400px] md:h-[500px]">
              {featuredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: activeSlide === index ? 1 : 0,
                    scale: activeSlide === index ? 1 : 1.1
                  }}
                  transition={{ duration: 0.7 }}
                >
                  {/* Background image with overlay */}
                  <div className="absolute inset-0 bg-black/50 z-10"></div>
                  <Image
                    src={tournament.image}
                    alt={tournament.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Tournament content */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="text-center max-w-3xl px-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: activeSlide === index ? 1 : 0, y: activeSlide === index ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-block bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1 rounded-full mb-4"
                      >
                        Featured Tournament
                      </motion.div>
                      
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: activeSlide === index ? 1 : 0, y: activeSlide === index ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                      >
                        {tournament.name}
                      </motion.h2>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: activeSlide === index ? 1 : 0, y: activeSlide === index ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-xl text-white/80 mb-8"
                      >
                        {tournament.description}
                      </motion.p>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: activeSlide === index ? 1 : 0, y: activeSlide === index ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex justify-center space-x-6 mb-8"
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{tournament.prizePool}</div>
                          <div className="text-sm text-white/70">SUI Prize Pool</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{tournament.participants}</div>
                          <div className="text-sm text-white/70">Participants</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{tournament.collections.length}</div>
                          <div className="text-sm text-white/70">Collections</div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: activeSlide === index ? 1 : 0, y: activeSlide === index ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <Link 
                          href={`/tournaments/${tournament.id}`}
                          className="inline-block bg-white text-black font-medium px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          View Tournament
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Carousel navigation */}
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2">
              {featuredTournaments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${activeSlide === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Carousel arrows */}
            <button 
              onClick={() => setActiveSlide(prev => (prev === 0 ? featuredTournaments.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveSlide(prev => (prev === featuredTournaments.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tournament Info Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Hero text */}
          <div className="text-center md:text-left md:max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full mb-4"
            >
              Winner Takes All
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              NFT Tournaments
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-300 mb-8"
            >
              Compete with your NFTs in winner-takes-all tournaments. 
              Enter with your best NFTs and win big prizes on the Sui blockchain!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Daily Tournaments
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Weekly Battles
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Monthly Events
              </div>
            </motion.div>
          </div>
          
          {/* Featured collections */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative h-64 w-full md:w-96 mt-8 md:mt-0"
          >
            <div className="relative h-full w-full">
              {featuredCollections.map((collection, index) => (
                <motion.div
                  key={collection.name}
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, -2, 2, 0],
                    y: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 5 + index, 
                    delay: index * 0.5,
                    ease: "easeInOut" 
                  }}
                  className="absolute rounded-lg overflow-hidden shadow-xl"
                  style={{
                    width: '140px',
                    height: '140px',
                    top: `${20 + (index % 3) * 30}px`,
                    left: `${20 + (index % 3) * 40}px`,
                    zIndex: 5 - index,
                    transform: `rotate(${(index % 2 === 0 ? 5 : -5) + index * 2}deg)`
                  }}
                >
                  <Image 
                    src={collection.image} 
                    alt={collection.name} 
                    width={140} 
                    height={140}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="text-white text-xs font-medium">{collection.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
