"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/utils/context/UserContext";
import { usePathname } from "next/navigation";

const MOTHSONA_QUOTES = [
  "So you think you can predict the future?",
  "Out of coins? Just wait an hour. You'll be able to make new predictions soon.",
  "I've seen what comes next. Let's just say you don't need to go to work tomorrow.",
  "Here's a good omen: I love you.",
  "99% of gamblers quit before they make it big!",
  "You're one bet away from retirement!",
  "You'll win big if you buy some mothman lucky antenna cream!",
  "I sense a successful YES bet in the future...",
  "I lied you should've went NO...",
  "Stream Golden by Huntrix!!!",
  "✋ absolute cinema 🤚",
];

export function MothsonaPlush() {
  const { userId, initialized } = useUser();
  const pathname = usePathname();  
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
  
  // dont render if not initialized or no user
  if (!initialized) return null;
  if (!userId) return null; 

  // dont render on wallet page
  if (pathname === "/wallet") return null;

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