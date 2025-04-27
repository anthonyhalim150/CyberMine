import axios from "axios";
import { sanitizeInput } from "../utils/auth";

//const BASE_URL = "http://localhost:8080/api";

const BASE_URL = "https://game-lu32dxaw4a-uc.a.run.app/api";

// Fetch user stats (wallet, level, XP, mining power, efficiency)
export const getUserStats = async (userId) => {
    try {
        const sanitizedUserId = sanitizeInput(userId);
        const response = await axios.get(`${BASE_URL}/get-stats-user`, {
            params: { userId: sanitizedUserId },
            withCredentials: true,
        });
        if (response.data.success) {
            return {
                wallet: sanitizeInput(parseFloat(response.data.wallet)),
                miningPower: sanitizeInput(parseInt(response.data.miningPower, 10)) || 0,
                miningEfficiency: sanitizeInput(parseFloat(response.data.miningEfficiency)) || 0,
                level: sanitizeInput(parseInt(response.data.level, 10)) || 1,
                xp: sanitizeInput(parseInt(response.data.xp, 10)) || 0,
                autoMiningRate: sanitizeInput(parseFloat(response.data.autoMiningRate)) || 0,
            };
        } else {
            throw new Error(response.data.message || "Failed to fetch user stats.");
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
};

export const gainXp = async (userId, xpGained) => {
    try {
        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedXp = sanitizeInput(xpGained);
        const response = await axios.post(`${BASE_URL}/gain-xp`, {
            userId: sanitizedUserId,
            xpGained: sanitizedXp,
        }, 
        {
            withCredentials: true, 
        }
    
        );

        if (response.data.success) {
            return {
                level: sanitizeInput(parseInt(response.data.level, 10)),
                xp: sanitizeInput(parseInt(response.data.xp, 10)),
                wallet: sanitizeInput(parseFloat(response.data.wallet)),
                leveledUp: response.data.leveledUp,
            };
        } else {
            throw new Error(response.data.message || "Failed to update XP.");
        }
    } catch (error) {
        console.error("Error updating XP:", error);
        throw error;
    }
};



// Update wallet balance
export const updateWallet = async (userId, tokensToSync) => {
    try {
        const sanitizedUserId = sanitizeInput(userId);
        const sanitizedAmount = sanitizeInput(tokensToSync);
        const response = await axios.post(`${BASE_URL}/update-wallet`, {
            userId: sanitizedUserId,
            tokensToSync: sanitizedAmount,
        },
        {
            withCredentials: true, 
        });

        if (response) {
            return response.data.message;
        } else {
            throw new Error(response.data.message || "Failed to update wallet.");
        }
    } catch (error) {
        console.error("Error updating wallet:", error);
        throw error;
    }
};
export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/login`,
            {
                username: sanitizeInput(username),
                password: sanitizeInput(password),
            },
            {
                withCredentials: true, 
            }
        );
    
        return response.data;
    } catch (error) {
        console.error("Login request failed:", error);
    }
    
  };

  export async function logoutUser() {
    try {
        await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
        console.error("Logout failed:", error);
    }
}