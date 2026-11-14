import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import AuthPageShell from "../components/AuthPageShell";
import AppIcon from "../components/AppIcon";
import { useLanguage } from "../context/LanguageContext";

function RegisterPage() {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "ADMIN"
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        try {
            await axios.post("/auth/register", form);
            setSuccess(true);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "We couldn’t create your account. Check your details and try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthPageShell
            eyebrow="GET STARTED"
            title={t(success ? "Account created" : "Create your account")}
            description={success
                ? t("Your account is ready. Sign in to continue to FIEP.")
                : t("Create a work account and choose the role that matches your responsibilities.")}
            icon="companies"
        >
            {success ? (
                <div className="auth-success-panel" role="status">
                    <p>{t("Your account has been created successfully.")}</p>
                    <Link className="button button-primary login-submit auth-link-button" to="/">
                        {t("Go to sign in")} <AppIcon name="arrow" />
                    </Link>
                </div>
            ) : (
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="register-name">{t("Full name")}</label>
                    <input
                        id="register-name"
                        name="name"
                        autoComplete="name"
                        value={form.name}
                        onChange={updateField}
                        required
                        maxLength={120}
                    />
                    <label htmlFor="register-email">{t("Work email")}</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t("you@company.com")}
                        value={form.email}
                        onChange={updateField}
                        required
                        maxLength={254}
                    />
                    <label htmlFor="register-role">{t("Workspace role")}</label>
                    <select
                        id="register-role"
                        name="role"
                        className="auth-select"
                        value={form.role}
                        onChange={updateField}
                    >
                        <option value="ADMIN">{t("Administrator (All Privileges)")}</option>
                        <option value="CREDIT_ANALYST">{t("Credit Analyst")}</option>
                        <option value="FACTORING_OFFICER">{t("Factoring Officer")}</option>
                        <option value="FINANCE_OFFICER">{t("Finance Officer")}</option>
                    </select>
                    <label htmlFor="register-password">{t("Password")}</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={updateField}
                        required
                        minLength={12}
                        maxLength={64}
                        aria-describedby="register-password-help"
                    />
                    <small id="register-password-help" className="auth-field-help">
                        {t("Use at least 12 characters.")}
                    </small>
                    {errorMessage && <p className="login-error" role="alert">{t(errorMessage)}</p>}
                    <button className="button button-primary login-submit" type="submit" disabled={submitting}>
                        {t(submitting ? "Creating account…" : "Create account")}
                        {!submitting && <AppIcon name="arrow" />}
                    </button>
                </form>
            )}
            {!success && (
                <p className="login-auth-links">
                    {t("Already have an account?")} <Link className="login-inline-link" to="/">{t("Sign in")}</Link>
                </p>
            )}
        </AuthPageShell>
    );
}

export default RegisterPage;
