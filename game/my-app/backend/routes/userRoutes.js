const express = require("express");
const { updateUserWallet, getUserStats, gainXp,loginUser, getUserID, logoutUser } = require("../controllers/userController");
const router = express.Router();

router.post("/update-wallet", updateUserWallet);
router.get("/get-stats-user", getUserStats);
router.post("/gain-xp", gainXp);
router.post("/login", loginUser);
router.get("/me", getUserID);
router.post("/logout", logoutUser);

module.exports = router;