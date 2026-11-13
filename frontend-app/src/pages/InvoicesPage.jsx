import { useEffect, useState, useMemo } from "react";
import {
    getInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    uploadInvoice,
    verifyInvoice
} from "../services/invoiceService";
import { getCompanyOptions } from "../services/companyService";
import ModuleIntro from "../components/ModuleIntro";
import CsvExportButton from "../components/CsvExportButton";
import { useLanguage } from "../context/LanguageContext";

function InvoicesPage() {
    const { t } = useLanguage();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [companies, setCompanies] = useState([]);
    const [companyOptionsLoading, setCompanyOptionsLoading] = useState(true);
    const [companyOptionsError, setCompanyOptionsError] = useState("");

    // Form fields
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [selectedCarrier, setSelectedCarrier] = useState("");
    const [selectedShipper, setSelectedShipper] = useState("");
    const [shipperName, setShipperName] = useState("");
    const [amount, setAmount] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);

    const loadInvoices = async () => {
        try {
            const data = await getInvoices();
            setInvoices(data || []);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Could not load invoices.")
            });
        }
    };

    useEffect(() => {
        let ignore = false;

        getInvoices()
            .then((data) => {
                if (!ignore) setInvoices(data || []);
            })
            .catch((error) => {
                if (!ignore) {
                    console.error(error);
                    setFeedback({
                        type: "error",
                        message: error.response?.data?.message || t("Could not load invoices.")
                    });
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        getCompanyOptions()
            .then((data) => {
                if (!ignore) setCompanies(data || []);
            })
            .catch((error) => {
                if (!ignore) {
                    console.error(error);
                    setCompanyOptionsError(
                        error.response?.data?.message || "Company options could not be loaded."
                    );
                }
            })
            .finally(() => {
                if (!ignore) setCompanyOptionsLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [t]);

    const clearForm = () => {
        setEditingId(null);
        setInvoiceNumber("");
        setSelectedCarrier("");
        setSelectedShipper("");
        setShipperName("");
        setAmount("");
        setIssueDate("");
        setDueDate("");
        setSelectedFile(null);
        setFeedback(null);
    };

    const handleEdit = (invoice) => {
        setEditingId(invoice.id);
        setInvoiceNumber(invoice.invoiceNumber || "");
        setSelectedCarrier(invoice.carrier?.id || invoice.company?.id || "");
        setSelectedShipper(invoice.shipper?.id || "");
        setShipperName(invoice.shipperName || invoice.buyerName || "");
        setAmount(invoice.amount !== undefined && invoice.amount !== null ? String(invoice.amount) : "");
        setIssueDate(invoice.issueDate || invoice.dueDate || "");
        setDueDate(invoice.dueDate || "");
        setFeedback(null);
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!invoiceNumber.trim()) {
            setFeedback({
                type: "error",
                message: t("Invoice number is required")
            });
            return;
        }

        if (!selectedCarrier) {
            setFeedback({
                type: "error",
                message: t("Carrier is required")
            });
            return;
        }

        if (!selectedShipper && !shipperName.trim()) {
            setFeedback({
                type: "error",
                message: t("Shipper is required")
            });
            return;
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setFeedback({
                type: "error",
                message: t("Amount must be positive")
            });
            return;
        }

        if (!issueDate) {
            setFeedback({
                type: "error",
                message: t("Issue date is required")
            });
            return;
        }

        if (!dueDate) {
            setFeedback({
                type: "error",
                message: t("Due date is required")
            });
            return;
        }

        const selectedCarrierObj = companies.find((c) => c.id === selectedCarrier);
        const carrierCompanyName = selectedCarrierObj?.displayName || selectedCarrierObj?.companyName || "";

        const selectedShipperObj = companies.find((c) => c.id === selectedShipper);
        const shipperCompanyName = selectedShipperObj?.displayName || selectedShipperObj?.companyName || shipperName.trim();

        const payload = {
            invoiceNumber: invoiceNumber.trim(),
            carrier: { id: selectedCarrier },
            carrierName: carrierCompanyName,
            company: { id: selectedCarrier },
            shipper: selectedShipper ? { id: selectedShipper } : null,
            shipperName: shipperCompanyName,
            buyerName: shipperCompanyName,
            amount: Number(amount),
            issueDate,
            dueDate
        };

        setSubmitting(true);
        setFeedback(null);

        try {
            if (editingId) {
                await updateInvoice(editingId, payload);
                setFeedback({
                    type: "success",
                    message: t("Invoice updated successfully.")
                });
            } else {
                await createInvoice(payload);
                setFeedback({
                    type: "success",
                    message: t("Invoice registered successfully.")
                });
            }
            clearForm();
            setIsFormModalOpen(false);
            await loadInvoices();
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Failed to save invoice.")
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setInvoices((prev) => prev.filter((inv) => inv.id !== id));
            await deleteInvoice(id);
            setFeedback({
                type: "success",
                message: t("Invoice deleted successfully.")
            });
            if (editingId === id) {
                clearForm();
            }
            await loadInvoices();
        } catch (error) {
            console.error(error);
            await loadInvoices();
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Could not delete invoice.")
            });
        }
    };

    const handleVerify = async (id) => {
        try {
            await verifyInvoice(id);
            await loadInvoices();
            setFeedback({
                type: "success",
                message: t("Invoice verification completed.")
            });
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Invoice verification failed.")
            });
        }
    };

    const handleUpload = async (invoiceId) => {
        if (!selectedFile) {
            setFeedback({
                type: "error",
                message: t("Please select a file first.")
            });
            return;
        }
        setUploadingId(invoiceId);
        try {
            await uploadInvoice(invoiceId, selectedFile);
            setFeedback({
                type: "success",
                message: t("Invoice uploaded successfully.")
            });
            setSelectedFile(null);
            await loadInvoices();
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: t("Upload failed.")
            });
        } finally {
            setUploadingId(null);
        }
    };

    const filteredInvoices = useMemo(() => {
        if (!searchQuery.trim()) return invoices;
        const q = searchQuery.toLowerCase();
        return invoices.filter((inv) => {
            const num = (inv.invoiceNumber || "").toLowerCase();
            const carrier = (inv.carrierName || inv.carrier?.tradeName || inv.carrier?.companyName || inv.company?.companyName || "").toLowerCase();
            const shipper = (inv.shipperName || inv.buyerName || "").toLowerCase();
            const status = (inv.status || "").toLowerCase();
            const vStatus = (inv.verificationStatus || "").toLowerCase();
            return (
                num.includes(q) ||
                carrier.includes(q) ||
                shipper.includes(q) ||
                status.includes(q) ||
                vStatus.includes(q)
            );
        });
    }, [invoices, searchQuery]);

    return (
        <div>
            <ModuleIntro
                eyebrow="DOCUMENT INTAKE"
                title="Invoices"
                description="Register invoices with their carrier, shipper, amount, issue date, and due date. Upload supporting documents and run the configured invoice verification before moving work into factoring."
            />

            {feedback && (
                <div
                    className="attention-banner"
                    style={{
                        marginBottom: "18px",
                        borderColor: feedback.type === "error" ? "#dc5367" : "#16845f",
                        color: feedback.type === "error" ? "#dc5367" : "#16845f"
                    }}
                    role="alert"
                >
                    <p>{feedback.message}</p>
                </div>
            )}

            {/* Invoice Registration / Edit Dialog Modal */}
            {isFormModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{editingId ? t("Update Invoice") : t("Register Invoice")}</h3>
                                <p>{t("Enter freight invoice details with required carrier, shipper, issue date, and due date.")}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsFormModalOpen(false)}
                                aria-label={t("Close")}
                            >×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="company-form-grid">
                                    {/* Invoice Number */}
                                    <label htmlFor="invoice-number">
                                        <span>
                                            {t("Invoice Number")} <strong aria-hidden="true">*</strong>
                                        </span>
                                        <input
                                            id="invoice-number"
                                            placeholder="e.g. INV-2026-0042"
                                            value={invoiceNumber}
                                            onChange={(e) => setInvoiceNumber(e.target.value)}
                                            required
                                        />
                                    </label>

                                    {/* Carrier Selection (Company, required) */}
                                    <label htmlFor="invoice-carrier">
                                        <span>
                                            {t("Carrier (required)")} <strong aria-hidden="true">*</strong>
                                        </span>
                                        <select
                                            id="invoice-carrier"
                                            value={selectedCarrier}
                                            onChange={(e) => setSelectedCarrier(e.target.value)}
                                            disabled={companyOptionsLoading || Boolean(companyOptionsError) || companies.length === 0}
                                            required
                                            aria-describedby="invoice-carrier-help"
                                        >
                                            <option value="">{t("Select a carrier")}</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.displayName || c.companyName}
                                                </option>
                                            ))}
                                        </select>
                                        <small id="invoice-carrier-help" className="company-select-note">
                                            {companyOptionsLoading
                                                ? t("Loading companies…")
                                                : companies.length === 0
                                                ? t("No carriers available. An Admin can add companies in the Companies module.")
                                                : t("Choose the carrier company issuing this invoice.")}
                                        </small>
                                    </label>

                                    {/* Shipper Selection (Company, dropdown required) */}
                                    <label htmlFor="invoice-shipper">
                                        <span>
                                            {t("Shipper (required)")} <strong aria-hidden="true">*</strong>
                                        </span>
                                        <select
                                            id="invoice-shipper"
                                            value={selectedShipper}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedShipper(val);
                                                const match = companies.find((c) => c.id === val);
                                                setShipperName(match?.displayName || match?.companyName || "");
                                            }}
                                            disabled={companyOptionsLoading || Boolean(companyOptionsError) || companies.length === 0}
                                            required
                                            aria-describedby="invoice-shipper-help"
                                        >
                                            <option value="">{t("Select a shipper")}</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.displayName || c.companyName}
                                                </option>
                                            ))}
                                        </select>
                                        <small id="invoice-shipper-help" className="company-select-note">
                                            {companyOptionsLoading
                                                ? t("Loading companies…")
                                                : companies.length === 0
                                                ? t("No carriers available. An Admin can add companies in the Companies module.")
                                                : t("Choose the shipper company.")}
                                        </small>
                                    </label>

                                    {/* Amount */}
                                    <label htmlFor="invoice-amount">
                                        <span>
                                            {t("Amount")} <strong aria-hidden="true">*</strong>
                                        </span>
                                        <input
                                            id="invoice-amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </label>

                                    {/* Issue Date (required) */}
                                    <label htmlFor="invoice-issue-date">
                                        <span>
                                            {t("Issue Date")} <strong aria-hidden="true">*</strong>
                                        </span>
                                        <input
                                            id="invoice-issue-date"
                                            type="date"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            required
                                        />
                                    </label>

                                    {/* Due Date (required) */}
                                    <label htmlFor="invoice-due-date">
                                        <span>
                                            {t("Due Date")} <strong aria-hidden="true">*</strong>
                                        </span>
                                        <input
                                            id="invoice-due-date"
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={() => {
                                        clearForm();
                                        setIsFormModalOpen(false);
                                    }}
                                    disabled={submitting}
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={submitting || companyOptionsLoading || companies.length === 0}
                                >
                                    {submitting
                                        ? t("Saving…")
                                        : editingId
                                        ? t("Update Invoice")
                                        : t("Register Invoice")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toolbar with Search and CSV Export */}
            <div className="company-toolbar">
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, minWidth: "280px" }}>
                    <button
                        type="button"
                        className="button button-primary"
                        onClick={() => {
                            clearForm();
                            setIsFormModalOpen(true);
                        }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                        <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span>
                        <span>{t("New Invoice")}</span>
                    </button>
                    <input
                        className="company-search-box"
                        type="search"
                        placeholder={t("Search invoice, shipper, buyer...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="module-actions" style={{ margin: 0 }}>
                    <CsvExportButton
                        filename="fiep-invoices.csv"
                        label={t("Export CSV")}
                        headers={[
                            t("Invoice Number"),
                            t("Carrier"),
                            t("Shipper"),
                            t("Amount"),
                            t("Issue Date"),
                            t("Due Date"),
                            t("Verification")
                        ]}
                        rows={filteredInvoices.map((inv) => {
                            const carrierName = inv.carrierName || inv.carrier?.tradeName || inv.carrier?.companyName || inv.company?.companyName || "";
                            const shipper = inv.shipperName || inv.buyerName || "";
                            return [
                                inv.invoiceNumber,
                                carrierName,
                                shipper,
                                inv.amount,
                                inv.issueDate || inv.dueDate,
                                inv.dueDate,
                                inv.verificationStatus
                            ];
                        })}
                    />
                </div>
            </div>

            {/* Invoices Directory Table */}
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>{t("Invoice Number")}</th>
                            <th>{t("Carrier")}</th>
                            <th>{t("Shipper")}</th>
                            <th>{t("Amount")}</th>
                            <th>{t("Issue Date")}</th>
                            <th>{t("Due Date")}</th>
                            <th>{t("Upload")}</th>
                            <th>{t("Verification")}</th>
                            <th style={{ textAlign: "right" }}>{t("Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((invoice) => {
                            const carrierName = invoice.carrierName || invoice.carrier?.tradeName || invoice.carrier?.companyName || invoice.company?.companyName || "—";
                            const shipperDisplay = invoice.shipperName || invoice.buyerName || "—";
                            const issueDateDisplay = invoice.issueDate || invoice.dueDate || "—";

                            return (
                                <tr key={invoice.id}>
                                    <td>
                                        <strong style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</strong>
                                    </td>
                                    <td>
                                        <span className="company-table-badge">{carrierName}</span>
                                    </td>
                                    <td>{shipperDisplay}</td>
                                    <td>
                                        <strong>
                                            {typeof invoice.amount === "number"
                                                ? invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                : invoice.amount}
                                        </strong>
                                    </td>
                                    <td>{issueDateDisplay}</td>
                                    <td>{invoice.dueDate || "—"}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <input
                                                type="file"
                                                style={{ maxWidth: "160px", fontSize: "11px" }}
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                            <button
                                                type="button"
                                                className="button button-secondary"
                                                style={{ padding: "4px 8px", fontSize: "12px" }}
                                                onClick={() => handleUpload(invoice.id)}
                                                disabled={uploadingId === invoice.id}
                                            >
                                                {uploadingId === invoice.id ? t("Loading…") : t("Upload")}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span
                                                className={`status-pill status-pill-${String(
                                                    invoice.verificationStatus || "NOT_CHECKED"
                                                ).toLowerCase().replaceAll("_", "-")}`}
                                            >
                                                {t(invoice.verificationStatus || "NOT_CHECKED")}
                                            </span>
                                            <button
                                                type="button"
                                                className="button button-secondary"
                                                style={{ padding: "3px 8px", fontSize: "11px" }}
                                                onClick={() => handleVerify(invoice.id)}
                                            >
                                                {t("Verify")}
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "inline-flex", gap: "6px" }}>
                                            <button
                                                type="button"
                                                className="button button-secondary"
                                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                                onClick={() => handleEdit(invoice)}
                                            >
                                                {t("Edit")}
                                            </button>
                                            <button
                                                type="button"
                                                className="button button-secondary action-delete"
                                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                                onClick={() => handleDelete(invoice.id)}
                                            >
                                                {t("Delete")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredInvoices.length === 0 && (
                            <tr>
                                <td className="table-empty-state" colSpan="9">
                                    {loading
                                        ? t("Loading invoices…")
                                        : searchQuery
                                        ? t("No invoices matching your search.")
                                        : t("No invoices found.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InvoicesPage;