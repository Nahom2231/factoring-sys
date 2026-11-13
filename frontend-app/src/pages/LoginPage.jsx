import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import AppIcon from "../components/AppIcon";
import AuthPageShell from "../components/AuthPageShell";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/LanguageContext";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrorMessage("");

        try {
            const response = await axios.post("/auth/login", {
                email,
                password
            });
            login(response.data.token);
            navigate("/dashboard", { replace: true });
        } catch {
            setErrorMessage("We couldn’t sign you in. Check your email and password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthPageShell
            eyebrow="WELCOME BACK"
            title="Sign in to FIEP"
            description="Use your work account to continue to your workspace."
        >
            <form className="login-form" onSubmit={handleLogin}>
                <label htmlFor="login-email">{t("Work email")}</label>
                <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder={t("you@company.com")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <div className="password-label-row">
                    <label htmlFor="login-password">{t("Password")}</label>
                    <Link className="login-inline-link" to="/forgot-password">
                        {t("Forgot password?")}
                    </Link>
                </div>
                <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t("Enter your password")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                {errorMessage && (
                    <p className="login-error" role="alert">{t(errorMessage)}</p>
                )}

                <button
                    className="button button-primary login-submit"
                    type="submit"
                    disabled={submitting}
                >
                    {t(submitting ? "Signing in…" : "Sign in")}
                    {!submitting && <AppIcon name="arrow" />}
                </button>
            </form>

            <p className="login-auth-links">
                {t("New to FIEP?")} <Link className="login-inline-link" to="/register">{t("Create an account")}</Link>
            </p>

            <div className="login-security">
                <AppIcon name="audit" />
                <span>{t("Your session is protected with secure authentication.")}</span>
            </div>
        </AuthPageShell>
    );
}

export default LoginPage;
