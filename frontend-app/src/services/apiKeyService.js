import axios from "../api/axios";

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getApiKeys = async () => {
    const response = await axios.get("/api-keys", authConfig());
    return response.data;
};

export const createApiKey = async (apiKey) => {
    const response = await axios.post("/api-keys", apiKey, authConfig());
    return response.data;
};

export const revokeApiKey = async (id) => {
    await axios.delete(`/api-keys/${id}`, authConfig());
};
