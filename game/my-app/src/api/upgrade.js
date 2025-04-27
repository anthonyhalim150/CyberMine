import axios from "axios";

//const BASE_URL = "http://localhost:8080/api";

const BASE_URL = "https://game-lu32dxaw4a-uc.a.run.app/api";
// Fetch upgrades the user owns
export const fetchUserUpgrades = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/upgrades-owned`, {
            params: { userId },
            withCredentials: true, 
        });
        return response.data.myUpgrades || [];
    } catch (error) {
        console.error("Error fetching my upgrades:", error);
        throw error;
    }
};

// Fetch upgrades the user does not own
export const fetchUpgradesNotOwned = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/upgrades-not-owned`, {
            params: { userId },
            withCredentials: true, 
        });
        return response.data.upgradable || [];
    } catch (error) {
        console.error("Error fetching upgradable:", error);
        throw error;
    }
};

// Purchase an upgrade
export const purchaseUpgrade = async (userId, upgradeId) => {
    try {
        await axios.post(
            `${BASE_URL}/purchase-upgrade`,
            { userId, upgradeId },
            { withCredentials: true } 
        );
    } catch (error) {
        console.error("Error purchasing upgrade:", error);
        throw error;
    }
};
