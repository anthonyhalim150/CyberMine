const jwt = require("jsonwebtoken");
const { updateWallet, getUserStats, addXpAndCheckLevel, getUserByUsername, verifyPassword} = require("../entities/userEntity");
const { sanitizeInput } = require("../utils/auth"); // Import sanitization

exports.updateUserWallet = async (req, res) => {
  console.log("Controller hit: updateUserWallet");
  const { userId, tokensToSync } = req.body;

  if (!userId || !tokensToSync) {
    console.error("Validation failed: Missing userId or tokens.");
    return res.status(400).json({ message: "Missing userId or tokens." });
  }

  try {
    console.log(`Updating wallet for userId: ${userId}, tokens: ${tokensToSync}`);
    await updateWallet(sanitizeInput(userId), sanitizeInput(tokensToSync));
    res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.error("Error in updateUserWallet:", error);
    res.status(500).json({ message: "Error updating wallet." });
  }
};

exports.getUserStats = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
      const sanitizedUserId = sanitizeInput(userId);
      const userStats = await getUserStats(sanitizedUserId);
      res.status(200).json({ success: true, ...userStats });
  } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ success: false, message: "Error fetching user stats." });
  }
};


exports.gainXp = async (req, res) => {
  const { userId, xpGained } = req.body;

  if (!userId || xpGained === undefined) {
      return res.status(400).json({ success: false, message: "User ID and XP amount are required." });
  }

  try {
      const sanitizedUserId = sanitizeInput(userId);
      const sanitizedXp = sanitizeInput(xpGained);
      const userStats = await addXpAndCheckLevel(sanitizedUserId, sanitizedXp);

      res.status(200).json({ success: true, ...userStats });
  } catch (error) {
      console.error("Error updating XP:", error);
      res.status(500).json({ success: false, message: "Error updating XP." });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "blabla729wwdee302!2-";
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid username or password." });
        }
        
        const passwordMatch = await verifyPassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: "Invalid username or password." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        console.log(token);

        // Clear existing cookie and set new one
        res.clearCookie("gameToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: "/",
        });

        res.cookie("gameToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 48 * 60 * 60 * 1000, // 48 hours
            path: "/",
        });

        // Send user data (not the token)
        res.status(200).json({
            success: true,
            userID: user.id,
            role: user.role,
            username: user.username,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
};
exports.getUserID = async (req, res) => {
    try {
        console.log(req.user);
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.error("Error fetching user ID:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.logoutUser = (req, res) => {
    res.clearCookie("gameToken", {
        httpOnly: true,
        secure: true, // Required for HTTPS
        sameSite: "None", // Required for cross-origin authentication
        path: "/", // Ensure it matches the path where it was set
    });

    return res.status(200).json({ success: true, message: "Logged out successfully." });
};
