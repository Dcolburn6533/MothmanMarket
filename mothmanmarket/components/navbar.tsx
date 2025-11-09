"use client";

import Image from "next/image";
import { Rubik_Glitch } from "next/font/google";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/utils/context/UserContext";

const rubik = Rubik_Glitch({ subsets: ["latin"], weight: "400" });

export default function Navbar() {
  const router = useRouter();
  const { userId, setUserId, initialized } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const navButton =
    "px-3 py-1 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors duration-150";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }

      try {
        localStorage.removeItem("user_id");
      } catch {

      }
      try {
        setUserId(null);
      } catch {

      }
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

  if (!initialized) return null;
  if (!userId) return null;

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-sm bg-[#454343]/95 text-zinc-50 border-b border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-3 focus:outline-none"
            onClick={() => router.push('/')}
            aria-label="Go to home"
          >
            <Image
              src="/mothsona_headcut.png"
              alt="mothman_logo"
              width={48}
              height={48}
              className="rounded-md"
            />
            <span className={`${rubik.className} text-3xl font-semibold hidden sm:inline-block`}>Omens of Mothman</span>
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3">
          <button onClick={() => router.push('/make_bet')} className={navButton}>Create Bet</button>
          <button onClick={() => router.push('/dashboard')} className={navButton}>Dashboard</button>
          <button onClick={() => router.push('/wallet')} className={navButton}>Wallet</button>
          <button onClick={() => router.push('/leaderboard')} className={navButton}>Leaderboard</button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-[#c00d07] text-black font-semibold hover:bg-[#8c0703] transition-colors duration-150"
          >
            Logout
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-md hover:bg-zinc-800"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-[#454343]/95 border-t border-zinc-800">
          <div className="px-4 py-3 flex flex-col gap-2">
            <button onClick={() => { setMenuOpen(false); router.push('/make_bet') }} className={navButton}>Create Bet</button>
            <button onClick={() => { setMenuOpen(false); router.push('/dashboard') }} className={navButton}>Dashboard</button>
            <button onClick={() => { setMenuOpen(false); router.push('/wallet') }} className={navButton}>Wallet</button>
            <button onClick={() => { setMenuOpen(false); router.push('/leaderboard') }} className={navButton}>Leaderboard</button>
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="px-3 py-1 rounded-md bg-[#c00d07] text-black font-semibold hover:bg-[#a00904] transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
