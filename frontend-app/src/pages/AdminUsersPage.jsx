import { useEffect, useState } from "react";
import axios from "../api/axios";
import ModuleIntro from "../components/ModuleIntro";
import { useLanguage } from "../context/LanguageContext";

const roles = [
    { value: "ADMIN", label: "Admin" },
    { value: "CREDIT_ANALYST", label: "Credit Analyst" },
    { value: "FACTORING_OFFICER", label: "Factoring Officer" },
    { value: "FINANCE_OFFICER", label: "Finance Officer" }
];

function AdminUsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "CREDIT_ANALYST"
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;
        axios.get("/auth/admin/users", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then((response) => {
                if (active) {
                    setUsers(response.data);
                }
            })
            .catch((error) => {
                if (active) {
                    setErrorMessage(error.response?.data?.message || "Could not load user accounts.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            await axios.post("/auth/admin/users", form, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setSuccessMessage(t("User account created."));
            setForm({ name: "", email: "", password: "", role: "CREDIT_ANALYST" });
            const response = await axios.get("/auth/admin/users", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setUsers(response.data);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Could not create the user account.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <ModuleIntro
                eyebrow="ADMINISTRATION"
                title="User management"
                description="Create accounts and assign workspace roles. Admin privileges can only be granted by an existing Admin."
            />
            <form className="admin-user-form" onSubmit={handleSubmit}>
                <label>
                    {t("Full name")}
                    <input
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        required
                        maxLength={120}
                    />
                </label>
                <label>
                    {t("Work email")}
                    <input
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        required
                        maxLength={254}
                    />
                </label>
                <label>
                    {t("Role")}
                    <select
                        value={form.role}
                        onChange={(event) => setForm({ ...form, role: event.target.value })}
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>{t(role.label)}</option>
                        ))}
                    </select>
                </label>
                <label>
                    {t("Temporary password")}
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        required
                        minLength={12}
                        maxLength={64}
                        autoComplete="new-password"
                    />
                    <small>{t("At least 12 characters. Share it securely; the user can reset it by email.")}</small>
                </label>
                {errorMessage && <p className="login-error" role="alert">{t(errorMessage)}</p>}
                {successMessage && <p className="admin-user-success" role="status">{t(successMessage)}</p>}
                <button type="submit" disabled={submitting}>
                    {t(submitting ? "Creating…" : "Create account")}
                </button>
            </form>

            <h2>{t("Registered accounts")}</h2>
            {loading ? (
                <p role="status">{t("Loading accounts…")}</p>
            ) : (
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>{t("Name")}</th><th>{t("Email")}</th><th>{t("Role")}</th></tr></thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.email}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{t(user.role || "")}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan="3">{t("No accounts found.")}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminUsersPage;
