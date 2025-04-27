const { getUpgradesNotOwned, getUserUpgrades, purchaseUpgrade } = require("../entities/upgradeEntity");

exports.fetchUpgradesNotOwned = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    const upgradable = await getUpgradesNotOwned(userId);
    res.status(200).json({ success: true, upgradable });
  } catch (error) {
    console.error("Error fetching upgradable:", error);
    res.status(500).json({ success: false, message: "Error fetching upgradable." });
  }
};

exports.fetchUserUpgrades = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    const myUpgrades = await getUserUpgrades(userId);
    res.status(200).json({ success: true, myUpgrades });
  } catch (error) {
    console.error("Error fetching my upgrades:", error);
    res.status(500).json({ success: false, message: "Error fetching my upgrades." });
  }
};

exports.purchaseUpgrade = async (req, res) => {
  const { userId, upgradeId } = req.body;

  if (!userId || !upgradeId) {
    return res.status(400).json({ success: false, message: "User ID and Upgrade ID are required." });
  }

  try {
    await purchaseUpgrade(userId, upgradeId);
    res.status(200).json({ success: true, message: "Upgrade purchased successfully." });
  } catch (error) {
    console.error("Error purchasing upgrade:", error);
    res.status(500).json({ success: false, message: "Error purchasing upgrade." });
  }
};
