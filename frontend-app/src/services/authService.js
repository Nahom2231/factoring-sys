import axios from "../api/axios";

const getAuthorizationHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCurrentUser = async (signal) => {
    const response = await axios.get("/auth/me", {
        headers: getAuthorizationHeader(),
        signal
    });

    return response.data;
};
