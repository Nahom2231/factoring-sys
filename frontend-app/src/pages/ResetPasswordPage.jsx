import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import AuthPageShell from "../components/AuthPageShell";
import { useLanguage } from "../context/LanguageContext";

function ResetPasswordPage() {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setMessage("");
        if (password !== confirmPassword) {
            setErrorMessage("The passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post("/auth/password/reset", { token, password });
            setMessage(response.data.message);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "The reset link is invalid or expired. Request a new one."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthPageShell
            eyebrow="SECURE YOUR ACCOUNT"
            title="Set a new password"
            description="Choose a new password to regain access to your FIEP account."
            icon="key"
        >
            {!token ? (
                <div className="login-form">
                    <p className="login-error" role="alert">{t("This reset link is missing its token.")}</p>
                    <Link className="login-inline-link" to="/forgot-password">{t("Request a new reset link")}</Link>
                </div>
            ) : message ? (
                <div className="auth-success-panel" role="status">
                    <p>{t(message)}</p>
                    <Link className="login-inline-link" to="/">{t("Return to sign in")}</Link>
                </div>
            ) : (
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="new-password">{t("New password")}</label>
                    <input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={12}
                        maxLength={64}
                    />
                    <label htmlFor="confirm-password">{t("Confirm new password")}</label>
                    <input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        minLength={12}
                        maxLength={64}
                    />
                    {errorMessage && <p className="login-error" role="alert">{t(errorMessage)}</p>}
                    <button className="button button-primary login-submit" type="submit" disabled={submitting}>
                        {t(submitting ? "Updating password…" : "Update password")}
                    </button>
                </form>
            )}
        </AuthPageShell>
    );
}

export default ResetPasswordPage;
