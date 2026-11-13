import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { useAuth } from "../context/useAuth";
import {
    getDashboardAttention,
    getDashboardStatistics
} from "../services/dashboardService";
import { useLanguage } from "../context/LanguageContext";

const metricCards = [
    {
        key: "invoices",
        label: "Invoices tracked",
        description: "Across your workspace",
        icon: "invoices",
        href: "/invoices",
        tone: "violet"
    },
    {
        key: "companies",
        label: "Companies",
        description: "Registered businesses",
        icon: "companies",
        href: "/companies",
        tone: "blue"
    },
    {
        key: "creditAssessments",
        label: "Credit assessments",
        description: "Completed assessments",
        icon: "credit",
        href: "/credit",
        tone: "amber"
    },
    {
        key: "factoringDeals",
        label: "Factoring deals",
        description: "Deals in your portfolio",
        icon: "factoring",
        href: "/factoring",
        tone: "green"
    },
    {
        key: "payments",
        label: "Payments",
        description: "Recorded transactions",
        icon: "payments",
        href: "/payments",
        tone: "rose"
    }
];

const attentionCopy = {
    "invoices-needing-review": {
        title: "Invoices needing review",
        description: "Verify new or rejected invoices before they move forward."
    },
    "pending-factoring-deals": {
        title: "Factoring deals awaiting review",
        description: "Review pending deals and update their status."
    },
    "overdue-payments": {
        title: "Overdue collections",
        description: "Follow up on payments past their invoice due date."
    }
};

function DashboardPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [attentionItems, setAttentionItems] = useState([]);
    const [attentionLoading, setAttentionLoading] = useState(true);
    const [attentionError, setAttentionError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        getDashboardStatistics(controller.signal)
            .then((data) => {
                setStatistics(data);
                setErrorMessage("");
            })
            .catch((error) => {
                if (error.code === "ERR_CANCELED") {
                    return;
                }

                setErrorMessage(
                    error.response?.status === 401
                    ? "Your session has expired. Please sign in again."
                    : "We couldn’t load your dashboard statistics."
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        getDashboardAttention(controller.signal)
            .then((items) => {
                if (!Array.isArray(items)) {
                    throw new Error("The dashboard attention response was not a list.");
                }
                setAttentionItems(items);
                setAttentionError("");
            })
            .catch((error) => {
                if (error.code === "ERR_CANCELED") {
                    return;
                }
                setAttentionError("We couldn’t load your attention items.");
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setAttentionLoading(false);
                }
            });

        return () => controller.abort();
    }, [retryCount]);

    const retry = () => {
        setLoading(true);
        setAttentionLoading(true);
        setErrorMessage("");
        setAttentionError("");
        setRetryCount((count) => count + 1);
    };

    const availableCards = metricCards.filter(
        (card) => statistics?.[card.key] !== undefined
    );
    const formattedRole = t(user?.role || "");
    const formattedName = user?.name?.trim().split(/\s+/)[0] || t("there");

    return (
        <div className="dashboard-page mx-auto w-full max-w-7xl">
            <section className="welcome-banner">
                <div className="welcome-content">
                    <span className="welcome-kicker">
                        <AppIcon name="spark" />
                        {t("YOUR FINANCIAL WORKSPACE")}
                    </span>
                    <h2>{t("Good to see you")}, {formattedName}.</h2>
                    <p>
                        {t("A clear view of your factoring operations, credit activity, and the work that matters today.")}
                    </p>
                    <span className="role-pill">
                        <span className="role-dot" />
                        {formattedRole}
                    </span>
                </div>
                <div className="welcome-art" aria-hidden="true">
                    <div className="art-orbit orbit-one" />
                    <div className="art-orbit orbit-two" />
                    <div className="art-glow" />
                    <div className="art-mark">
                        <AppIcon name="chart" />
                    </div>
                </div>
                <svg
                    className="banner-wave"
                    viewBox="0 0 1440 130"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path d="M0 68c180 50 327 42 505 4 184-39 286-52 462-13 176 39 293 75 473 11v60H0Z" />
                </svg>
            </section>

            <div className="dashboard-section-heading">
                <div>
                    <span className="section-eyebrow">{t("AT A GLANCE")}</span>
                    <h2>{t("Your workspace statistics")}</h2>
                </div>
                {!loading && !errorMessage && (
                    <span className="live-indicator">
                        <span />
                        {t("Live overview")}
                    </span>
                )}
            </div>

            {loading && (
                <div className="stats-grid" role="status">
                    {metricCards.slice(0, 4).map((card) => (
                        <div className="stat-card stat-skeleton" key={card.key}>
                            <span />
                            <span />
                            <span />
                        </div>
                    ))}
                </div>
            )}

            {!loading && errorMessage && (
                <div className="dashboard-error" role="alert">
                    <AppIcon name="spark" />
                    <div>
                        <strong>{t("Statistics are temporarily unavailable")}</strong>
                        <p>{t(errorMessage)}</p>
                    </div>
                    <button className="button button-secondary" onClick={retry}>
                        {t("Try again")}
                    </button>
                </div>
            )}

            {!loading && !errorMessage && availableCards.length === 0 && (
                <div className="empty-state">
                    <AppIcon name="chart" />
                    <strong>{t("No statistics to show yet")}</strong>
                    <p>{t("Once your workspace has activity, the overview will appear here.")}</p>
                </div>
            )}

            {!loading && !errorMessage && availableCards.length > 0 && (
                <div className="stats-grid">
                    {availableCards.map((card) => (
                        <Link
                            className="stat-card"
                            to={card.href}
                            key={card.key}
                        >
                            <div className={`stat-icon tone-${card.tone}`}>
                                <AppIcon name={card.icon} />
                            </div>
                            <span className="stat-label">{t(card.label)}</span>
                            <strong className="stat-value">
                                {Number(statistics[card.key]).toLocaleString()}
                            </strong>
                            <span className="stat-description">{t(card.description)}</span>
                            <span className="stat-link-icon">
                                <AppIcon name="arrow" />
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            <section className="dashboard-attention" aria-labelledby="attention-title">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="section-eyebrow">{t("NEXT ACTIONS")}</span>
                        <h2 id="attention-title">{t("Needs attention")}</h2>
                    </div>
                </div>
                {attentionLoading && (
                    <p className="module-state" role="status">{t("Loading attention items…")}</p>
                )}
                {!attentionLoading && attentionError && (
                    <div className="dashboard-error" role="alert">
                        <AppIcon name="spark" />
                        <div>
                            <strong>{t("Action items are temporarily unavailable")}</strong>
                            <p>{t(attentionError)}</p>
                        </div>
                        <button className="button button-secondary" onClick={retry}>
                            {t("Try again")}
                        </button>
                    </div>
                )}
                {!attentionLoading && !attentionError && attentionItems.length === 0 && (
                    <div className="empty-state dashboard-attention-empty">
                        <AppIcon name="audit" />
                        <strong>{t("No outstanding items")}</strong>
                        <p>{t("Your role-scoped action queue is clear.")}</p>
                    </div>
                )}
                {!attentionLoading && !attentionError && attentionItems.length > 0 && (
                    <div className="attention-grid">
                        {attentionItems.map((item) => {
                            const copy = attentionCopy[item.key];
                            if (!copy) return null;
                            return (
                                <Link className="attention-card" to={item.href} key={item.key}>
                                    <span className="attention-count">{Number(item.count).toLocaleString()}</span>
                                    <strong>{t(copy.title)}</strong>
                                    <span>{t(copy.description)}</span>
                                    <span className="attention-link">
                                        {t("Open module")} <AppIcon name="arrow" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="dashboard-note">
                <div className="note-icon">
                    <AppIcon name="audit" />
                </div>
                <div>
                    <strong>{t("Built around your role")}</strong>
                    <p>
                        {t("Statistics and navigation are tailored to your assigned workspace permissions.")}
                    </p>
                </div>
                <span className="note-decoration" aria-hidden="true">FIEP</span>
            </section>
        </div>
    );
}

export default DashboardPage;
