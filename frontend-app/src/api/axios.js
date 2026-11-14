import axios from "axios";

const resolveBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        const url = import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, "");
        return url.endsWith("/api") ? url : `${url}/api`;
    }

    if (typeof window !== "undefined") {
        const host = window.location.hostname.toLowerCase();
        if (host === "localhost" || host === "127.0.0.1") {
            return "http://localhost:8080/api";
        }
    }

    return "https://factoring-backend-jhdm.onrender.com/api";
};

export default axios.create({
    baseURL: resolveBaseURL()
});
