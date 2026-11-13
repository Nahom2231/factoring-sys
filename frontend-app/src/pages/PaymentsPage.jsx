import { useEffect, useMemo, useState } from "react";
import AppIcon from "../components/AppIcon";
import {
    createPayment,
    deletePayment,
    getPaymentCollections,
    sweepOverduePayments,
    updatePayment,
    uploadReceipt
} from "../services/paymentService";
import { getDeals } from "../services/factoringDealService";
import { useLanguage } from "../context/LanguageContext";
import CsvExportButton from "../components/CsvExportButton";

const messageFrom = (error) =>
    error.response?.data?.message || error.message || "Something went wrong. Please try again.";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

function PaymentsPage() {
    const { t } = useLanguage();
    const [payments, setPayments] = useState([]);
    const [deals, setDeals] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [formOpen, setFormOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [status, setStatus] = useState("PENDING");
    const [selectedDeal, setSelectedDeal] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sweeping, setSweeping] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const refreshData = async () => {
        setError("");
        try {
            const [collectionData, dealData] = await Promise.all([
                getPaymentCollections(),
                getDeals()
            ]);
            setPayments(collectionData);
            setDeals(dealData);
        } catch (loadError) {
            setError(messageFrom(loadError));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        Promise.all([getPaymentCollections(), getDeals()])
            .then(([collectionData, dealData]) => {
                if (active) {
                    setPayments(collectionData);
                    setDeals(dealData);
                }
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

    const paymentTotals = useMemo(() => payments.reduce((totals, payment) => {
        const value = Number(payment.amount || 0);
        if (payment.status === "RECEIVED") {
            totals.received += value;
            totals.receivedCount += 1;
        } else if (payment.status === "OVERDUE") {
            totals.overdue += value;
            totals.overdueCount += 1;
        } else {
            totals.pending += value;
            totals.pendingCount += 1;
        }
        return totals;
    }, {
        received: 0,
        overdue: 0,
        pending: 0,
        receivedCount: 0,
        overdueCount: 0,
        pendingCount: 0
    }), [payments]);

    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();
        return payments.filter((payment) => {
            const matchesStatus = statusFilter === "ALL"
                || payment.status === statusFilter;
            const searchable = [
                payment.invoiceNumber,
                payment.shipperName,
                payment.buyerName,
                payment.status
            ].filter(Boolean).join(" ").toLowerCase();
            return matchesStatus && (!query || searchable.includes(query));
        });
    }, [payments, search, statusFilter]);

    const availableDeals = deals;
    const selectedDealDetails = deals.find((deal) => deal.id === selectedDeal);
    const receivedForSelectedDeal = selectedDeal
        ? payments
            .filter((payment) =>
                payment.factoringDealId === selectedDeal
                && payment.status === "RECEIVED"
                && payment.id !== editingId
            )
            .reduce((total, payment) => total + Number(payment.amount || 0), 0)
        : 0;
    const remainingForSelectedDeal = selectedDealDetails
        ? Math.max(0, Number(selectedDealDetails.financedAmount || 0) - receivedForSelectedDeal)
        : 0;

    const clearForm = () => {
        setEditingId(null);
        setAmount("");
        setPaymentDate("");
        setStatus("PENDING");
        setSelectedDeal("");
    };

    const openNewPayment = () => {
        clearForm();
        setError("");
        setNotice("");
        setFormOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");

        const payment = {
            amount: Number(amount),
            paymentDate: status === "RECEIVED" ? paymentDate : null,
            status,
            factoringDeal: { id: selectedDeal }
        };

        try {
            if (editingId) {
                await updatePayment(editingId, payment);
            } else {
                await createPayment(payment);
            }
            clearForm();
            setFormOpen(false);
            setNotice(t(editingId ? "Payment updated." : "Payment recorded."));
            await refreshData();
        } catch (saveError) {
            setError(messageFrom(saveError));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (payment) => {
        setEditingId(payment.id);
        setAmount(String(payment.amount));
        setPaymentDate(payment.receivedDate || "");
        setStatus(payment.status);
        setSelectedDeal(payment.factoringDealId || "");
        setError("");
        setNotice("");
        setFormOpen(true);
    };

    const handleDelete = async (payment) => {
        setError("");
        setNotice("");
        setPayments((prev) => prev.filter((p) => p.id !== payment.id));
        try {
            await deletePayment(payment.id);
            setNotice(t("Payment deleted."));
            await refreshData();
        } catch (deleteError) {
            setError(messageFrom(deleteError));
            await refreshData();
        }
    };

    const handleSweep = async () => {
        setSweeping(true);
        setError("");
        setNotice("");
        try {
            const result = await sweepOverduePayments();
            setNotice(
                result.updatedCount === 1
                    ? t("1 payment was marked overdue.")
                    : t(`${result.updatedCount} payments were marked overdue.`)
            );
            await refreshData();
        } catch (sweepError) {
            setError(messageFrom(sweepError));
        } finally {
            setSweeping(false);
        }
    };

    const handleUpload = async (paymentId, file) => {
        if (!file) {
            setError(t("Choose a receipt file before uploading."));
            return;
        }
        setError("");
        setNotice("");
        try {
            await uploadReceipt(paymentId, file);
            setNotice(t("Receipt uploaded successfully."));
            await refreshData();
        } catch (uploadError) {
            setError(messageFrom(uploadError));
        }
    };

    return (
        <section className="payment-page">
            <header className="payment-heading">
                <div>
                    <span className="payment-eyebrow">{t("FINANCE OPERATIONS")}</span>
                    <h1>{t("Payments & Collections")}</h1>
                    <p>{t("Track invoice collections, record receipts, and review overdue payments.")}</p>
                </div>
                <div className="payment-heading-actions">
                    <CsvExportButton
                        filename="fiep-payments.csv"
                        label={t("Export CSV")}
                        headers={[
                            t("Invoice"),
                            t("Company"),
                            t("Buyer"),
                            t("Amount"),
                            t("Received total"),
                            t("Financed Amount"),
                            t("Remaining balance"),
                            t("Expected date"),
                            t("Received date"),
                            t("Status")
                        ]}
                        rows={filteredPayments.map((payment) => [
                            payment.invoiceNumber,
                            payment.shipperName,
                            payment.buyerName,
                            payment.amount,
                            payment.receivedForDeal,
                            payment.financedAmount,
                            payment.remainingBalance,
                            payment.expectedDate,
                            payment.receivedDate,
                            payment.status
                        ])}
                    />
                    <button
                        className="payment-button payment-button-secondary"
                        type="button"
                        onClick={handleSweep}
                        disabled={sweeping}
                    >
                        <AppIcon name="chart" />
                        {t(sweeping ? "Sweeping…" : "Sweep overdue")}
                    </button>
                    <button
                        className="payment-button"
                        type="button"
                        onClick={openNewPayment}
                    >
                        <span aria-hidden="true">＋</span>
                        {t("Record payment")}
                    </button>
                </div>
            </header>

            {error && <div className="payment-alert payment-alert-error" role="alert">{t(error)}</div>}
            {notice && <div className="payment-alert payment-alert-success" role="status">{t(notice)}</div>}

            <div className="payment-summary-grid">
                <article className="payment-summary-card payment-summary-received">
                    <span className="payment-summary-label">{t("Received")}</span>
                    <strong>{formatAmount(paymentTotals.received)}</strong>
                    <small>{paymentTotals.receivedCount} {t("payments collected")}</small>
                </article>
                <article className="payment-summary-card payment-summary-pending">
                    <span className="payment-summary-label">{t("Pending")}</span>
                    <strong>{formatAmount(paymentTotals.pending)}</strong>
                    <small>{paymentTotals.pendingCount} {t("awaiting collection")}</small>
                </article>
                <article className="payment-summary-card payment-summary-overdue">
                    <span className="payment-summary-label">{t("Overdue")}</span>
                    <strong>{formatAmount(paymentTotals.overdue)}</strong>
                    <small>{paymentTotals.overdueCount} {t("need follow-up")}</small>
                </article>
            </div>

            {formOpen && (
                <div className="modal-backdrop" onClick={() => { clearForm(); setFormOpen(false); }}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{t(editingId ? "Update payment" : "Record a payment")}</h3>
                                <p>{t("Record partial collections against a deal; received totals cannot exceed its financed amount.")}</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                type="button"
                                onClick={() => {
                                    clearForm();
                                    setFormOpen(false);
                                }}
                                aria-label={t("Close payment form")}
                            >×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="payment-form-grid">
                        <label>
                            {t("Factoring deal")}
                            <select
                                value={selectedDeal}
                                onChange={(event) => setSelectedDeal(event.target.value)}
                                required
                            >
                                <option value="">{t("Select a deal")}</option>
                                {availableDeals.map((deal) => (
                                    <option key={deal.id} value={deal.id}>
                                        {deal.invoice?.invoiceNumber || `Deal ${deal.id.slice(0, 8)}`}
                                        {" · "}
                                        {formatAmount(deal.invoiceAmount)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            {t("Amount")}
                            <input
                                type="number"
                                min="0.01"
                                max={status === "RECEIVED" ? remainingForSelectedDeal : undefined}
                                step="0.01"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                placeholder="0.00"
                                required
                            />
                            {status === "RECEIVED" && selectedDealDetails && (
                                <small className="payment-balance-hint">
                                    {t("Available to receive")}: {formatAmount(remainingForSelectedDeal)}
                                </small>
                            )}
                        </label>
                        <label>
                            {t("Status")}
                            <select value={status} onChange={(event) => setStatus(event.target.value)}>
                                <option value="PENDING">{t("Pending")}</option>
                                <option value="RECEIVED">{t("Received")}</option>
                                {editingId && status === "OVERDUE" && (
                                    <option value="OVERDUE">{t("Overdue (system marked)")}</option>
                                )}
                            </select>
                        </label>
                        {status === "RECEIVED" && (
                            <label>
                                {t("Received date")}
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(event) => setPaymentDate(event.target.value)}
                                    required
                                />
                            </label>
                        )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="button button-secondary" type="button" onClick={() => {
                                    clearForm();
                                    setFormOpen(false);
                                }}>{t("Cancel")}</button>
                                <button className="button button-primary" type="submit" disabled={saving || !availableDeals.length && !editingId}>
                                    {t(saving ? "Saving…" : editingId ? "Save changes" : "Save payment")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <section className="payment-table-card" aria-label={t("Payments and collections")}>
                <div className="payment-table-toolbar">
                    <div>
                        <h2>{t("Collection activity")}</h2>
                        <p>{t("Invoice due dates and collection status for your factoring deals.")}</p>
                    </div>
                    <div className="payment-filters">
                        <label className="payment-search">
                            <span className="payment-visually-hidden">{t("Search payments")}</span>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t("Search invoice, shipper, buyer…")}
                            />
                        </label>
                        <label>
                            <span className="payment-visually-hidden">{t("Filter by status")}</span>
                            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                <option value="ALL">{t("All statuses")}</option>
                                <option value="PENDING">{t("Pending")}</option>
                                <option value="OVERDUE">{t("Overdue")}</option>
                                <option value="RECEIVED">{t("Received")}</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div className="payment-table-scroll">
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>{t("Invoice")}</th>
                                <th>{t("Shipper / buyer")}</th>
                                <th>{t("Amount")}</th>
                                <th>{t("Received / financed")}</th>
                                <th>{t("Balance")}</th>
                                <th>{t("Expected")}</th>
                                <th>{t("Received")}</th>
                                <th>{t("Days late")}</th>
                                <th>{t("Status")}</th>
                                <th>{t("Actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="payment-table-message">{t("Loading collection activity…")}</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="payment-table-message">
                                        {payments.length
                                            ? t("No payments match your search or status filter.")
                                            : t("No payment records yet. Record a payment to start tracking collections.")}
                                    </td>
                                </tr>
                            ) : filteredPayments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <strong className="payment-invoice-number">{payment.invoiceNumber || t("Invoice unavailable")}</strong>
                                        <small>{payment.factoringDealId ? `${t("Deal")} ${payment.factoringDealId.slice(0, 8)}` : t("No linked deal")}</small>
                                    </td>
                                    <td>
                                        <strong>{payment.shipperName || "—"}</strong>
                                        <small>{t("Buyer")}: {payment.buyerName || "—"}</small>
                                    </td>
                                    <td className="payment-amount">{formatAmount(payment.amount)}</td>
                                    <td>{formatAmount(payment.receivedForDeal)} / {formatAmount(payment.financedAmount)}</td>
                                    <td className="payment-amount">{formatAmount(payment.remainingBalance)}</td>
                                    <td>{formatDate(payment.expectedDate)}</td>
                                    <td>{formatDate(payment.receivedDate)}</td>
                                    <td className={payment.daysLate > 0 ? "payment-late-days" : ""}>
                                        {payment.daysLate > 0 ? `${payment.daysLate} ${t("days")}` : "—"}
                                    </td>
                                    <td>
                                        <span className={`payment-status payment-status-${String(payment.status || "pending").toLowerCase()}`}>
                                            {t(payment.status === "OVERDUE" ? "LATE" : payment.status || "PENDING")}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="payment-row-actions">
                                            <button type="button" onClick={() => handleEdit(payment)}>{t("Edit")}</button>
                                            <button type="button" onClick={() => handleDelete(payment)}>{t("Delete")}</button>
                                            <label className="payment-upload-label">
                                                {t(payment.receiptUploaded ? "Replace receipt" : "Receipt")}
                                                <input
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        event.target.value = "";
                                                        if (file) void handleUpload(payment.id, file);
                                                    }}
                                                />
                                            </label>
                                        </div>
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

export default PaymentsPage;
