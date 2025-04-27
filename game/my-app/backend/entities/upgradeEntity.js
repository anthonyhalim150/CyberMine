const db = require("../db");
const { sanitizeInput } = require("../utils/auth"); // Import sanitization

exports.getUpgradesNotOwned = async (userId) => {
    const query = `
      SELECT u.id, u.name, u.description, u.cost, u.mining_power_increase, u.mining_efficiency_increase, u.rateIncrease
      FROM UPGRADES u
      WHERE u.id NOT IN (SELECT upgrade_id FROM USER_UPGRADES WHERE user_id = ?)
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  };
  
  exports.getUserUpgrades = async (userId) => {
    const query = `
      SELECT u.id, u.name, u.description, u.cost, u.mining_power_increase, u.mining_efficiency_increase, u.rateIncrease
      FROM USER_UPGRADES uu
      JOIN UPGRADES u ON uu.upgrade_id = u.id
      WHERE uu.user_id = ?`;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  };
  

  
  exports.purchaseUpgrade = async (userId, upgradeId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      const sanitizedUserId = sanitizeInput(userId);
      const sanitizedUpgradeId = sanitizeInput(upgradeId);
  
      // Fetch the user's wallet balance
      const checkFundsQuery = "SELECT wallet FROM USERS WHERE id = ?";
      const [user] = await connection.query(checkFundsQuery, [sanitizedUserId]);
  
      if (!user[0]) {
        throw new Error("User not found.");
      }
      const userWallet = parseFloat(user[0].wallet);
  
      // Fetch the upgrade cost
      const upgradeCostQuery = "SELECT cost FROM UPGRADES WHERE id = ?";
      const [upgrade] = await connection.query(upgradeCostQuery, [sanitizedUpgradeId]);
  
      if (!upgrade[0]) {
        throw new Error("Upgrade not found.");
      }
      const upgradeCost = parseFloat(upgrade[0].cost);
  
      // Check if the user has sufficient funds
      if (userWallet < upgradeCost) {
        throw new Error("Insufficient funds.");
      }
  
      // Deduct the upgrade cost from the user's wallet
      const deductFundsQuery = "UPDATE USERS SET wallet = wallet - ? WHERE id = ?";
      await connection.query(deductFundsQuery, [upgradeCost, sanitizedUserId]);
  
      // Add the upgrade to USER_UPGRADES
      const insertUpgradeQuery = "INSERT INTO USER_UPGRADES (user_id, upgrade_id) VALUES (?, ?)";
      await connection.query(insertUpgradeQuery, [sanitizedUserId, sanitizedUpgradeId]);
  
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
  