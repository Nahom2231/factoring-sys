import { useEffect, useState } from "react";
import {
    getAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment
} from "../services/creditAssessmentService";
import { getCompanyOptions } from "../services/companyService";
import ModuleIntro from "../components/ModuleIntro";
import CsvExportButton from "../components/CsvExportButton";
import { useLanguage } from "../context/LanguageContext";

const apiErrorMessage = (error, fallback) =>
    error.response?.data?.detail
    || error.response?.data?.message
    || fallback;

function CreditAssessmentsPage() {
    const { t } = useLanguage();

    const [assessments, setAssessments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [companyOptionsLoading, setCompanyOptionsLoading] = useState(true);
    const [companyOptionsError, setCompanyOptionsError] = useState("");

    const [selectedCompany, setSelectedCompany] = useState("");
    const [score, setScore] = useState("");
    const [remarks, setRemarks] = useState("");
    const [decision, setDecision] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const loadAssessments = async () => {
        try {
            const data = await getAssessments();
            setAssessments(data || []);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: apiErrorMessage(error, t("Could not load credit assessments."))
            });
        }
    };

    useEffect(() => {
        let ignore = false;
        Promise.all([getAssessments(), getCompanyOptions()])
            .then(([assessmentsData, companyOptions]) => {
                if (ignore) return;
                setAssessments(assessmentsData || []);
                setCompanies(companyOptions || []);
            })
            .catch((error) => {
                if (ignore) return;
                console.error(error);
                setCompanyOptionsError(
                    error.response?.data?.message || "Company options could not be loaded."
                );
            })
            .finally(() => {
                if (!ignore) setCompanyOptionsLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, []);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        if (type === "success") {
            setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
        }
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();

        if (!selectedCompany) {
            showFeedback("error", t("Select a company for this credit assessment."));
            return;
        }

        const numericScore = Number(score);
        if (!score || !Number.isFinite(numericScore) || numericScore <= 0) {
            showFeedback("error", t("Score is required and must be positive"));
            return;
        }

        if (!decision) {
            showFeedback("error", t("Decision is required"));
            return;
        }

        if (!String(remarks).trim()) {
            showFeedback("error", t("Remarks are required"));
            return;
        }

        const assessment = {
            score: numericScore,
            remarks: String(remarks).trim(),
            decision,
            company: { id: selectedCompany }
        };

        try {
            setSaving(true);
            setFeedback({ type: "", message: "" });

            if (editingId) {
                await updateAssessment(editingId, assessment);
            } else {
                await createAssessment(assessment);
            }

            clearForm();
            setIsModalOpen(false);
            await loadAssessments();
            showFeedback("success", t("Credit assessment saved successfully."));
        } catch (error) {
            showFeedback("error", apiErrorMessage(error, t("Could not save the credit assessment.")));
        } finally {
            setSaving(false);
        }
    };

    // Direct, instant delete without annoying browser popup pages
    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            setFeedback({ type: "", message: "" });

            // Optimistically remove from list immediately for fast responsive UX
            setAssessments((prev) => prev.filter((item) => item.id !== id));

            await deleteAssessment(id);
            if (editingId === id) {
                clearForm();
            }
            showFeedback("success", t("Credit assessment deleted successfully."));
            await loadAssessments();
        } catch (error) {
            // Restore from backend if failed
            await loadAssessments();
            showFeedback("error", apiErrorMessage(error, t("Could not delete credit assessment.")));
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (assessment) => {
        setEditingId(assessment.id);
        setScore(String(assessment.score || ""));
        setRemarks(assessment.remarks || "");
        setDecision(assessment.decision || "");
        setSelectedCompany(assessment.company?.id || "");
        setFeedback({ type: "", message: "" });
        setIsModalOpen(true);
    };

    const clearForm = () => {
        setEditingId(null);
        setScore("");
        setRemarks("");
        setDecision("");
        setSelectedCompany("");
        setFeedback({ type: "", message: "" });
        setIsModalOpen(false);
    };

    return (
        <div>
            <ModuleIntro
                eyebrow="RISK REVIEW"
                title="Credit Assessments"
                description="Record a company’s credit score, analyst rationale, and BUY or NO BUY decision. Assessments give factoring teams a documented risk signal to review alongside invoice and deal details."
            />

            <div className="module-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                        clearForm();
                        setIsModalOpen(true);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span>
                    <span>{t("Record Assessment")}</span>
                </button>

                <CsvExportButton
                    filename="fiep-credit-assessments.csv"
                    label={t("Export CSV")}
                    headers={[t("Company"), t("Score"), t("Remarks"), t("Decision")]}
                    rows={assessments.map((assessment) => [
                        assessment.company?.companyName || assessment.company?.tradeName || "—",
                        assessment.score,
                        assessment.remarks,
                        assessment.decision
                    ])}
                />
            </div>

            {feedback.message && (
                <div
                    className={
                        feedback.type === "error"
                            ? "module-state module-state-error"
                            : "module-state"
                    }
                    style={
                        feedback.type === "success"
                            ? {
                                backgroundColor: "rgba(16, 185, 129, 0.12)",
                                color: "#10b981",
                                border: "1px solid #10b981",
                                borderRadius: "8px",
                                padding: "12px",
                                margin: "12px 0"
                            }
                            : undefined
                    }
                    role={feedback.type === "error" ? "alert" : "status"}
                >
                    {t(feedback.message)}
                </div>
            )}

            {/* Assessment Dialog Modal */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{editingId ? t("Update Assessment") : t("Record Assessment")}</h3>
                                <p>{t("Record a company’s credit score, analyst rationale, and BUY or NO BUY decision.")}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                                aria-label={t("Close")}
                            >×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="deal-form-grid" style={{ margin: 0, padding: 0, border: "none", boxShadow: "none" }}>
                                    <label htmlFor="assessment-company">
                                        {t("Company")} *
                                        <select
                                            id="assessment-company"
                                            value={selectedCompany}
                                            onChange={(e) => setSelectedCompany(e.target.value)}
                                            required
                                            disabled={companyOptionsLoading || Boolean(companyOptionsError) || companies.length === 0}
                                        >
                                            <option value="">{t("Select a company")}</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.id}>
                                                    {company.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label htmlFor="assessment-score">
                                        {t("Score")} (1 - 100) *
                                        <input
                                            id="assessment-score"
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="1"
                                            placeholder="e.g. 85"
                                            value={score}
                                            onChange={(e) => setScore(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label htmlFor="assessment-decision">
                                        {t("Decision")} *
                                        <select
                                            id="assessment-decision"
                                            value={decision}
                                            onChange={(e) => setDecision(e.target.value)}
                                            required
                                        >
                                            <option value="">{t("Select Decision")}</option>
                                            <option value="BUY">{t("BUY")}</option>
                                            <option value="NO_BUY">{t("NO BUY")}</option>
                                        </select>
                                    </label>

                                    <label style={{ gridColumn: "1 / -1" }} htmlFor="assessment-remarks">
                                        {t("Remarks")} *
                                        <input
                                            id="assessment-remarks"
                                            type="text"
                                            placeholder={t("Analyst notes, financial standing, or factoring risk rationale")}
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={() => {
                                        clearForm();
                                        setIsModalOpen(false);
                                    }}
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={saving || companyOptionsLoading || companies.length === 0}
                                >
                                    {t(saving ? "Saving…" : editingId ? "Update Assessment" : "Save Assessment")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <br />

            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>{t("Company")}</th>
                            <th>{t("Score")}</th>
                            <th>{t("Remarks")}</th>
                            <th>{t("Decision")}</th>
                            <th>{t("Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assessments.map((assessment) => (
                            <tr key={assessment.id}>
                                <td>
                                    <strong>{assessment.company?.companyName || assessment.company?.tradeName || "—"}</strong>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 700 }}>{assessment.score}</span> / 100
                                </td>
                                <td>{assessment.remarks || "—"}</td>
                                <td>
                                    <span className={`status-pill status-pill-${String(assessment.decision || "").toLowerCase().replaceAll("_", "-").replaceAll(" ", "-")}`}>
                                        {t(assessment.decision)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="button button-secondary"
                                        style={{ marginRight: "6px" }}
                                        onClick={() => handleEdit(assessment)}
                                    >
                                        {t("Edit")}
                                    </button>
                                    <button
                                        type="button"
                                        className="button button-secondary action-delete"
                                        disabled={deletingId === assessment.id}
                                        onClick={() => handleDelete(assessment.id)}
                                    >
                                        {deletingId === assessment.id ? t("Deleting…") : t("Delete")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {assessments.length === 0 && (
                            <tr>
                                <td className="table-empty-state" colSpan="5">
                                    {t("No credit assessments found.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CreditAssessmentsPage;