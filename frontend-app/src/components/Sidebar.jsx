import { Link, NavLink } from "react-router-dom";
import AppIcon from "./AppIcon";
import { useLanguage } from "../context/LanguageContext";

const navigation = [
    { label: "Overview", to: "/dashboard", icon: "dashboard" },
    { label: "Companies", to: "/companies", icon: "companies", roles: ["ADMIN"] },
    { label: "Invoices", to: "/invoices", icon: "invoices" },
    {
        label: "Credit assessments",
        to: "/credit",
        icon: "credit",
        roles: ["ADMIN", "CREDIT_ANALYST"]
    },
    {
        label: "Factoring deals",
        to: "/factoring",
        icon: "factoring",
        roles: ["ADMIN", "FACTORING_OFFICER", "FINANCE_OFFICER"]
    },
    {
        label: "Payments",
        to: "/payments",
        icon: "payments",
        roles: ["ADMIN", "FINANCE_OFFICER"]
    },
    { label: "Audit logs", to: "/audit", icon: "audit", roles: ["ADMIN"] },
    { label: "API Keys", to: "/api-keys", icon: "key", roles: ["ADMIN"] },
    { label: "User management", to: "/users", icon: "companies", roles: ["ADMIN"] }
];

function Sidebar({ user }) {
    const { t } = useLanguage();
    const isAdmin = user?.role === "ADMIN";
    const visibleNavigation = navigation.filter(
        (item) =>
            isAdmin ||
            !item.roles ||
            item.roles.includes(user?.role)
    );

    return (
        <aside className="app-sidebar">
            <Link className="brand-lockup" to="/dashboard" aria-label={t("FIEP home")}>
                <span className="brand-mark">
                    <AppIcon name="factoring" />
                </span>
                <span>
                    <strong>FIEP</strong>
                    <small>{t("Factoring intelligence")}</small>
                </span>
            </Link>

            <div className="sidebar-label">{t("Workspace")}</div>
            <nav className="sidebar-nav" aria-label={t("Main navigation")}>
                {visibleNavigation.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? " is-active" : ""}`
                        }
                    >
                        <AppIcon name={item.icon} />
                        <span>{t(item.label)}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-access-card">
                    <span className="access-indicator" />
                    <div>
                        <strong>{t("Secure workspace")}</strong>
                        <span>{t(user?.role || "")}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
