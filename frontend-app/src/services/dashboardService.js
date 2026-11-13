import axios from "../api/axios";

export const getDashboardStatistics = async (signal) => {
    const token = localStorage.getItem("token");
    const response = await axios.get("/dashboard/statistics", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal
    });

    return response.data;
};

export const getDashboardAttention = async (signal) => {
    const token = localStorage.getItem("token");
    const response = await axios.get("/dashboard/attention", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal
    });

    return response.data;
};
