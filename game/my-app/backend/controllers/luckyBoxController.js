const LuckyBoxEntity = require("../entities/luckyBoxEntity");

exports.getLuckyBoxes = async (req, res) => {
    try {
        const boxes = await LuckyBoxEntity.getLuckyBoxes();
        res.json({ success: true, boxes });
    } catch (error) {
        console.error("Error fetching lucky boxes:", error);
        res.status(500).json({ success: false, message: "Failed to fetch lucky boxes." });
    }
};

exports.rollLuckyBox = async (req, res) => {
    const { userId, boxId } = req.body;

    if (!userId || !boxId) {
        return res.status(400).json({ success: false, message: "User ID and Lucky Box ID are required." });
    }

    try {
        const result = await LuckyBoxEntity.rollLuckyBox(userId, boxId);
        res.json(result);
    } catch (error) {
        console.error("Error rolling lucky box:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to roll lucky box." });
    }
};
