const db = require("../db");
const { sanitizeInput } = require("../utils/auth");

exports.rollLuckyBox = async (userId, boxId) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedBoxId = sanitizeInput(boxId);

        // Fetch lucky box details
        const [boxData] = await connection.execute(
            "SELECT name, price, allowed_rarities, allowed_categories, rarity_weights FROM LUCKY_BOX WHERE id = ?",
            [sanitizedBoxId]
        );

        if (boxData.length === 0) {
            throw new Error("Invalid Lucky Box.");
        }

        const { name: boxName, price, allowed_rarities, allowed_categories, rarity_weights } = boxData[0];

        // Check user wallet balance
        const [userWallet] = await connection.execute(
            "SELECT wallet FROM USERS WHERE id = ?",
            [sanitizedUserId]
        );
        if (parseFloat(userWallet[0].wallet) < parseFloat(price)) {
            throw new Error("Not enough tokens.");
        }

        // Check user inventory capacity
        const [userCapacity] = await connection.execute(
            "SELECT capacity FROM USERS WHERE id = ?",
            [sanitizedUserId]
        );

        const [currentInventoryCount] = await connection.execute(
            "SELECT COUNT(*) AS itemCount FROM PLAYER_INVENTORY WHERE user_id = ?",
            [sanitizedUserId]
        );

        if (currentInventoryCount[0].itemCount >= userCapacity[0].capacity) {
            throw new Error("Inventory is full. Cannot roll a lucky box.");
        }

        // Deduct tokens
        await connection.execute(
            "UPDATE USERS SET wallet = wallet - ? WHERE id = ?",
            [price, sanitizedUserId]
        );

        const rarities = ensureArray(allowed_rarities);
        const categories = ensureArray(allowed_categories);
        const rarityWeights = ensureJSON(rarity_weights);

        // Choose a random rarity based on weights
        const chosenRarity = getRandomRarity(rarities, rarityWeights);

        // Choose a random category
        const chosenCategory = categories[Math.floor(Math.random() * categories.length)];

        // Get a random item from the selected category and rarity
        const [items] = await connection.execute(
            "SELECT id, name FROM GAME_ITEMS WHERE category = ? AND rarity = ? ORDER BY RAND() LIMIT 1",
            [chosenCategory, chosenRarity]
        );

        if (items.length === 0) {
            throw new Error("No items available in this category and rarity.");
        }

        const selectedItem = items[0].id;
        const selectedItemName = items[0].name;

        // Add the item to user inventory
        await connection.execute(
            "INSERT INTO PLAYER_INVENTORY (user_id, item_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1",
            [sanitizedUserId, selectedItem]
        );

        await connection.commit();
        return { 
            success: true, 
            itemId: selectedItem, 
            itemName: selectedItemName, 
            itemRarity: chosenRarity, 
            itemCategory: chosenCategory, 
            boxName: boxName 
        };
    } catch (error) {
        await connection.rollback();
        console.error("Error rolling lucky box:", error);
        throw error;
    } finally {
        connection.release();
    }
};




function ensureArray(data) {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return data.split(",").map((item) => item.trim()); // Convert comma-separated values to array
        }
    }
    return [];
}


function ensureJSON(data) {
    if (typeof data === "object") return data;
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return {}; // Return empty object if parsing fails
        }
    }
    return {};
}


function getRandomRarity(rarities, rarityWeights) {
    let totalWeight = 0;
    const weightMap = {};

    rarities.forEach((rarity) => {
        totalWeight += rarityWeights[rarity] || 0;
        weightMap[rarity] = totalWeight;
    });

    const randomNum = Math.random() * totalWeight;
    return rarities.find((rarity) => randomNum <= weightMap[rarity]);
}


exports.getLuckyBoxes = async () => {
    const query = "SELECT * FROM LUCKY_BOX";
    const [boxes] = await db.execute(query);

    return boxes.map(box => ({
        ...box,
        allowed_rarities: typeof box.allowed_rarities === "string" ? JSON.parse(box.allowed_rarities) : box.allowed_rarities,
        allowed_categories: typeof box.allowed_categories === "string" ? JSON.parse(box.allowed_categories) : box.allowed_categories,
        rarity_weights: typeof box.rarity_weights === "string" ? JSON.parse(box.rarity_weights) : box.rarity_weights
    }));
};


