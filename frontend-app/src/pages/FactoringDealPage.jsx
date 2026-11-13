import { useEffect, useState } from "react";
import { getInvoices } from "../services/invoiceService";
import {
    getDeals,
    createDeal,
    updateDeal,
    deleteDeal
} from "../services/factoringDealService";
import {
    getPricingRules,
    createPricingRule
} from "../services/pricingRuleService";
import ModuleIntro from "../components/ModuleIntro";
import CsvExportButton from "../components/CsvExportButton";
import { useLanguage } from "../context/LanguageContext";

const money = (value) => Number(value || 0).toFixed(2);
const apiErrorMessage = (error, fallback) =>
    error.response?.data?.detail
    || error.response?.data?.message
    || fallback;

const percentageAmount = (amount, rate) => {
    const numericRate = Number(rate);
    if (!amount || !Number.isFinite(numericRate) || numericRate <= 0) return "";
    return (Math.round((amount * numericRate / 100 + Number.EPSILON) * 100) / 100).toFixed(2);
};

const getRuleAdvanceRate = (rule) =>
    rule?.advanceRatePercent ?? rule?.defaultAdvanceRatePercent ?? 90;

const getRuleFeeRate = (rule) =>
    rule?.feeRatePercent ?? rule?.defaultFeeRatePercent ?? 3;

