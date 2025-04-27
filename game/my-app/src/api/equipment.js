import axios from "axios";
import { sanitizeInput } from "../utils/auth";

//const BASE_URL = "http://localhost:8080/api";

const BASE_URL = "https://game-lu32dxaw4a-uc.a.run.app/api";

export const fetchUserInventory = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/user-inventory`, {
      params: { userId: sanitizeInput(userId) },
      withCredentials: true,
    });

    return {
      items: response.data.inventory || [],
      capacity: response.data.capacity || 20,
    };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};

export const fetchEquippedItems = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/equipped-items`, {
      params: { userId: sanitizeInput(userId) },
      withCredentials: true,
    });

    return response.data.equipped || {};
  } catch (error) {
    console.error("Error fetching equipped items:", error);
    throw error;
  }
};

export const equipItem = async (userId, itemId, slot) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/equip-item`,
      {
        userId: sanitizeInput(userId),
        itemId: sanitizeInput(itemId),
        slot: sanitizeInput(slot),
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("Error equipping item:", error);
    throw error;
  }
};

export const unequipItem = async (userId, slot) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/unequip-item`,
      {
        userId: sanitizeInput(userId),
        slot: sanitizeInput(slot),
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("Error unequipping item:", error);
    throw error;
  }
};

export const sellItem = async (userId, itemId, price, sellQuantity) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/sell-item`,
      {
        userId: sanitizeInput(userId),
        itemId: sanitizeInput(itemId),
        price: sanitizeInput(price),
        sellQuantity: sanitizeInput(sellQuantity),
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("Error selling item:", error);
    throw error;
  }
};
