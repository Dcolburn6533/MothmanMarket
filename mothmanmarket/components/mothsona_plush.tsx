"use client";

import { useState } from "react";
import Image from "next/image";

const MOTHSONA_QUOTES = [
  "✋ absolute cinema 🤚",
  "99% of gamblers quit before they make it big",
  "you're one bet away from retirement!",
  "you'll win big if you buy mothman lucky antenna cream 🧴",
  "I sense a successful YES bet in the future...",
  "I lied you should've went NO...",
  "Stream Golden by Huntrix!!!"
];

export function MothsonaPlush() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [hasUnreadQuote, setHasUnreadQuote] = useState(true);

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setHasUnreadQuote(false);
    } else { // cycle through quotes
      const nextIndex = (currentQuoteIndex + 1) % MOTHSONA_QUOTES.length;
      setCurrentQuoteIndex(nextIndex);
      setHasUnreadQuote(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setHasUnreadQuote(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* quote bubble */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative bg-[#262525] text-white p-4 rounded-lg shadow-lg border border-gray-700 max-w-xs min-w-[200px]">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl leading-none"
              aria-label="Close quote"
            >
              ×
            </button>
            <p className="text-sm pr-6 break-words">
              {MOTHSONA_QUOTES[currentQuoteIndex]}
            </p>
            <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[#262525]" />
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={handleClick}
          className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
          aria-label="Click for mothman wisdom"
          title="Click mothman for wisdom"
        >
          <Image
            src="/mothsona_plush.png"
            alt="Mothman Plush"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
          
          {/* notification circle */}
          {!isOpen && hasUnreadQuote && (
            <span className="absolute top-5 right-2 block h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}