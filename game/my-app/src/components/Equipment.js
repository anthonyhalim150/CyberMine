import React, { useState, useEffect } from "react";
import { fetchUserInventory, fetchEquippedItems, equipItem, unequipItem, sellItem } from "../api/equipment";
import { getUserStats } from "../api/user"; 
import { sanitizeInput } from "../utils/auth";
import "../styles/components/Equipment.css";

function Equipment({ userId, setMiningPower, setMiningEfficiency, setAutoMiningRate, setTokens }) {
  const [inventory, setInventory] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [equippedItems, setEquippedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);

  const equipmentSlots = [
    "Helmet",
    "Gloves",
    "Exosuit",
    "Boots",
    "Tool",
    "Back Attachment",
    "Pet",
    "Accessory",
  ];

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const { items, capacity } = await fetchUserInventory(userId);
        setInventory(items);
        setMaxCapacity(capacity || 20);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      }
    };

    const loadEquippedItems = async () => {
      try {
        const equipped = await fetchEquippedItems(userId);
        setEquippedItems(equipped);
      } catch (error) {
        console.error("Failed to load equipped items:", error);
      }
    };

    loadInventory();
    loadEquippedItems();
  }, [userId]);

  const updateStats = async () => {
    try {
      const { miningPower, miningEfficiency, autoMiningRate } = await getUserStats(userId);
      setMiningPower(miningPower);
      setMiningEfficiency(miningEfficiency);
      setAutoMiningRate(autoMiningRate);
    } catch (error) {
      console.error("Error fetching updated stats:", error);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSellQuantity(1);
    setModalOpen(true);
  };

  const handleEquip = async () => {
    if (!selectedItem) return;
    const slotToEquip = selectedItem.category;
    if (!equipmentSlots.includes(slotToEquip)) {
      alert("Invalid slot detected from backend.");
      return;
    }
  
    try {
      const response = await equipItem(userId, selectedItem.id, slotToEquip);
      if (!response.success) {
        alert(response.message || "Failed to equip item.");
        return;
      }
  
      setModalOpen(false);
  
      setInventory((prev) => {
        let updatedInventory = prev
          .map((item) =>
            item.id === selectedItem.id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0); // Remove if quantity reaches 0
  
        // If there is an existing equipped item, return it to inventory
        if (equippedItems[slotToEquip]) {
          const previousItem = equippedItems[slotToEquip];
          const itemExists = updatedInventory.find((item) => item.id === previousItem.id);
  
          if (itemExists) {
            updatedInventory = updatedInventory.map((item) =>
              item.id === previousItem.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            updatedInventory.push({ ...previousItem, quantity: 1 });
          }
        }
  
        return updatedInventory;
      });
  
      setEquippedItems((prev) => ({ ...prev, [slotToEquip]: selectedItem }));
  
      await updateStats();
    } catch (error) {
      console.error("Error equipping item:", error);
    }
  };
  

  const handleUnequip = async () => {
    if (!selectedItem) return;

    try {
      const response = await unequipItem(userId, selectedItem.category);
      if (!response.success) {
        alert(response.message || "Failed to unequip item.");
        return;
      }

      setModalOpen(false);

      setInventory((prev) => {
        const itemExists = prev.some((item) => item.id === selectedItem.id);
        if (itemExists) {
          return prev.map((item) =>
            item.id === selectedItem.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prev, { ...selectedItem, quantity: 1 }];
        }
      });

      setEquippedItems((prev) => {
        const updated = { ...prev };
        delete updated[selectedItem.category];
        return updated;
      });

      await updateStats();
    } catch (error) {
      console.error("Error unequipping item:", error);
    }
  };


  const handleSell = async () => {
    if (!selectedItem || sellQuantity < 1) return;
  
    try {
      const price = sanitizeInput(parseFloat(selectedItem.price) * sellQuantity);
  
      // Call backend to sell the item
      const response = await sellItem(userId, selectedItem.id, price, sellQuantity);
  
      if (response.success) {
        setTokens((prevTokens) => prevTokens + price); // Update user balance
        setModalOpen(false);
  
        setInventory((prev) => {
          const itemInInventory = prev.find((item) => item.id === selectedItem.id);
  
          if (itemInInventory) {
            // If the item is in inventory, reduce the quantity or remove it
            return prev
              .map((item) =>
                item.id === selectedItem.id ? { ...item, quantity: item.quantity - sellQuantity } : item
              )
              .filter((item) => item.quantity > 0);
          } else {
            // If the item is equipped, remove it from equippedItems
            setEquippedItems((prev) => {
              const updated = { ...prev };
              if (updated[selectedItem.category]?.id === selectedItem.id) {
                delete updated[selectedItem.category];
              }
              return updated;
            });
  
            return prev; // Return inventory unchanged
          }
        });
  
        await updateStats();
      } else {
        alert(response.message || "Failed to sell item.");
      }
    } catch (error) {
      console.error("Error selling item:", error);
    }
  };
  


return (
  <div className="equipment-container">
    <h2>My Equipment</h2>

    <div className="equipment-grid">
      {equipmentSlots.map((slot) => (
        <div
          key={slot}
          className={`equipment-slot ${slot.toLowerCase()} rarity-${equippedItems[slot]?.rarity?.toLowerCase() || 'common'}`}
          onClick={() => equippedItems[slot] && handleItemClick(equippedItems[slot])}
        >
          {equippedItems[slot] ? (
            <img
              src={sanitizeInput(equippedItems[slot].image)}
              alt={sanitizeInput(equippedItems[slot].name)}
              className="equipped-item"
            />
          ) : (
            <div className="empty-slot"></div>
          )}
        </div>
      ))}
    </div>

    <h2>My Inventory</h2>
    <div className="inventory-grid">
      {Array.from({ length: maxCapacity }).map((_, index) => {
        const item = inventory[index];
        return (
          <div
            key={index}
            className={`inventory-slot rarity-${item?.rarity?.toLowerCase() || 'common'}`}
            onClick={() => item && handleItemClick(item)}
          >
            {item ? (
              <>
                <img
                  src={sanitizeInput(item.image)}
                  alt={sanitizeInput(item.name)}
                  className="item-image"
                />
                <span className="item-quantity">x{item.quantity}</span>
              </>
            ) : (
              <div className="empty-slot"></div>
            )}
          </div>
        );
      })}
    </div>

    {modalOpen && selectedItem && (
      <div className="item-modal">
        <div className="modal-content">
          <h3>{sanitizeInput(selectedItem.name)}</h3>
          <img
            src={sanitizeInput(selectedItem.image)}
            alt={sanitizeInput(selectedItem.name)}
            className="modal-image"
          />
          <p><strong>📜 Description:</strong> {sanitizeInput(selectedItem.description)}</p>
          <p><strong>⚡ Mining Power:</strong> {selectedItem.mining_power}</p>
          <p><strong>⛏️ Mining Efficiency:</strong> {selectedItem.mining_efficiency}</p>
          <p><strong>🤖 Auto Mining Rate:</strong> {selectedItem.auto_mining_rate || 0}</p>
          <p><strong>💰 Price:</strong> {selectedItem.price} Tokens</p>

          {/* Quantity Input Below Price */}
          <div className="quantity-container">
            <label htmlFor="sell-quantity"><strong>Quantity:</strong></label>
            <input
              id="sell-quantity"
              type="number"
              min="1"
              max={selectedItem.quantity}
              value={sellQuantity}
              onChange={(e) => setSellQuantity(Number(e.target.value))}
              className="quantity-input"
            />
          </div>

          {/* Sell Button - Positioned Above */}
          <button className="sell-button" onClick={handleSell}>
            Sell for {selectedItem.price * sellQuantity} Tokens
          </button>

          {/* Equip/Unequip and Close Buttons - Side by Side */}
          <div className="action-buttons">
            {equippedItems[selectedItem.category]?.id === selectedItem.id ? (
              <button className="unequip-button" onClick={handleUnequip}>
                Unequip
              </button>
            ) : (
              <button className="equip-button" onClick={handleEquip}>
                Equip
              </button>
            )}
            <button className="close-button" onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

}

export default Equipment;
