const express = require("express");
const { fetchUpgradesNotOwned, fetchUserUpgrades, purchaseUpgrade } = require("../controllers/upgradeController");
const router = express.Router();

router.get("/upgrades-not-owned", fetchUpgradesNotOwned);
router.get("/upgrades-owned", fetchUserUpgrades);
router.post("/purchase-upgrade", purchaseUpgrade);

module.exports = router;
