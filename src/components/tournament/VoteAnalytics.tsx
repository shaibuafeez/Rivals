'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { NFTEntry } from '@/services/tournamentService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface VoteAnalyticsProps {
  nftEntries: NFTEntry[];
  timeRange?: 'day' | 'week' | 'month';
}

export default function VoteAnalytics({ 
  nftEntries, 
  timeRange = 'day' 
}: VoteAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'trend' | 'distribution'>('trend');
  const [trendData, setTrendData] = useState<ChartData<'line'>>({ datasets: [] });
  const [distributionData, setDistributionData] = useState<ChartData<'bar'>>({ datasets: [] });
  
  // Options for the trend chart
  const trendOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Voting Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Votes'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  };
  
  // Options for the distribution chart
  const distributionOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vote Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Votes'
        }
      }
    }
  };
  
  // Generate mock trend data
  useEffect(() => {
    if (!nftEntries || nftEntries.length === 0) return;
    
    // Generate time labels based on the selected time range
    const timeLabels = generateTimeLabels(timeRange);
    
    // Get top 5 NFTs by vote count
    const topNFTs = [...nftEntries]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);
    
    // Generate trend data
    const datasets = topNFTs.map((nft, index) => {
      // Generate a color based on the index
      const colors = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)'
      ];
      
      // Generate mock data points
      const data = timeLabels.map((_, i) => {
        // Create a trend that generally increases but with some randomness
        const baseValue = Math.max(0, nft.votes - (timeLabels.length - i) * 10);
        const randomVariation = Math.floor(Math.random() * 5);
        return baseValue + randomVariation;
      });
      
      return {
        label: `NFT #${nft.nftId.slice(-4)}`,
        data,
        borderColor: colors[index].replace('0.5', '1'),
        backgroundColor: colors[index],
        tension: 0.3
      };
    });
    
    setTrendData({
      labels: timeLabels,
      datasets
    });
    
    // Generate distribution data
    setDistributionData({
      labels: topNFTs.map(nft => `NFT #${nft.nftId.slice(-4)}`),
      datasets: [
        {
          label: 'Votes',
          data: topNFTs.map(nft => nft.votes),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    });
  }, [nftEntries, timeRange]);
  
  // Helper function to generate time labels
  const generateTimeLabels = (range: 'day' | 'week' | 'month'): string[] => {
    const now = new Date();
    const labels: string[] = [];
    
    switch (range) {
      case 'day':
        // Generate hourly labels for the past 24 hours
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(now.getHours() - i);
          labels.push(`${hour.getHours()}:00`);
        }
        break;
      case 'week':
        // Generate daily labels for the past 7 days
        for (let i = 6; i >= 0; i--) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case 'month':
        // Generate weekly labels for the past 4 weeks
        for (let i = 3; i >= 0; i--) {
          const week = new Date(now);
          week.setDate(now.getDate() - (i * 7));
          labels.push(`Week ${4 - i}`);
        }
        break;
    }
    
    return labels;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Vote Analytics</h3>
        <p className="text-sm text-gray-600">Track voting patterns and trends</p>
      </div>
      
      <div className="p-4">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'trend' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('trend')}
          >
            Voting Trend
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'distribution' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('distribution')}
          >
            Vote Distribution
          </button>
        </div>
        
        {/* Time range selector (only for trend view) */}
        {activeTab === 'trend' && (
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setActiveTab('trend')}
                className={`px-4 py-2 text-xs font-medium ${
                  timeRange === 'day'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-200 rounded-l-lg`}
              >
                24h
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trend')}
                className={`px-4 py-2 text-xs font-medium ${
                  timeRange === 'week'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-200`}
              >
                7d
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trend')}
                className={`px-4 py-2 text-xs font-medium ${
                  timeRange === 'month'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-200 rounded-r-lg`}
              >
                30d
              </button>
            </div>
          </div>
        )}
        
        {/* Chart container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-64"
        >
          {activeTab === 'trend' ? (
            trendData.datasets.length > 0 ? (
              <Line options={trendOptions} data={trendData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No trend data available
              </div>
            )
          ) : (
            distributionData.datasets.length > 0 ? (
              <Bar options={distributionOptions} data={distributionData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No distribution data available
              </div>
            )
          )}
        </motion.div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 mb-1">Total Votes</div>
            <div className="font-semibold">
              {nftEntries.reduce((sum, entry) => sum + entry.votes, 0)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 mb-1">Unique NFTs</div>
            <div className="font-semibold">{nftEntries.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 mb-1">Avg. Votes per NFT</div>
            <div className="font-semibold">
              {nftEntries.length > 0
                ? Math.round(nftEntries.reduce((sum, entry) => sum + entry.votes, 0) / nftEntries.length)
                : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
