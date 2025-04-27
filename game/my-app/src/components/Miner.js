import React, { useState } from "react";
import "../styles/components/Miner.css";

function Miner({ mineTokens }) {
  const [isMining, setIsMining] = useState(false);

  const handleMine = () => {
    setIsMining(true);
    mineTokens(); 
    setTimeout(() => setIsMining(false), 500); // Stop animation after 0.5s
  };

  return (
    <div className="miner-container">
      <div className={`miner-sprite ${isMining ? "mining" : ""}`} />
      <button onClick={handleMine} className="mine-button">
        ⛏️ Mine
      </button>
    </div>
  );
}

export default Miner;
