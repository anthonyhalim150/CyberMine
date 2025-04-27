const db = require("../db");
const { sanitizeInput } = require("../utils/auth");

exports.getUserInventory = async (userId) => {
    const sanitizedUserId = sanitizeInput(userId);

    const query = `
        SELECT gi.*, pi.quantity 
        FROM PLAYER_INVENTORY pi
        JOIN GAME_ITEMS gi ON pi.item_id = gi.id
        WHERE pi.user_id = ?`;

    const capacityQuery = `SELECT capacity FROM USERS WHERE id = ? LIMIT 1`;

    try {
        const [inventory] = await db.execute(query, [sanitizedUserId]);
        const [capacityResult] = await db.execute(capacityQuery, [sanitizedUserId]);

        return {
            inventory,
            capacity: capacityResult.length > 0 ? capacityResult[0].capacity : 20,
        };
    } catch (error) {
        console.error("Error fetching user inventory:", error);
        throw error;
    }
};

exports.getEquippedItems = async (userId) => {
    const sanitizedUserId = sanitizeInput(userId);

    const query = `
        SELECT eq.slot, gi.*
        FROM EQUIPMENT eq 
        JOIN GAME_ITEMS gi ON eq.item_id = gi.id 
        WHERE eq.user_id = ?`;

    try {
        const [equipped] = await db.execute(query, [sanitizedUserId]);

        const equippedItems = {};
        equipped.forEach((item) => {
            equippedItems[item.slot] = item;
        });

        return equippedItems;
    } catch (error) {
        console.error("Error fetching equipped items:", error);
        throw error;
    }
};

exports.equipItem = async (userId, itemId, slot) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedItemId = sanitizeInput(itemId);
        const sanitizedSlot = sanitizeInput(slot);

        // Check if the user has the item in inventory
        const [inventory] = await connection.execute(
            "SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?",
            [sanitizedUserId, sanitizedItemId]
        );

        if (inventory.length === 0 || inventory[0].quantity < 1) {
            throw new Error("You do not own this item or it is out of stock.");
        }

        // Check if the slot is occupied
        const [existingItem] = await connection.execute(
            "SELECT item_id FROM EQUIPMENT WHERE user_id = ? AND slot = ?",
            [sanitizedUserId, sanitizedSlot]
        );

        if (existingItem.length > 0) {
            // If there is an item equipped, unequip it first
            const oldItemId = existingItem[0].item_id;

            // Return the old item to inventory
            const [existingInventory] = await connection.execute(
                "SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?",
                [sanitizedUserId, oldItemId]
            );

            if (existingInventory.length > 0) {
                await connection.execute(
                    "UPDATE PLAYER_INVENTORY SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?",
                    [sanitizedUserId, oldItemId]
                );
            } else {
                await connection.execute(
                    "INSERT INTO PLAYER_INVENTORY (user_id, item_id, quantity) VALUES (?, ?, 1)",
                    [sanitizedUserId, oldItemId]
                );
            }

            // Remove old item from equipment
            await connection.execute(
                "DELETE FROM EQUIPMENT WHERE user_id = ? AND slot = ?",
                [sanitizedUserId, sanitizedSlot]
            );
        }

        // Equip new item
        await connection.execute(
            "INSERT INTO EQUIPMENT (user_id, item_id, slot) VALUES (?, ?, ?)",
            [sanitizedUserId, sanitizedItemId, sanitizedSlot]
        );

        // Reduce new item's inventory quantity
        await connection.execute(
            "UPDATE PLAYER_INVENTORY SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?",
            [sanitizedUserId, sanitizedItemId]
        );

        // Remove if quantity is 0
        await connection.execute(
            "DELETE FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ? AND quantity <= 0",
            [sanitizedUserId, sanitizedItemId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Error equipping item:", error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.unequipItem = async (userId, slot) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedSlot = sanitizeInput(slot);

        // Fetch item ID before removing it
        const [equippedItem] = await connection.execute(
            "SELECT item_id FROM EQUIPMENT WHERE user_id = ? AND slot = ?",
            [sanitizedUserId, sanitizedSlot]
        );

        if (equippedItem.length === 0) {
            throw new Error("No item found in this slot.");
        }

        const itemId = equippedItem[0].item_id;

        // Check user's inventory capacity
        const [inventory] = await connection.execute(
            "SELECT COUNT(*) AS itemCount FROM PLAYER_INVENTORY WHERE user_id = ?",
            [sanitizedUserId]
        );

        const [userCapacity] = await connection.execute(
            "SELECT capacity FROM USERS WHERE id = ?",
            [sanitizedUserId]
        );

        if (inventory[0].itemCount >= userCapacity[0].capacity) {
            throw new Error("Cannot unequip, inventory is full.");
        }

        // Remove from EQUIPMENT table
        await connection.execute(
            "DELETE FROM EQUIPMENT WHERE user_id = ? AND slot = ?",
            [sanitizedUserId, sanitizedSlot]
        );

        // Return item to inventory
        const [existingItem] = await connection.execute(
            "SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?",
            [sanitizedUserId, itemId]
        );

        if (existingItem.length > 0) {
            await connection.execute(
                "UPDATE PLAYER_INVENTORY SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?",
                [sanitizedUserId, itemId]
            );
        } else {
            await connection.execute(
                "INSERT INTO PLAYER_INVENTORY (user_id, item_id, quantity) VALUES (?, ?, 1)",
                [sanitizedUserId, itemId]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Error unequipping item:", error);
        throw error;
    } finally {
        connection.release();
    }
};




exports.sellItem = async (userId, itemId, price, sellQuantity) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if the item is in the inventory
        const [inventory] = await connection.execute(
            `SELECT quantity FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?`,
            [userId, itemId]
        );

        let itemFoundInInventory = inventory.length > 0;
        let currentQuantity = itemFoundInInventory ? inventory[0].quantity : 0;

        if (itemFoundInInventory && currentQuantity >= sellQuantity) {
            // Reduce quantity in inventory or remove it if reaching zero
            if (currentQuantity > sellQuantity) {
                await connection.execute(
                    `UPDATE PLAYER_INVENTORY SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?`,
                    [sellQuantity, userId, itemId]
                );
            } else {
                await connection.execute(
                    `DELETE FROM PLAYER_INVENTORY WHERE user_id = ? AND item_id = ?`,
                    [userId, itemId]
                );
            }
        } else {
            // If item isn't in inventory, check if it's equipped
            const [equipped] = await connection.execute(
                `SELECT slot FROM EQUIPMENT WHERE user_id = ? AND item_id = ?`,
                [userId, itemId]
            );

            if (equipped.length > 0) {
                // Remove the equipped item from the EQUIPMENT table
                await connection.execute(
                    `DELETE FROM EQUIPMENT WHERE user_id = ? AND item_id = ?`,
                    [userId, itemId]
                );
            } else {
                throw new Error("Item not found in inventory or equipped.");
            }
        }

        // Add sale amount to user's wallet
        await connection.execute(
            `UPDATE USERS SET wallet = wallet + ? WHERE id = ?`,
            [price, userId]
        );

        await connection.commit();
        return { success: true, message: "Item sold successfully.", newBalance: price };

    } catch (error) {
        await connection.rollback();
        console.error("Error selling item:", error);
        throw error;
    } finally {
        connection.release();
    }
};
