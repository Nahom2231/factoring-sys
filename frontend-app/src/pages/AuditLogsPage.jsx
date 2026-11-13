import { useEffect, useState } from "react";
import { getAuditLogs } from "../services/auditLogService";
import ModuleIntro from "../components/ModuleIntro";
import CsvExportButton from "../components/CsvExportButton";
import { useLanguage } from "../context/LanguageContext";

function AuditLogsPage() {
    const { t } = useLanguage();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const handleRetry = () => {
        setLoading(true);
        setErrorMessage("");
        setRetryCount((count) => count + 1);
    };

    useEffect(() => {
        let isMounted = true;

        getAuditLogs()
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error("The audit logs response was not a list.");
                }

                if (isMounted) {
                    setLogs(data);
                    setErrorMessage("");
                }
            })
            .catch((error) => {
                if (!isMounted) {
                    return;
                }

                const status = error.response?.status;

                if (status === 401) {
                    setErrorMessage(
                        "Your session has expired or you are not signed in. Please sign in again."
                    );
                } else if (status === 403) {
                    setErrorMessage(
                        "You do not have permission to view audit logs. An administrator role is required."
                    );
                } else {
                    setErrorMessage("Unable to load audit logs. Please try again.");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [retryCount]);

    return (
        <div>
            <ModuleIntro
                eyebrow="ADMIN GOVERNANCE"
                title="Audit Logs"
                description="Review recorded administrative actions, the account that performed them, and when they occurred. Use this history to support operational oversight and traceability."
            />

            <div className="module-actions">
                <CsvExportButton
                    filename="fiep-audit-logs.csv"
                    label={t("Export CSV")}
                    headers={[t("Time"), t("User"), t("Action")]}
                    rows={logs.map((log) => [
                        log.timestamp,
                        log.username,
                        log.action
                    ])}
                />
            </div>

            {loading && <p className="module-state" role="status">{t("Loading audit logs...")}</p>}

            {!loading && errorMessage && (
                <div className="module-state module-state-error" role="alert">
                    <p>{t(errorMessage)}</p>
                    <button onClick={handleRetry}>{t("Retry")}</button>
                </div>
            )}

            {!loading && !errorMessage && logs.length === 0 && (
                <p className="module-state module-state-empty">{t("No audit logs found.")}</p>
            )}

            {!loading && !errorMessage && logs.length > 0 && (
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>{t("Time")}</th>
                                <th>{t("User")}</th>
                                <th>{t("Action")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.timestamp}</td>
                                    <td>{log.username}</td>
                                    <td>{t(log.action)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AuditLogsPage;