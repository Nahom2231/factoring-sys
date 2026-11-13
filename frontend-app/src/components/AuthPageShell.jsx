import AppIcon from "./AppIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

function AuthPageShell({ eyebrow, title, description, icon = "audit", children }) {
    const { t } = useLanguage();

    return (
        <main className="login-screen relative min-h-screen">
            <div className="auth-language-control">
                <LanguageSwitcher />
            </div>
            <div className="login-backdrop" aria-hidden="true">
                <span className="backdrop-blob blob-one" />
                <span className="backdrop-blob blob-two" />
                <span className="backdrop-grid" />
            </div>
            <div className="login-shell">
                <section className="login-story">
                    <a className="login-brand" href="/" aria-label={t("FIEP home")}>
                        <span className="brand-mark">
                            <AppIcon name="factoring" />
                        </span>
                        <span>
                            <strong>FIEP</strong>
                            <small>{t("Factoring intelligence")}</small>
                        </span>
                    </a>
                    <div className="login-story-copy">
                        <span className="welcome-kicker">
                            <AppIcon name="spark" />
                            {t("FINANCE, IN FOCUS")}
                        </span>
                        <h1>{t("Clarity for every step forward.")}</h1>
                        <p>
                            {t("Bring your invoices, credit decisions, and factoring operations into one thoughtful workspace.")}
                        </p>
                    </div>
                    <div className="login-showcase">
                        <div className="showcase-topline">
                            <span>{t("WORKSPACE SNAPSHOT")}</span>
                            <span className="showcase-live"><i /> {t("SYSTEM READY")}</span>
                        </div>
                        <div className="showcase-chart">
                            <svg viewBox="0 0 520 150" role="img" aria-label={t("Decorative rising activity chart")}>
                                <defs>
                                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#a78bfa" stopOpacity=".32" />
                                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path className="chart-area" d="M0 116 55 96 105 104 158 68 213 81 267 45 321 62 375 26 428 45 475 16 520 22V150H0Z" />
                                <path className="chart-line" d="M0 116 55 96 105 104 158 68 213 81 267 45 321 62 375 26 428 45 475 16 520 22" />
                                <circle cx="475" cy="16" r="5" />
                            </svg>
                        </div>
                        <div className="showcase-footer">
                            <span><i className="showcase-dot purple" /> {t("Portfolio visibility")}</span>
                            <span><i className="showcase-dot cyan" /> {t("Confident decisions")}</span>
                        </div>
                    </div>
                    <p className="login-footnote">{t("A smarter view of your working capital.")}</p>
                </section>

                <section className="login-panel">
                    <div className="login-panel-inner">
                        <div className="login-icon">
                            <AppIcon name={icon} />
                        </div>
                        <span className="section-eyebrow">{t(eyebrow)}</span>
                        <h2>{t(title)}</h2>
                        <p className="login-subtitle">{t(description)}</p>
                        {children}
                    </div>
                    <span className="panel-corner panel-corner-one" />
                    <span className="panel-corner panel-corner-two" />
                </section>
            </div>
        </main>
    );
}

export default AuthPageShell;
