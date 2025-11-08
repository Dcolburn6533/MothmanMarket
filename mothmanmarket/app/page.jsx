import Image from "next/image";
import { Rubik_Distressed } from "next/font/google";

const rubikFont = Rubik_Distressed({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div>
      <header className="header">
        <div className="logo-container">
          <Image
            src="/mothsona_headcut.png"
            alt="mothman_logo"
            width={67}
            height={67}
            className="logo"
          />
          {/* <span className="site-title">Mothmanmarket</span> */}
          <span className={`${rubikFont.className} site-title`}>Mothmanmarket</span>
        </div>
        <nav className="nav">
          <button className="nav-button">Wallet</button>
          <button className="nav-button">Leaderboard</button>
          <button className="nav-button">Login</button>
          <button className="nav-button signup">Sign Up</button>
        </nav>
      </header>
      <main className="main-content">
        <p>hello gambling addicts</p>
      </main>
    </div>
  );
}