function FactoringDealsPage() {
    const { t } = useLanguage();

    const [deals, setDeals] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [pricingRules, setPricingRules] = useState([]);

    const [selectedInvoice, setSelectedInvoice] = useState("");
    const [selectedPricingRuleId, setSelectedPricingRuleId] = useState("");
    const [advanceRatePercent, setAdvanceRatePercent] = useState("");
    const [feeRatePercent, setFeeRatePercent] = useState("");
    const [status, setStatus] = useState("PENDING");

    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);

    // Modal state for viewing a deal in detail
    const [viewingDeal, setViewingDeal] = useState(null);

    // Modal state for creating / configuring a pricing rule
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [newRuleName, setNewRuleName] = useState("");
    const [newRuleDescription, setNewRuleDescription] = useState("");
    const [newRuleAdvanceRate, setNewRuleAdvanceRate] = useState("90");
    const [newRuleFeeRate, setNewRuleFeeRate] = useState("3");
    const [newRuleIsDefault, setNewRuleIsDefault] = useState(false);
    const [savingNewRule, setSavingNewRule] = useState(false);

    const selectedInvoiceDetails = invoices.find(
        (invoice) => invoice.id === selectedInvoice
    );
    const invoiceAmount = Number(selectedInvoiceDetails?.amount || 0);
    const financedAmount = percentageAmount(invoiceAmount, advanceRatePercent);
    const fee = percentageAmount(invoiceAmount, feeRatePercent);
    const netDisbursement = (
        Number(financedAmount || 0) - Number(fee || 0)
    ).toFixed(2);

    useEffect(() => {
        let ignore = false;
        Promise.all([getDeals(), getInvoices(), getPricingRules()])
            .then(([dealData, invoiceData, rulesData]) => {
                if (ignore) return;
                setDeals(dealData || []);
                setInvoices(invoiceData || []);
                const rules = rulesData || [];
                setPricingRules(rules);
                if (rules.length > 0) {
                    const defRule = rules.find((r) => r.isDefault) || rules[0];
                    if (defRule) {
                        setSelectedPricingRuleId(defRule.id);
                        setAdvanceRatePercent(String(getRuleAdvanceRate(defRule)));
                        setFeeRatePercent(String(getRuleFeeRate(defRule)));
                    }
                }
            })
            .catch(() => {
                if (!ignore) {
                    setErrorMessage(t("Could not load factoring data."));
                }
            });
        return () => {
            ignore = true;
        };
    }, [t]);

    const applyPricingRule = (ruleId) => {
        setSelectedPricingRuleId(ruleId);
        if (ruleId === "CUSTOM" || !ruleId) {
            return;
        }
        const rule = pricingRules.find((r) => r.id === ruleId);
        if (rule) {
            setAdvanceRatePercent(String(getRuleAdvanceRate(rule)));
            setFeeRatePercent(String(getRuleFeeRate(rule)));
        }
    };

    const handleInvoiceChange = (invoiceId) => {
        setSelectedInvoice(invoiceId);
        if ((!selectedPricingRuleId || selectedPricingRuleId === "CUSTOM") && pricingRules.length > 0 && !advanceRatePercent) {
            const defRule = pricingRules.find((r) => r.isDefault) || pricingRules[0];
            if (defRule) {
                setSelectedPricingRuleId(defRule.id);
                setAdvanceRatePercent(String(getRuleAdvanceRate(defRule)));
                setFeeRatePercent(String(getRuleFeeRate(defRule)));
            }
        }
    };

    const handleAdvanceRateChange = (value) => {
        setAdvanceRatePercent(value);
        if (selectedPricingRuleId && selectedPricingRuleId !== "CUSTOM") {
            const currentRule = pricingRules.find((r) => r.id === selectedPricingRuleId);
            if (currentRule && Number(value) !== Number(getRuleAdvanceRate(currentRule))) {
                setSelectedPricingRuleId("CUSTOM");
            }
        }
    };

    const handleFeeRateChange = (value) => {
        setFeeRatePercent(value);
        if (selectedPricingRuleId && selectedPricingRuleId !== "CUSTOM") {
            const currentRule = pricingRules.find((r) => r.id === selectedPricingRuleId);
            if (currentRule && Number(value) !== Number(getRuleFeeRate(currentRule))) {
                setSelectedPricingRuleId("CUSTOM");
            }
        }
    };

    const handleCreateCustomRule = async (e) => {
        e.preventDefault();
        if (!newRuleName.trim()) {
            setErrorMessage(t("Rule Name is required"));
            return;
        }
        try {
            setSavingNewRule(true);
            setErrorMessage("");
            const created = await createPricingRule({
                name: newRuleName.trim(),
                description: newRuleDescription.trim(),
                advanceRatePercent: Number(newRuleAdvanceRate),
                feeRatePercent: Number(newRuleFeeRate),
                isDefault: newRuleIsDefault
            });
            const rules = await getPricingRules();
            setPricingRules(rules || []);
            setSelectedPricingRuleId(created.id);
            setAdvanceRatePercent(String(getRuleAdvanceRate(created)));
            setFeeRatePercent(String(getRuleFeeRate(created)));
            setShowRuleModal(false);
            setNewRuleName("");
            setNewRuleDescription("");
            setSuccessMessage(t("Pricing rule created successfully."));
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error, t("Could not save the pricing rule.")));
        } finally {
            setSavingNewRule(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedInvoice) {
            setErrorMessage(t("Select an invoice for this factoring deal."));
            return;
        }
        if (!advanceRatePercent || !feeRatePercent) {
            setErrorMessage(t("Enter both the advance rate and the fee rate."));
            return;
        }

        const isCustom = !selectedPricingRuleId || selectedPricingRuleId === "CUSTOM";
        const selectedRule = !isCustom ? pricingRules.find((r) => r.id === selectedPricingRuleId) : null;

        const deal = {
            advanceRatePercent: Number(advanceRatePercent),
            feeRatePercent: Number(feeRatePercent),
            status,
            invoice: {
                id: selectedInvoice
            },
            ...(selectedRule
                ? {
                    pricingRule: { id: selectedRule.id },
                    pricingRuleName: selectedRule.name
                }
                : {
                    pricingRule: null,
                    pricingRuleName: null
                })
        };

        try {
            setSaving(true);
            setErrorMessage("");
            if (editingId) {
                await updateDeal(editingId, deal);
            } else {
                await createDeal(deal);
            }
            clearForm();
            setShowDealModal(false);
            const refreshedDeals = await getDeals();
            setDeals(refreshedDeals);
            setSuccessMessage(t("Factoring deal saved successfully."));
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            setErrorMessage(
                apiErrorMessage(error, t("Could not save the factoring deal."))
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (deal) => {
        setEditingId(deal.id);
        const invoiceValue = Number(deal.invoiceAmount || 0);
        setAdvanceRatePercent(
            String(
                deal.advanceRatePercent
                ?? (invoiceValue ? ((Number(deal.financedAmount) / invoiceValue) * 100).toFixed(8) : "")
            )
        );
        setFeeRatePercent(
            String(
                deal.feeRatePercent
                ?? (invoiceValue ? ((Number(deal.fee) / invoiceValue) * 100).toFixed(8) : "")
            )
        );
        setStatus(deal.status);
        setSelectedInvoice(deal.invoice?.id || "");
        setSelectedPricingRuleId(deal.pricingRule?.id || "CUSTOM");
        setErrorMessage("");
        setShowDealModal(true);
    };

    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            setErrorMessage("");
            setDeals((prev) => prev.filter((d) => d.id !== id));
            await deleteDeal(id);
            if (editingId === id) {
                clearForm();
            }
            if (viewingDeal?.id === id) {
                setViewingDeal(null);
            }
            setSuccessMessage(t("Factoring deal deleted successfully."));
            setTimeout(() => setSuccessMessage(""), 4000);
            const refreshedDeals = await getDeals();
            setDeals(refreshedDeals);
        } catch (error) {
            const refreshedDeals = await getDeals();
            setDeals(refreshedDeals);
            setErrorMessage(
                apiErrorMessage(error, t("Could not delete the factoring deal."))
            );
        } finally {
            setDeletingId(null);
        }
    };

    const clearForm = () => {
        setEditingId(null);
        setSelectedInvoice("");
        const defRule = pricingRules.find((r) => r.isDefault) || pricingRules[0];
        if (defRule) {
            setSelectedPricingRuleId(defRule.id);
            setAdvanceRatePercent(String(getRuleAdvanceRate(defRule)));
            setFeeRatePercent(String(getRuleFeeRate(defRule)));
        } else {
            setSelectedPricingRuleId("");
            setAdvanceRatePercent("");
            setFeeRatePercent("");
        }
        setStatus("PENDING");
        setErrorMessage("");
        setShowDealModal(false);
    };

    return (
        <div>
            <ModuleIntro
                eyebrow="FINANCING WORKFLOW"
                title="Factoring Deals"
                description="Link an invoice to a financing decision based on configured pricing rules or custom manual rates. Calculates financed amount, fee, and estimated net disbursement."
            />

            <div className="module-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="button button-primary"
                        onClick={() => {
                            clearForm();
                            setShowDealModal(true);
                        }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                        <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span>
                        <span>{t("New Factoring Deal")}</span>
                    </button>

                    <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => setShowRuleModal(true)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                        <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span>
                        <span>{t("Create New Pricing Rule")}</span>
                    </button>
                </div>

                <CsvExportButton
                    filename="fiep-factoring-deals.csv"
                    label={t("Export CSV")}
                    headers={[
                        t("Invoice"),
                        t("Pricing Rule"),
                        t("Invoice Amount"),
                        t("Advance rate (%)"),
                        t("Financed Amount"),
                        t("Fee rate (%)"),
                        t("Fee"),
                        t("Net Disbursement"),
                        t("Status")
                    ]}
                    rows={deals.map((deal) => [
                        deal.invoice?.invoiceNumber,
                        deal.pricingRuleName || deal.pricingRule?.name || t("Custom / Manual"),
                        deal.invoiceAmount,
                        deal.advanceRatePercent,
                        deal.financedAmount,
                        deal.feeRatePercent,
                        deal.fee,
                        deal.netDisbursement,
                        deal.status
                    ])}
                />
            </div>

            {errorMessage && (
                <div className="module-state module-state-error" role="alert">
                    {t(errorMessage)}
                </div>
            )}

            {successMessage && (
                <div className="payment-alert payment-alert-success" role="status">
                    {t(successMessage)}
                </div>
            )}

            {/* DEAL FORM DIALOG MODAL */}
            {showDealModal && (
                <div className="modal-backdrop" onClick={() => setShowDealModal(false)}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{editingId ? t("Update Deal") : t("New Factoring Deal")}</h3>
                                <p>{t("Link an invoice to a financing decision based on configured pricing rules or custom manual rates.")}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowDealModal(false)}
                                aria-label={t("Close")}
                            >×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="deal-form-grid" style={{ margin: 0, padding: 0, border: "none", boxShadow: "none" }}>
                                    <label>
                                        {t("Invoice")} *
                                        <select
                                            value={selectedInvoice}
                                            onChange={(event) => handleInvoiceChange(event.target.value)}
                                            required
                                        >
                                            <option value="">{t("Select Invoice")}</option>
                                            {invoices.map((invoice) => (
                                                <option key={invoice.id} value={invoice.id}>
                                                    {invoice.invoiceNumber} {invoice.carrierName ? `(${invoice.carrierName})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        {t("Invoice Amount")}
                                        <input value={selectedInvoiceDetails ? money(invoiceAmount) : ""} readOnly />
                                    </label>

                                    <label>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span>{t("Pricing Rule")}</span>
                                            {selectedPricingRuleId === "CUSTOM" ? (
                                                <span style={{ fontSize: "11px", color: "var(--accent, #38bdf8)", fontWeight: 700 }}>
                                                    ✏️ {t("Custom / Manual")}
                                                </span>
                                            ) : selectedPricingRuleId ? (
                                                <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 700 }}>
                                                    ✓ {t("Preset Rule")}
                                                </span>
                                            ) : null}
                                        </div>
                                        <select
                                            value={selectedPricingRuleId}
                                            onChange={(event) => applyPricingRule(event.target.value)}
                                        >
                                            {pricingRules.map((rule) => (
                                                <option key={rule.id} value={rule.id}>
                                                    {rule.name} ({getRuleAdvanceRate(rule)}% adv / {getRuleFeeRate(rule)}% fee){rule.isDefault ? ` [${t("Default Pricing Rule")}]` : ""}
                                                </option>
                                            ))}
                                            <option value="CUSTOM">
                                                -- {t("Custom / Manual (Make your own)")} --
                                            </option>
                                        </select>
                                    </label>

                                    <label>
                                        {t("Advance rate (%)")} *
                                        <input
                                            type="number"
                                            min="0.01"
                                            max="100"
                                            step="0.00000001"
                                            value={advanceRatePercent}
                                            onChange={(event) => handleAdvanceRateChange(event.target.value)}
                                            required
                                        />
                                    </label>

                                    <label>
                                        {t("Fee rate (%)")} *
                                        <input
                                            type="number"
                                            min="0.01"
                                            max={advanceRatePercent || "100"}
                                            step="0.00000001"
                                            value={feeRatePercent}
                                            onChange={(event) => handleFeeRateChange(event.target.value)}
                                            required
                                        />
                                    </label>

                                    <label>
                                        {t("Financed Amount")}
                                        <input value={financedAmount} readOnly />
                                    </label>

                                    <label>
                                        {t("Fee")}
                                        <input value={fee} readOnly />
                                    </label>

                                    <label>
                                        {t("Estimated net disbursement")}
                                        <input value={financedAmount && fee ? netDisbursement : ""} readOnly />
                                    </label>

                                    <label>
                                        {t("Status")}
                                        <select
                                            value={status}
                                            onChange={(event) => setStatus(event.target.value)}
                                        >
                                            <option value="PENDING">{t("PENDING")}</option>
                                            <option value="APPROVED">{t("APPROVED")}</option>
                                            <option value="DISBURSED">{t("DISBURSED")}</option>
                                            <option value="CLOSED">{t("CLOSED")}</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={() => {
                                        clearForm();
                                        setShowDealModal(false);
                                    }}
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={saving || !invoices.length}
                                >
                                    {t(saving ? "Saving…" : editingId ? "Update Deal" : "Save Deal")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <br />

            {/* DEALS TABLE */}
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>{t("Invoice")}</th>
                            <th>{t("Pricing Rule")}</th>
                            <th>{t("Invoice Amount")}</th>
                            <th>{t("Financed Amount")}</th>
                            <th>{t("Fee")}</th>
                            <th>{t("Net Disbursement")}</th>
                            <th>{t("Status")}</th>
                            <th>{t("Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map((deal) => (
                            <tr
                                key={deal.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => setViewingDeal(deal)}
                            >
                                <td>
                                    <strong style={{ color: "var(--accent, #38bdf8)" }}>
                                        {deal.invoice?.invoiceNumber || "—"}
                                    </strong>
                                </td>
                                <td>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "3px 10px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: 650,
                                            backgroundColor: (deal.pricingRuleName || deal.pricingRule?.name)
                                                ? "rgba(56, 189, 248, 0.15)"
                                                : "rgba(148, 163, 184, 0.15)",
                                            color: (deal.pricingRuleName || deal.pricingRule?.name)
                                                ? "var(--accent, #38bdf8)"
                                                : "var(--text-secondary, #94a3b8)"
                                        }}
                                    >
                                        {deal.pricingRuleName || deal.pricingRule?.name || t("Custom / Manual")}
                                    </span>
                                </td>
                                <td>{money(deal.invoiceAmount)}</td>
                                <td>{money(deal.financedAmount)}</td>
                                <td>{money(deal.fee)}</td>
                                <td>
                                    <span style={{ fontWeight: 700, color: "var(--accent, #38bdf8)" }}>
                                        {money(deal.netDisbursement)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-pill status-pill-${String(deal.status || "").toLowerCase().replaceAll("_", "-")}`}>
                                        {t(deal.status)}
                                    </span>
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        style={{ marginRight: "6px" }}
                                        onClick={() => setViewingDeal(deal)}
                                    >
                                        {t("View")}
                                    </button>
                                    <button
                                        type="button"
                                        className="button button-secondary"
                                        style={{ marginRight: "6px" }}
                                        onClick={() => handleEdit(deal)}
                                    >
                                        {t("Edit")}
                                    </button>
                                    <button
                                        type="button"
                                        className="button button-secondary action-delete"
                                        disabled={deletingId === deal.id}
                                        onClick={() => handleDelete(deal.id)}
                                    >
                                        {deletingId === deal.id ? t("Deleting...") : t("Delete")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {deals.length === 0 && (
                            <tr>
                                <td className="table-empty-state" colSpan="8">
                                    {t("No factoring deals found.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================================
                MODAL 1: DEAL DETAILS MODAL (CLEAR USER EXPERIENCE)
               ========================================================= */}
            {viewingDeal && (
                <div
                    className="modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setViewingDeal(null)}
                >
                    <div
                        className="modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <h3>{t("Factoring Deal Details")}</h3>
                                <p>{t("Invoice")}: #{viewingDeal.invoice?.invoiceNumber || "—"}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setViewingDeal(null)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Key Financial Metrics */}
                            <div className="deal-metric-grid">
                                <div className="deal-metric-card">
                                    <div className="deal-metric-label">{t("Invoice Amount")}</div>
                                    <div className="deal-metric-value">{money(viewingDeal.invoiceAmount)} ETB</div>
                                </div>
                                <div className="deal-metric-card">
                                    <div className="deal-metric-label">
                                        {t("Financed Amount")} ({viewingDeal.advanceRatePercent || 0}%)
                                    </div>
                                    <div className="deal-metric-value">{money(viewingDeal.financedAmount)} ETB</div>
                                </div>
                                <div className="deal-metric-card">
                                    <div className="deal-metric-label">
                                        {t("Fee")} ({viewingDeal.feeRatePercent || 0}%)
                                    </div>
                                    <div className="deal-metric-value">{money(viewingDeal.fee)} ETB</div>
                                </div>
                                <div className="deal-metric-card deal-metric-highlight">
                                    <div className="deal-metric-label">{t("Estimated Net Disbursement")}</div>
                                    <div className="deal-metric-value">{money(viewingDeal.netDisbursement)} ETB</div>
                                </div>
                            </div>

                            {/* Applied Pricing Rule Card */}
                            <div style={{
                                padding: "16px",
                                borderRadius: "14px",
                                background: "var(--surface-soft)",
                                border: "1px solid var(--border)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                                        {t("Pricing Rule")}
                                    </span>
                                    <span style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        padding: "3px 10px",
                                        borderRadius: "10px",
                                        background: "rgba(56, 189, 248, 0.15)",
                                        color: "var(--accent, #38bdf8)"
                                    }}>
                                        {viewingDeal.pricingRuleName || viewingDeal.pricingRule?.name || t("Custom / Manual")}
                                    </span>
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                    {viewingDeal.pricingRule?.description || t("Custom user-defined financing rates applied for this deal.")}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: "12px",
                                padding: "14px 16px",
                                borderRadius: "14px",
                                background: "var(--surface-soft)",
                                border: "1px solid var(--border)",
                                fontSize: "13px"
                            }}>
                                <div>
                                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: 700 }}>
                                        {t("Carrier")}
                                    </span>
                                    <span style={{ fontWeight: 650 }}>
                                        {viewingDeal.invoice?.carrierName || viewingDeal.invoice?.company?.companyName || "—"}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: 700 }}>
                                        {t("Shipper")}
                                    </span>
                                    <span style={{ fontWeight: 650 }}>
                                        {viewingDeal.invoice?.shipperName || viewingDeal.invoice?.buyerName || "—"}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: 700 }}>
                                        {t("Status")}
                                    </span>
                                    <span className={`status-pill status-pill-${String(viewingDeal.status || "").toLowerCase().replaceAll("_", "-")}`} style={{ display: "inline-block", marginTop: "4px" }}>
                                        {t(viewingDeal.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => setViewingDeal(null)}
                            >
                                {t("Close")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const dealToEdit = viewingDeal;
                                    setViewingDeal(null);
                                    handleEdit(dealToEdit);
                                }}
                            >
                                {t("Edit Deal")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 2: CONFIGURE / CREATE PRICING RULE MODAL
               ========================================================= */}
            {showRuleModal && (
                <div
                    className="modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setShowRuleModal(false)}
                >
                    <div
                        className="modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleCreateCustomRule}>
                            <div className="modal-header">
                                <div>
                                    <h3>{t("Configure Pricing Rule")}</h3>
                                    <p>{t("Define default rates or make your own custom factoring rule.")}</p>
                                </div>
                                <button
                                    type="button"
                                    className="modal-close-btn"
                                    onClick={() => setShowRuleModal(false)}
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <label style={{ display: "grid", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                                    {t("Rule Name")} *
                                    <input
                                        type="text"
                                        value={newRuleName}
                                        onChange={(e) => setNewRuleName(e.target.value)}
                                        placeholder="e.g. Express Carrier 92/2.5"
                                        required
                                    />
                                </label>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                    <label style={{ display: "grid", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                                        {t("Default Advance Rate (%)")} *
                                        <input
                                            type="number"
                                            min="0.01"
                                            max="100"
                                            step="0.01"
                                            value={newRuleAdvanceRate}
                                            onChange={(e) => setNewRuleAdvanceRate(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label style={{ display: "grid", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                                        {t("Default Fee Rate (%)")} *
                                        <input
                                            type="number"
                                            min="0.01"
                                            max="100"
                                            step="0.01"
                                            value={newRuleFeeRate}
                                            onChange={(e) => setNewRuleFeeRate(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>

                                <label style={{ display: "grid", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                                    {t("Remarks")}
                                    <input
                                        type="text"
                                        value={newRuleDescription}
                                        onChange={(e) => setNewRuleDescription(e.target.value)}
                                        placeholder="Eligibility criteria, terms, or volume notes"
                                    />
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={newRuleIsDefault}
                                        onChange={(e) => setNewRuleIsDefault(e.target.checked)}
                                    />
                                    {t("Set as Default")}
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={() => setShowRuleModal(false)}
                                >
                                    {t("Cancel")}
                                </button>
                                <button type="submit" disabled={savingNewRule}>
                                    {t(savingNewRule ? "Saving…" : "Save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FactoringDealsPage;