import { useEffect, useState } from "react";
import AuthContext from "./auth-context";
import { getCurrentUser } from "../services/authService";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        const controller = new AbortController();

        getCurrentUser(controller.signal)
            .then((profile) => {
                setUser(profile);
                setError("");
            })
            .catch((requestError) => {
                if (requestError.code === "ERR_CANCELED") {
                    return;
                }

                if (requestError.response?.status === 401) {
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                    setError("Your session has expired. Please sign in again.");
                    return;
                }

                setUser(null);
                setError("Unable to load your account. Please retry.");
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [token, refreshKey]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setError("");
        setLoading(true);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setError("");
        setLoading(false);
    };

    const retryUserLoad = () => {
        setLoading(true);
        setRefreshKey((current) => current + 1);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                isAuthenticated: Boolean(token),
                login,
                logout,
                retryUserLoad
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
