'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import '@/styles/components.css';
import { FC, useState } from 'react';

const NFTCarousel: FC = () => {
  const nftImages = [
    '/images/nft-skull.png',
    '/images/nft-skull.png',
    '/images/nft-skull.png',
    '/images/nft-skull.png',
    '/images/nft-skull.png'
  ];

  const [currentIndex, setCurrentIndex] = useState(2);
  const [dragStart, setDragStart] = useState(0);
  const dragThreshold = 50;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % nftImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + nftImages.length) % nftImages.length);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStart - clientX;

    if (Math.abs(delta) > dragThreshold) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const getDisplayImages = () => {
    const images = [...nftImages];
    while (images.length < 5) {
      images.push(...nftImages);
    }
    
    const centerIndex = currentIndex;
    const leftImages = [
      images[(centerIndex - 2 + images.length) % images.length],
      images[(centerIndex - 1 + images.length) % images.length]
    ];
    const rightImages = [
      images[(centerIndex + 1) % images.length],
      images[(centerIndex + 2) % images.length]
    ];

    return {
      leftImages,
      centerImage: images[centerIndex],
      rightImages
    };
  };

  const { leftImages, centerImage, rightImages } = getDisplayImages();

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex justify-center items-center min-h-[340px] cursor-pointer"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Side Cards - Left */}
        {leftImages.map((image, index) => (
          <motion.div
            key={`left-${index}`}
            initial={{ opacity: 0, x: -100 * (index + 1), rotate: -5 * (index + 1) }}
            animate={{ 
              opacity: 0.2,
              x: -140 * (index + 1),
              y: 0
            }}
            className="absolute"
          >
            <div className="w-[240px] bg-white rounded-lg p-3 shadow-md transform -rotate-6">
              <div className="w-full aspect-square bg-black">
                <Image
                  src={image}
                  alt={`NFT ${index + 1}`}
                  width={240}
                  height={240}
                  className="object-cover w-full h-full grayscale"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Center NFT Card */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-30"
        >
          <div className="w-[260px] bg-white rounded-lg p-3 shadow-xl">
            <div className="relative aspect-square bg-black">
              <Image
                src={centerImage}
                alt="NFT Winner"
                width={260}
                height={260}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">Winner</span>
                  <span className="text-xs text-gray-500">@van.sui</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">25</span>
                  <span className="text-xs text-gray-500">Doonies #337</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Side Cards - Right */}
        {rightImages.map((image, index) => (
          <motion.div
            key={`right-${index}`}
            initial={{ opacity: 0, x: 100 * (index + 1), rotate: 5 * (index + 1) }}
            animate={{ 
              opacity: 0.2,
              x: 140 * (index + 1),
              y: 0
            }}
            className="absolute"
          >
            <div className="w-[240px] bg-white rounded-lg p-3 shadow-md transform rotate-6">
              <div className="w-full aspect-square bg-black">
                <Image
                  src={image}
                  alt={`NFT ${index + 3}`}
                  width={240}
                  height={240}
                  className="object-cover w-full h-full grayscale"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NFTCarousel;