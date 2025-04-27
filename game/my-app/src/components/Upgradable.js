import React, { useState, useEffect } from "react";
import { getUserStats } from "../api/user";
import { fetchUpgradesNotOwned, purchaseUpgrade } from "../api/upgrade"; // Import API functions
import {sanitizeInput} from "../utils/auth";


function Upgradable({ tokens, setTokens, userId, setMiningPower, setMiningEfficiency, setAutoMiningRate }) {
  const [upgradable, setUpgradable] = useState([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState({});

  useEffect(() => {
    const loadUpgradable = async () => {
      try {
        const upgrades = await fetchUpgradesNotOwned(userId);
        setUpgradable(upgrades);
      } catch (error) {
        console.error("Failed to load upgradable upgrades:", error);
      }
    };

    loadUpgradable();
  }, [userId]);

  // Function to fetch updated mining stats
  const fetchUpdatedStats = async () => {
    try {
      const { wallet, miningPower, miningEfficiency, autoMiningRate } = await getUserStats(sanitizeInput(userId));
      setTokens(wallet);
      setMiningPower(miningPower);
      setMiningEfficiency(miningEfficiency);
      setAutoMiningRate(autoMiningRate);
    } 
    catch (error) {
      console.error("Error fetching updated stats:", error);
    }
  };

  const handlePurchase = async (upgrade) => {
    if (tokens < upgrade.cost) {
      alert("Not enough tokens!");
      return;
    }

    setLoadingUpgrades((prev) => ({ ...prev, [upgrade.id]: true }));

    try {
      await purchaseUpgrade(userId, upgrade.id);
      setTokens(tokens - upgrade.cost);
      setUpgradable((prev) => prev.filter((u) => u.id !== upgrade.id));

      // Fetch updated stats instantly
      await fetchUpdatedStats();
    } catch (error) {
      alert("Failed to purchase upgrade. Please try again.");
    } finally {
      setLoadingUpgrades((prev) => ({ ...prev, [upgrade.id]: false }));
    }
  };

  return (
    <div className="upgrade">
      <h2>Upgradable</h2>
      <div className="upgrade-list">
        {upgradable.map((upgrade) => (
          <div key={`upgradable-${upgrade.id}`} className="upgrade-item">
            <h3>{upgrade.name}</h3>
            <p>{upgrade.description}</p>
            <p>Cost: {upgrade.cost} tokens</p>
            <p>Power Increase: {upgrade.mining_power_increase}</p>
            <p>Efficiency Increase: {upgrade.mining_efficiency_increase}</p>
            <p>Auto Mining: {upgrade.rateIncrease} tokens/5 sec</p>
            <button
              onClick={() => handlePurchase(upgrade)}
              disabled={tokens < upgrade.cost || loadingUpgrades[upgrade.id]}
            >
              {loadingUpgrades[upgrade.id] ? "Owned" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Upgradable;
