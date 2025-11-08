import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-site text-white">
      <header className="w-full bg-[#101820]/80 backdrop-blur flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/mothsona_cropped.jpg"
            alt="Mothman logo"
            width={50}
            height={50}
            className="rounded-md"
          />
          <span className="text-lg font-semibold tracking-tight">
            Mothmanmarket
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <button className="px-3 py-1 rounded-md hover:bg-white/10">
            User
          </button>
          <button className="px-3 py-1 rounded-md hover:bg-white/10">
            Wallet
          </button>
          <button className="px-3 py-1 rounded-md hover:bg-white/10">
            Leaderboard
          </button>
        </nav>
      </header>

      <main className="p-6"></main>
    </div>
  );
}
