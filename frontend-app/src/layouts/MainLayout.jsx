import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AppIcon from "../components/AppIcon";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

const pageTitles = {
    "/dashboard": "Overview",
    "/companies": "Companies",
    "/invoices": "Invoices",
    "/credit": "Credit assessments",
    "/factoring": "Factoring deals",
    "/payments": "Payments",
    "/audit": "Audit logs",
    "/users": "User management"
};

function getInitialTheme() {
    const savedTheme = localStorage.getItem("fiep-theme");
    if (savedTheme) {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("fiep-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
    };
    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };
    const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

    return (
        <div className="app-shell">
            <Sidebar user={user} />
            <div className="app-main-column">
                <header className="topbar">
                    <div className="topbar-title">
                        <span className="topbar-eyebrow">{t("FIEP / workspace")}</span>
                        <h1>{t(pageTitles[location.pathname] || "Workspace")}</h1>
                    </div>
                    <div className="topbar-actions">
                        <LanguageSwitcher />
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={t(`Switch to ${theme === "dark" ? "light" : "dark"} mode`)}
                            title={t(`Switch to ${theme === "dark" ? "light" : "dark"} mode`)}
                        >
                            <AppIcon name={theme === "dark" ? "sun" : "moon"} />
                        </button>
                        <button
                            className="topbar-signout"
                            onClick={handleLogout}
                            aria-label={t("Sign out")}
                            type="button"
                        >
                            <AppIcon name="logout" />
                            <span>{t("Sign out")}</span>
                        </button>
                        <div className="profile-chip">
                            <span className="profile-avatar">{userInitial}</span>
                            <span className="profile-copy">
                                <strong>{user?.name || "User"}</strong>
                                <small>{t(user?.role || "")}</small>
                            </span>
                        </div>
                    </div>
                </header>
                <main className="app-main page-content">
                    {children}
                </main>
                <footer className="app-footer">
                    <span>{t("FIEP Factoring & Credit Intelligence")}</span>
                    <span>{t("Secure financial operations")}</span>
                </footer>
            </div>
        </div>
    );
}

export default MainLayout;
