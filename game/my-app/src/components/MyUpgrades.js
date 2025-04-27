import React, { useState, useEffect } from "react";
import { fetchUserUpgrades } from "../api/upgrade"; // Import API function
import {sanitizeInput} from "../utils/auth";

function MyUpgrades({ userId }) {
  const [myUpgrades, setMyUpgrades] = useState([]);

  useEffect(() => {
    const loadMyUpgrades = async () => {
      try {
        const upgrades = await fetchUserUpgrades(userId);
        setMyUpgrades(upgrades);
      } catch (error) {
        console.error("Failed to load my upgrades:", error);
      }
    };

    loadMyUpgrades();
  }, [userId]);

  return (
    <div className="my-upgrades">
      <h2>My Upgrades</h2>
      <div className="upgrade-list">
        {myUpgrades.map((upgrade) => (
          <div key={`owned-${sanitizeInput(upgrade.id)}`} className="upgrade-item">
            <h3>{sanitizeInput(upgrade.name)}</h3>
            <p>{sanitizeInput(upgrade.description)}</p>
            <p> Mining Power: {sanitizeInput(upgrade.mining_power_increase)}</p>
            <p> Efficiency: {sanitizeInput(upgrade.mining_efficiency_increase)}</p>
            <p> Auto Mining: {sanitizeInput(upgrade.rateIncrease)} tokens/5 sec</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyUpgrades;
