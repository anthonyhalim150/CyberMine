const EquipmentEntity = require("../entities/equipmentEntity");

exports.getUserInventory = async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required." });
    }

    try {
        const { inventory, capacity } = await EquipmentEntity.getUserInventory(userId);
        res.json({ success: true, inventory, capacity });
    } catch (error) {
        console.error("Error fetching user inventory:", error);
        res.status(500).json({ success: false, message: "Failed to fetch inventory." });
    }
};

exports.getEquippedItems = async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required." });
    }

    try {
        const equippedItems = await EquipmentEntity.getEquippedItems(userId);
        res.json({ success: true, equipped: equippedItems });
    } catch (error) {
        console.error("Error fetching equipped items:", error);
        res.status(500).json({ success: false, message: "Failed to fetch equipped items." });
    }
};

exports.equipItem = async (req, res) => {
    const { userId, itemId, slot } = req.body;
    if (!userId || !itemId || !slot) {
        return res.status(400).json({ success: false, message: "User ID, Item ID, and Slot are required." });
    }

    try {
        await EquipmentEntity.equipItem(userId, itemId, slot);
        res.json({ success: true, message: "Item equipped successfully." });
    } catch (error) {
        console.error("Error equipping item:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to equip item." });
    }
};

exports.unequipItem = async (req, res) => {
    const { userId, slot } = req.body;
    if (!userId || !slot) {
        return res.status(400).json({ success: false, message: "User ID and Slot are required." });
    }

    try {
        await EquipmentEntity.unequipItem(userId, slot);
        res.json({ success: true, message: "Item unequipped successfully." });
    } catch (error) {
        console.error("Error unequipping item:", error);
        res.status(500).json({ success: false, message: "Failed to unequip item." });
    }
};

exports.sellItem = async (req, res) => {
    const { userId, itemId, price, sellQuantity } = req.body;

    if (!userId || !itemId || !price || !sellQuantity) {
        return res.status(400).json({ success: false, message: "User ID, Item ID, price, and quantity are required." });
    }

    try {
        const result = await EquipmentEntity.sellItem(userId, itemId, price, sellQuantity);
        res.json(result);
    } catch (error) {
        console.error("Error selling item:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to sell item." });
    }
};
