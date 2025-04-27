import React from "react";
import { sanitizeInput } from "../utils/auth";
import { logoutUser } from "../api/user"; 

function Stats({ tokens, miningPower, miningEfficiency, autoMiningRate, setUser }) {
  
  const handleLogout = async () => {
    await logoutUser();
    setUser(null); // Clear user state after logout
  };

  return (
    <div className="stats">
      <h2>User Stats</h2>
      <p><strong>🪙 Tokens:</strong> {sanitizeInput(tokens.toFixed(2))}</p>
      <p><strong>⚡Mining Power:</strong> {1 + sanitizeInput(parseFloat(miningPower))}</p>
      <p><strong>⛏️Mining Efficiency:</strong> x{1 + sanitizeInput(parseFloat(miningEfficiency.toFixed(2)))}</p>
      <p><strong>🤖Auto-Mining Rate:</strong> {sanitizeInput(autoMiningRate)} tokens/5 sec</p>
      
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Stats;
