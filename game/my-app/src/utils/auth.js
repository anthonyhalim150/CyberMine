import axios from "axios";
let cachedUser = null;

//const API_URL = "http://localhost:8080/api";

const API_URL = "https://game-lu32dxaw4a-uc.a.run.app/api";

export async function getUser() {
    if (cachedUser) {
        return cachedUser;
    }
    try {
        const response = await axios.get(`${API_URL}/me`, {
            withCredentials: true,
        });

        if (response.status === 200) {
            return response.data.user;
        } else {
            console.error("Failed to fetch user ID: User not authenticated");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return null;
    }
}


// Sanitize Input Function
export const sanitizeInput = (input) => {
    if (typeof input === "string") {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    }
    return input;
};
