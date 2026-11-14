import axios from "axios";

const resolveBaseURL = () => {
    const configuredURL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
    const configuredBaseURL = configuredURL
        ? configuredURL.endsWith("/api") ? configuredURL : `${configuredURL}/api`
        : null;

    if (typeof window !== "undefined") {
        const host = window.location.hostname.toLowerCase();
        const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host);

        if (isLocalHost) {
            if (!configuredBaseURL) {
                return "/api";
            }

            const configuredHost = new URL(configuredBaseURL, window.location.origin).hostname.toLowerCase();
            if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(configuredHost)) {
                return "/api";
            }
        }
    }

    return configuredBaseURL || "https://factoring-backend-jhdm.onrender.com/api";
};

export default axios.create({
    baseURL: resolveBaseURL()
});
