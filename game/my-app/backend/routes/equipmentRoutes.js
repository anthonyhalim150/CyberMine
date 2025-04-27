const express = require("express");
const { getUserInventory, getEquippedItems, equipItem, unequipItem, sellItem } = require("../controllers/equipmentController");
const router = express.Router();

router.get("/user-inventory", getUserInventory);
router.get("/equipped-items", getEquippedItems);
router.post("/equip-item", equipItem);
router.post("/unequip-item", unequipItem);
router.post("/sell-item", sellItem);
module.exports = router;
