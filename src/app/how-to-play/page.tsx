'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Dynamic imports to avoid SSR issues
const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false
});

const ConnectWalletButton = dynamic(() => import('@/components/ui/ConnectWalletButton'), {
  ssr: false
});

// How to play steps
const steps = [
  {
    id: 1,
    title: 'Connect Your Wallet',
    description: 'Connect your Sui wallet to access all features of NFT Battles. We support Sui Wallet, Ethos Wallet, and other popular Sui-compatible wallets.',
    icon: '🔗',
    details: 'Connecting your wallet is secure and only requires read access to your NFTs. We never request transaction permissions until you explicitly enter a tournament.'
  },
  {
    id: 2,
    title: 'Enter Tournaments',
    description: 'Choose a tournament type (daily, weekly, or monthly) and enter your NFTs to compete for SUI rewards and recognition.',
    icon: '🏆',
    details: 'Each tournament has different entry fees and prize pools. Daily tournaments are perfect for beginners, while monthly tournaments offer the biggest rewards.'
  },
  {
    id: 3,
    title: 'Vote on Other NFTs',
    description: 'Swipe left or right to vote on other NFTs in the tournament. Your votes help determine the winners while earning you voting rewards!',
    icon: '👍',
    details: 'The more you vote, the more influence you have on the outcome. Plus, active voters receive special perks and bonus rewards at the end of each tournament.'
  },
  {
    id: 4,
    title: 'Win Rewards',
    description: 'If your NFT ranks high enough, you&apos;ll earn SUI rewards and exclusive benefits in the ecosystem.',
    icon: '💰',
    details: 'Rewards are distributed automatically at the end of each tournament. Top performers also gain access to exclusive future tournaments with higher stakes.'
  }
];

// Tournament types with details
const tournamentTypes = [
  {
    name: 'Daily',
    duration: '24 hours',
    entryFee: '0.01 SUI',
    prizePool: '70% of entry fees',
    bestFor: 'Quick competitions and beginners'
  },
  {
    name: 'Weekly',
    duration: '7 days',
    entryFee: '0.05 SUI',
    prizePool: '75% of entry fees',
    bestFor: 'Balanced competition with good exposure'
  },
  {
    name: 'Monthly',
    duration: '30 days',
    entryFee: '0.2 SUI',
    prizePool: '80% of entry fees',
    bestFor: 'Serious collectors and high-value NFTs'
  }
];

