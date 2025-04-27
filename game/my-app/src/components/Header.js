import React from "react";
import "../styles/components/Header.css";

function Header({ tokens, setSection }) {
  return (
    <header className="header">
      <h1>Mining Simulator</h1>
      <p>🪙 Tokens: {tokens.toFixed(2)}</p>
      <nav className="top-nav">
        <button onClick={() => setSection("miner")} className="nav-button">
          Miner
        </button>
        <button onClick={() => setSection("upgradable")} className="nav-button">
          Upgradable
        </button>
        <button onClick={() => setSection("my-upgrades")} className="nav-button">
          My Upgrades
        </button>
        <button onClick={() => setSection("equipment")} className="nav-button">
          Equipment
        </button>
        <button onClick={() => setSection("lucky-box")} className="nav-button">
        Lucky Box
        </button>
        <button onClick={() => setSection("stats")} className="nav-button">
          Stats
        </button>
      </nav>
    </header>
  );
}

export default Header;
