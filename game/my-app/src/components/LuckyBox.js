import React, { useState, useEffect } from "react";
import { fetchLuckyBoxes, rollLuckyBox } from "../api/luckyBox";
import { sanitizeInput } from "../utils/auth";
import "../styles/components/LuckyBox.css";

function LuckyBox({ userId, setTokens }) {
  const [luckyBoxes, setLuckyBoxes] = useState([]);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLuckyBoxes = async () => {
      try {
        const boxes = await fetchLuckyBoxes();
        setLuckyBoxes(boxes);
      } catch (error) {
        console.error("Failed to load lucky boxes:", error);
      }
    };

    loadLuckyBoxes();
  }, []);

  const handleRoll = async (boxId, price) => {
    if (rolling) return;
    setRolling(true);
    setError(null);

    try {
      const response = await rollLuckyBox(userId, boxId);
      if (response.success) {
        setResult(response);
        setTokens((prev) => prev - price);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to roll. Inventory full or insufficient tokens.");
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="lucky-box-container">
      <h2>🎁 Lucky Boxes</h2>
      <div className="lucky-box-list">
        {luckyBoxes.map((box) => (
          <div key={box.id} className="lucky-box-card">
            <img src={sanitizeInput(box.image_url)} alt= {box.image_url} className="lucky-box-image"></img>
            <h3>{sanitizeInput(box.name)}</h3>
            <p>{sanitizeInput(box.description)}</p>
            <p>💰 Price: {box.price} Tokens</p>
            <p>🎲 Rarities: {Array.isArray(box.allowed_rarities) ? box.allowed_rarities.join(", ") : box.allowed_rarities}</p>
            <button 
              className="roll-button" 
              onClick={() => handleRoll(box.id, box.price)}
              disabled={rolling}
            >
              {rolling ? "Rolling..." : `Roll for ${box.price} Tokens`}
            </button>
          </div>
        ))}
      </div>
      {result && (
        <div className="roll-result">
            🎉 You received a 
            <strong className={`rarity-${sanitizeInput(result.itemRarity).toLowerCase()}`}>
            {" "}{sanitizeInput(result.itemName)}
            </strong> from <strong>{sanitizeInput(result.boxName)}</strong>!
        </div>
        )}
        

      {error && <div className="error-message">{sanitizeInput(error)}</div>}
    </div>
  );
}

export default LuckyBox;
