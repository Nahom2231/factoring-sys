import { useEffect, useState } from "react";
import ModuleIntro from "../components/ModuleIntro";
import { useLanguage } from "../context/LanguageContext";
import {
    createApiKey,
    getApiKeys,
    revokeApiKey
} from "../services/apiKeyService";

const roleLabels = {
    ADMIN: "Administrator",
    CREDIT_ANALYST: "Credit analyst",
    FACTORING_OFFICER: "Factoring officer",
    FINANCE_OFFICER: "Finance officer"
};

const messageFrom = (error) =>
    error.response?.data?.message || error.message || "The request could not be completed.";

const formatDate = (value) => value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    })
    : "—";

function ApiKeysPage() {
    const { t } = useLanguage();
    const [apiKeys, setApiKeys] = useState([]);
    const [name, setName] = useState("");
    const [role, setRole] = useState("FINANCE_OFFICER");
    const [expiresInDays, setExpiresInDays] = useState("90");
    const [newKey, setNewKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshKeys = async () => {
        try {
            setApiKeys(await getApiKeys());
            setError("");
        } catch (loadError) {
            setError(messageFrom(loadError));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        getApiKeys()
            .then((data) => {
                if (active) setApiKeys(data);
            })
            .catch((loadError) => {
                if (active) setError(messageFrom(loadError));
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");
        setNewKey("");
        try {
            const result = await createApiKey({
                name: name.trim(),
                role,
                expiresInDays: Number(expiresInDays)
            });
            setNewKey(result.apiKey);
            setName("");
            setNotice(t("API key created. Copy it now; it will not be shown again."));
            await refreshKeys();
            setIsModalOpen(false);
        } catch (createError) {
            setError(messageFrom(createError));
        } finally {
            setSaving(false);
        }
    };

    const handleRevoke = async (apiKey) => {
        setError("");
        setNotice("");
        try {
            await revokeApiKey(apiKey.id);
            setNotice(t(`"${apiKey.name}" was revoked.`));
            await refreshKeys();
        } catch (revokeError) {
            setError(messageFrom(revokeError));
        }
    };

    const copyKey = async () => {
        try {
            await navigator.clipboard.writeText(newKey);
            setNotice(t("API key copied to clipboard."));
        } catch {
            setError(t("Clipboard access failed. Select and copy the key manually."));
        }
    };

    return (
        <section className="api-keys-page">
            <ModuleIntro
                eyebrow="ADMIN GOVERNANCE"
                title="API Keys"
                description="Issue and revoke machine credentials for trusted integrations. Send the secret in the X-API-Key request header; each key receives its assigned FIEP role and expires after a limited lifetime."
            />

            {error && <div className="payment-alert payment-alert-error" role="alert">{t(error)}</div>}
            {notice && <div className="payment-alert payment-alert-success" role="status">{t(notice)}</div>}

            {newKey && (
                <section className="api-key-secret-card" aria-label={t("New API key")}>
                    <div>
                        <strong>{t("Copy and store this key securely")}</strong>
                        <p>{t("This secret is displayed only once. Anyone who has it can act with its assigned role.")}</p>
                    </div>
                    <code>{newKey}</code>
                    <button className="payment-button" type="button" onClick={copyKey}>{t("Copy key")}</button>
                </section>
            )}

            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{t("Create an API key")}</h3>
                                <p>{t("Use a descriptive name so you can identify the integration later.")}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                                aria-label={t("Close")}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="payment-form-grid">
                                    <label>
                                        {t("Key name")}
                                        <input
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            maxLength={100}
                                            placeholder={t("e.g. Monthly reconciliation")}
                                            required
                                        />
                                    </label>
                                    <label>
                                        {t("FIEP role")}
                                        <select value={role} onChange={(event) => setRole(event.target.value)}>
                                            {Object.entries(roleLabels).map(([value, label]) => (
                                                <option key={value} value={value}>{t(label)}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        {t("Expires after")}
                                        <select
                                            value={expiresInDays}
                                            onChange={(event) => setExpiresInDays(event.target.value)}
                                        >
                                            <option value="30">{t("30 days")}</option>
                                            <option value="90">{t("90 days")}</option>
                                            <option value="180">{t("180 days")}</option>
                                            <option value="365">{t("365 days")}</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="api-key-role-warning">
                                    {t("Administrator keys can access every module. Assign only the permissions the integration needs.")}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    className="button button-primary"
                                    type="submit"
                                    disabled={saving}
                                >
                                    {t(saving ? "Creating…" : "Create API key")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <section className="payment-table-card" aria-label={t("API keys")}>
                <div className="payment-table-toolbar">
                    <div>
                        <h2>{t("Issued keys")}</h2>
                        <p>{t("Only key prefixes are stored in this list; the full secret is never retrievable.")}</p>
                    </div>
                    <button
                        className="button button-primary"
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + {t("Create API key")}
                    </button>
                </div>
                <div className="payment-table-scroll">
                    <table className="payment-table api-key-table">
                        <thead>
                            <tr>
                                <th>{t("Name")}</th>
                                <th>{t("Prefix")}</th>
                                <th>{t("Role")}</th>
                                <th>{t("Created")}</th>
                                <th>{t("Expires")}</th>
                                <th>{t("Last used")}</th>
                                <th>{t("Status")}</th>
                                <th>{t("Action")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="payment-table-message">{t("Loading API keys…")}</td></tr>
                            ) : apiKeys.length === 0 ? (
                                <tr><td colSpan="8" className="payment-table-message">{t("No API keys have been issued.")}</td></tr>
                            ) : apiKeys.map((apiKey) => (
                                <tr key={apiKey.id}>
                                    <td><strong>{apiKey.name}</strong><small>{t("Created by")} {apiKey.createdBy}</small></td>
                                    <td><code>{apiKey.prefix}…</code></td>
                                    <td>{t(roleLabels[apiKey.role] || apiKey.role)}</td>
                                    <td>{formatDate(apiKey.createdAt)}</td>
                                    <td>{formatDate(apiKey.expiresAt)}</td>
                                    <td>{apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : t("Never")}</td>
                                    <td>
                                        <span className={`api-key-status api-key-status-${apiKey.status.toLowerCase()}`}>
                                            {t(apiKey.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {apiKey.status === "ACTIVE" && (
                                            <button
                                                className="api-key-revoke"
                                                type="button"
                                                onClick={() => handleRevoke(apiKey)}
                                            >
                                                {t("Revoke")}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    );
}

export default ApiKeysPage;
