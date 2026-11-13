import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import AuthPageShell from "../components/AuthPageShell";
import { useLanguage } from "../context/LanguageContext";

function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [resetUrl, setResetUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage("");
        setResetUrl("");
        setErrorMessage("");
        try {
            const response = await axios.post("/auth/password/forgot", { email });
            setMessage(response.data.message);
            if (response.data.resetUrl) {
                setResetUrl(response.data.resetUrl);
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message
                    || "Password reset is temporarily unavailable. Please contact your administrator."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const resetPath = resetUrl
        ? (resetUrl.startsWith("http") ? resetUrl.substring(resetUrl.indexOf("/reset-password")) : resetUrl)
        : null;

    return (
        <AuthPageShell
            eyebrow="ACCOUNT RECOVERY"
            title="Forgot your password?"
            description="Enter the email address associated with your account. If it exists, we’ll send a secure reset link."
            icon="key"
        >
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="forgot-email">{t("Work email")}</label>
                <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("you@company.com")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={254}
                />
                {message && (
                    <div className="auth-success-panel" role="status">
                        <p>{t(message)}</p>
                        {resetPath && (
                            <Link
                                to={resetPath}
                                className="button button-primary login-submit"
                                style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textDecoration: "none"
                                }}
                            >
                                {t("Proceed to Reset Password")} →
                            </Link>
                        )}
                    </div>
                )}
                {errorMessage && <p className="login-error" role="alert">{t(errorMessage)}</p>}
                <button className="button button-primary login-submit" type="submit" disabled={submitting}>
                    {t(submitting ? "Sending…" : "Send reset link")}
                </button>
            </form>
            <p className="login-auth-links">
                {t("Remembered it?")} <Link className="login-inline-link" to="/">{t("Back to sign in")}</Link>
            </p>
        </AuthPageShell>
    );
}

export default ForgotPasswordPage;
