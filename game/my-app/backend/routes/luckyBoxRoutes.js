const express = require("express");
const router = express.Router();
const LuckyBoxController = require("../controllers/luckyBoxController");

router.get("/lucky-boxes", LuckyBoxController.getLuckyBoxes);
router.post("/roll-lucky-box", LuckyBoxController.rollLuckyBox);

module.exports = router;