// FAQ items
const faqItems = [
  {
    question: 'What NFTs can I enter in tournaments?',
    answer: 'Currently, we support all NFTs on the Sui blockchain. Make sure your NFT is in your connected wallet to enter it in tournaments.'
  },
  {
    question: 'How are winners determined?',
    answer: 'Winners are determined by the number of votes their NFTs receive during the tournament period. The more votes, the higher your NFT ranks!'
  },
  {
    question: 'How much does it cost to enter a tournament?',
    answer: 'Entry fees vary by tournament type: Daily (0.01 SUI), Weekly (0.05 SUI), and Monthly (0.2 SUI). Custom tournaments may have different fees.'
  },
  {
    question: 'When do I receive my rewards?',
    answer: 'Rewards are automatically distributed to winners&apos; wallets immediately after a tournament ends.'
  },
  {
    question: 'Can I enter multiple NFTs in the same tournament?',
    answer: 'Yes! You can enter as many NFTs as you want, but each NFT requires a separate entry fee.'
  },
  {
    question: 'How is the prize pool distributed?',
    answer: 'The prize pool is distributed based on final rankings: 1st place (40%), 2nd place (25%), 3rd place (15%), 4th-10th place (20% shared equally).'
  },
  {
    question: 'Do I need to be present during the entire tournament?',
    answer: 'No, once you enter your NFT, the process is automated. You can check back anytime to see your current ranking.'
  },
  {
    question: 'What happens if there&apos;s a tie in votes?',
    answer: 'In case of a tie, the NFT that reached that vote count first will be ranked higher.'
  }
];

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-28 pb-8">
        <div className="max-w-[1000px] mx-auto px-4">
          {/* Hero Section with Background */}
          <div className="relative overflow-hidden rounded-2xl mb-16 bg-gradient-to-r from-gray-900 to-black p-8 md:p-12">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/nft-skull.png')] bg-center bg-no-repeat bg-contain opacity-5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-6 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white/80 text-sm border border-white/20"
              >
                Start your NFT battle journey
              </motion.div>
              
              <h1 className="text-[40px] md:text-[48px] font-bold text-white mb-4 tracking-tight">
                How to Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white">NFT Battles</span>
              </h1>
              
              <p className="text-[16px] text-gray-300 max-w-[600px] mx-auto mb-8">
                Get started with NFT Battles in just a few simple steps. Enter tournaments, vote on NFTs, and win rewards!
              </p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <span className="text-white text-xl">🏆</span>
                  <span className="text-white text-sm">Daily Tournaments</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <span className="text-white text-xl">💰</span>
                  <span className="text-white text-sm">Win SUI Rewards</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <span className="text-white text-xl">👍</span>
                  <span className="text-white text-sm">Vote on NFTs</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Steps Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-3">Simple Steps to Get Started</h2>
              <p className="text-gray-600 max-w-[600px] mx-auto text-sm">
                Follow these four easy steps to join the battle and start earning rewards
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden"
                >
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                  
                  {/* Step number */}
                  <div className="absolute top-4 right-4 font-bold text-4xl text-gray-100 z-0">{step.id}</div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-5">
                      <div className="flex-shrink-0 w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center text-2xl mr-4 shadow-md transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-[15px] mb-4 pl-1">
                      {step.description}
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 border-l-4 border-black">
                      <p>{step.details}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Voting Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16 relative"
          >
            {/* Background design elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-white"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100 rounded-full -ml-32 -mb-32"></div>
              <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="absolute top-1/4 right-1/3 w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
            
            <div className="relative z-10 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-3 inline-block relative">
                  How Voting Works
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-black rounded-full transform scale-x-50"></div>
                </h2>
                <p className="text-center text-gray-600 mb-2 max-w-[600px] mx-auto text-sm">
                  Our voting system is simple and fun. Swipe through NFTs and vote for your favorites.
                </p>
                <p className="text-center text-gray-500 max-w-[500px] mx-auto text-xs">
                  Each vote counts towards determining the winners and earns you voting rewards!
                </p>
              </motion.div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-12">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-[180px] h-[180px] bg-white rounded-2xl p-3 shadow-lg transform -rotate-6 mb-4 mx-auto hover:rotate-0 transition-all duration-300 border-2 border-gray-100">
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-5xl filter drop-shadow-md">👈</span>
                    </div>
                  </div>
                  <div className="bg-red-500 text-white font-medium px-4 py-1.5 rounded-lg inline-block shadow-md">
                    Swipe Left
                  </div>
                  <p className="text-sm text-gray-500 mt-1">to skip</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center order-first md:order-none relative"
                >
                  <div className="relative">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl blur-sm"></div>
                    <div className="w-[260px] h-[260px] bg-white rounded-2xl p-3 shadow-xl mb-4 mx-auto relative">
                      <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
                        <Image
                          src="/images/nft-skull.png"
                          alt="NFT Example"
                          width={260}
                          height={260}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent h-16"></div>
                        <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                          Skull #1337
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex justify-center items-center gap-2">
                      <div className="bg-black text-white text-xs px-4 py-1.5 rounded-full inline-block shadow-md font-medium">
                        <span className="mr-1">❤️</span> 254 Votes
                      </div>
                      <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full inline-block">
                        <span className="mr-1">⏱️</span> 2d left
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-[180px] h-[180px] bg-white rounded-2xl p-3 shadow-lg transform rotate-6 mb-4 mx-auto hover:rotate-0 transition-all duration-300 border-2 border-gray-100">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-5xl filter drop-shadow-md">👉</span>
                    </div>
                  </div>
                  <div className="bg-green-500 text-white font-medium px-4 py-1.5 rounded-lg inline-block shadow-md">
                    Swipe Right
                  </div>
                  <p className="text-sm text-gray-500 mt-1">to vote</p>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-[700px] mx-auto"
              >
                <h4 className="font-bold text-center mb-4 text-lg">Voting Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-2 shadow-sm">
                        🎁
                      </div>
                      <h5 className="font-medium">Earn Rewards</h5>
                    </div>
                    <p className="text-xs text-gray-600">Earn voting points that can be redeemed for exclusive rewards</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-2 shadow-sm">
                        🔍
                      </div>
                      <h5 className="font-medium">Discover NFTs</h5>
                    </div>
                    <p className="text-xs text-gray-600">Find new and trending NFTs in the Sui ecosystem</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-2 shadow-sm">
                        🌟
                      </div>
                      <h5 className="font-medium">Shape Culture</h5>
                    </div>
                    <p className="text-xs text-gray-600">Help shape the future of NFT culture on Sui</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Tournament Types Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-16"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-3 inline-block relative">
                Tournament Types
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-black rounded-full transform scale-x-50"></div>
              </h2>
              <p className="text-center text-gray-600 mb-2 max-w-[600px] mx-auto text-sm">
                Choose the tournament that fits your style and NFT collection.
              </p>
              <p className="text-center text-gray-500 max-w-[500px] mx-auto text-xs">
                Each offers different rewards and competition levels.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tournamentTypes.map((tournament, index) => {
                // Define gradient colors based on tournament type
                let gradientClass = "from-blue-500 to-blue-600";
                let iconEmoji = "🏆";
                
                if (tournament.name === "Weekly") {
                  gradientClass = "from-purple-500 to-purple-600";
                  iconEmoji = "🌟";
                } else if (tournament.name === "Monthly") {
                  gradientClass = "from-amber-500 to-amber-600";
                  iconEmoji = "👑";
                }
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.15 }}
                    className="group bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className={`bg-gradient-to-r ${gradientClass} p-5 relative h-24`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                      
                      <div className="relative z-10 flex items-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl mr-4 shadow-md">
                          {iconEmoji}
                        </div>
                        <div>
                          <h3 className="text-white text-xl font-bold">
                            {tournament.name}
                          </h3>
                          <p className="text-white/70 text-xs">
                            Tournament
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="font-medium text-sm">{tournament.duration}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Entry Fee</p>
                          <p className="font-medium text-sm">{tournament.entryFee}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Prize Pool</p>
                        <p className="font-medium text-sm">{tournament.prizePool}</p>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-500 mb-1">Best for</p>
                        <p className="font-medium text-sm">{tournament.bestFor}</p>
                      </div>
                      
                      <div className="pt-2 text-center">
                        <button className="bg-black text-white text-sm font-medium py-2 px-4 rounded-lg w-full hover:bg-gray-800 transition-colors duration-300">
                          View Tournaments
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-16 relative"
          >
            {/* Background design elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-white"></div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-gray-100 rounded-full -mr-24 -mt-24"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100 rounded-full -ml-32 -mb-32"></div>
            </div>
            
            <div className="relative z-10 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold mb-3 inline-block relative">
                  Frequently Asked Questions
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-black rounded-full transform scale-x-50"></div>
                </h2>
                <p className="text-center text-gray-600 mb-2 max-w-[600px] mx-auto text-sm">
                  Got questions? We&apos;ve got answers.
                </p>
                <p className="text-center text-gray-500 max-w-[500px] mx-auto text-xs">
                  If you don&apos;t see your question here, reach out to our community on Discord.
                </p>
              </motion.div>
              
              <div className="max-w-[800px] mx-auto">
                <div className="grid grid-cols-1 gap-4">
                  {faqItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                      <details className="group">
                        <summary className="flex items-center justify-between p-5 cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs mr-3 font-bold">
                              Q{index + 1}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{item.question}</h3>
                          </div>
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-open:rotate-180 transition-transform group-open:bg-black group-open:text-white">
                            ▼
                          </span>
                        </summary>
                        <div className="p-5 pt-2 text-gray-600 border-t border-gray-100">
                          <div className="flex">
                            <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs mr-3 font-bold flex-shrink-0">
                              A
                            </div>
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        </div>
                      </details>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tournament Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mb-16 bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-8 md:p-12 overflow-hidden relative"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
              <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="absolute top-1/4 right-1/3 w-12 h-12 bg-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-3 text-white">
                  Tournament Flow
                </h2>
                <p className="text-center text-gray-300 mb-2 max-w-[600px] mx-auto text-sm">
                  Here&apos;s what happens from the moment you enter a tournament to receiving rewards.
                </p>
              </motion.div>
              
              <div className="relative">
                {/* Flow diagram line */}
                <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 -translate-y-1/2 z-0 rounded-full"></div>
                
                <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6">
                  {/* Step 1 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col items-center text-center mb-8 md:mb-0 w-full md:w-1/4 group"
                  >
                    <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                      <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-md opacity-50 -z-10"></div>
                      <span className="font-bold">1</span>
                    </div>
                    <h4 className="font-bold mb-2 text-white text-lg">Enter Tournament</h4>
                    <p className="text-sm text-gray-300 max-w-[180px]">Pay entry fee and submit your NFT to join the competition</p>
                  </motion.div>
                  
                  {/* Step 2 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col items-center text-center mb-8 md:mb-0 w-full md:w-1/4 group"
                  >
                    <div className="w-16 h-16 bg-purple-500 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                      <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-md opacity-50 -z-10"></div>
                      <span className="font-bold">2</span>
                    </div>
                    <h4 className="font-bold mb-2 text-white text-lg">Voting Period</h4>
                    <p className="text-sm text-gray-300 max-w-[180px]">Community votes on all entered NFTs during the tournament period</p>
                  </motion.div>
                  
                  {/* Step 3 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col items-center text-center mb-8 md:mb-0 w-full md:w-1/4 group"
                  >
                    <div className="w-16 h-16 bg-pink-500 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                      <div className="absolute inset-0 bg-pink-400 rounded-2xl blur-md opacity-50 -z-10"></div>
                      <span className="font-bold">3</span>
                    </div>
                    <h4 className="font-bold mb-2 text-white text-lg">Rankings Finalized</h4>
                    <p className="text-sm text-gray-300 max-w-[180px]">Final standings determined by vote count at the end of the tournament</p>
                  </motion.div>
                  
                  {/* Step 4 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col items-center text-center w-full md:w-1/4 group"
                  >
                    <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                      <div className="absolute inset-0 bg-amber-400 rounded-2xl blur-md opacity-50 -z-10"></div>
                      <span className="font-bold">4</span>
                    </div>
                    <h4 className="font-bold mb-2 text-white text-lg">Rewards Distributed</h4>
                    <p className="text-sm text-gray-300 max-w-[180px]">Winners receive SUI rewards automatically to their connected wallet</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="text-center bg-gradient-to-r from-gray-900 to-black p-10 rounded-2xl text-white relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
              <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="absolute top-1/4 right-1/3 w-12 h-12 bg-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-4 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white/80 text-sm border border-white/20"
              >
                Start your journey today
              </motion.div>
              
              <h3 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-300">
                Ready to Battle?
              </h3>
              
              <p className="text-gray-300 mb-6 max-w-[500px] mx-auto text-[15px]">
                Connect your wallet now and start competing in NFT tournaments!
              </p>
              
              <div className="inline-block bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 shadow-lg hover:shadow-white/5 transition-all duration-300">
                <ConnectWalletButton />
              </div>
              
              <div className="mt-6 flex justify-center gap-4">
                <a href="/tournaments" className="text-sm text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1">
                  <span>View Tournaments</span>
                  <span>→</span>
                </a>
                <a href="/leaderboard" className="text-sm text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1">
                  <span>Leaderboard</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 flex justify-center space-x-8 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms of service</a>
          </div>
        </div>
      </main>
    </div>
  );
}
