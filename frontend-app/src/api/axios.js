import axios from "axios";

const isLocalHostname = (value) => {
    if (!value) {
        return false;
    }

    const host = value.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1";
};

const normalizeBaseURL = (value) => {
    if (!value) {
        return null;
    }

    const trimmed = value.trim().replace(/\/+$/, "");
    if (!trimmed) {
        return null;
    }

    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const resolveBaseURL = () => {
    const configured = normalizeBaseURL(import.meta.env.VITE_API_BASE_URL);

    if (typeof window !== "undefined") {
        const currentHost = window.location.hostname.toLowerCase();

        if (configured) {
            try {
                const url = new URL(configured);
                const host = url.hostname.toLowerCase();

                if (isLocalHostname(host) && !isLocalHostname(currentHost)) {
                    return `${window.location.origin}/api`;
                }
            } catch {
                // Ignore malformed config and fall back to the default route.
            }
        }

        if (isLocalHostname(currentHost)) {
            return "/api";
        }

        if (configured && !isLocalHostname(new URL(configured).hostname.toLowerCase())) {
            return configured;
        }

        return `${window.location.origin}/api`;
    }

    return configured || "/api";
};

export default axios.create({
    baseURL: resolveBaseURL()
});
