import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from "../services/companyService";
import ModuleIntro from "../components/ModuleIntro";
import CsvExportButton from "../components/CsvExportButton";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState, useMemo } from "react";

const COMPANY_KINDS = [
    "Carrier",
    "Shipper",
    "Both"
];

function CompaniesPage() {
    const { t } = useLanguage();

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [viewingCompany, setViewingCompany] = useState(null);

    // Form fields for Company Register
    const [fiepNumber, setFiepNumber] = useState("");
    const [legalName, setLegalName] = useState("");
    const [tradeName, setTradeName] = useState("");
    const [kind, setKind] = useState("Carrier");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("Ethiopia");
    const [tin, setTin] = useState("");

    const [editingId, setEditingId] = useState(null);

    const loadCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data || []);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Could not load companies.")
            });
        }
    };

    useEffect(() => {
        let ignore = false;
        getCompanies()
            .then((data) => {
                if (!ignore) {
                    setCompanies(data || []);
                }
            })
            .catch((error) => {
                if (!ignore) {
                    console.error(error);
                    setFeedback({
                        type: "error",
                        message: error.response?.data?.message || t("Could not load companies.")
                    });
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [t]);

    const clearForm = () => {
        setEditingId(null);
        setFiepNumber("");
        setLegalName("");
        setTradeName("");
        setKind("Carrier");
        setEmail("");
        setPhone("");
        setAddressLine1("");
        setAddressLine2("");
        setCity("");
        setState("");
        setCountry("Ethiopia");
        setTin("");
    };

    const handleEdit = (company) => {
        setEditingId(company.id);
        setFiepNumber(company.fiepNumber || "");
        setLegalName(company.legalName || company.companyName || "");
        setTradeName(company.tradeName || company.companyName || "");
        setKind(company.kind || "Carrier");
        setEmail(company.email || "");
        setPhone(company.phone || "");
        setAddressLine1(company.addressLine1 || company.address || "");
        setAddressLine2(company.addressLine2 || "");
        setCity(company.city || "");
        setState(company.state || "");
        setCountry(company.country || "Ethiopia");
        setTin(company.tin || "");
        setFeedback(null);
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!tradeName.trim() && !legalName.trim()) {
            setFeedback({
                type: "error",
                message: t("Legal name or Trade name is required")
            });
            return;
        }

        if (!phone.trim()) {
            setFeedback({
                type: "error",
                message: t("Phone number is required")
            });
            return;
        }

        const effectiveTradeName = tradeName.trim() || legalName.trim();
        const effectiveLegalName = legalName.trim() || tradeName.trim();

        const payload = {
            fiepNumber: fiepNumber.trim(),
            legalName: effectiveLegalName,
            tradeName: effectiveTradeName,
            kind: kind.trim(),
            email: email.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            tin: tin.trim(),
            companyName: effectiveTradeName,
            address: [addressLine1.trim(), addressLine2.trim(), city.trim(), state.trim(), country.trim()]
                .filter(Boolean)
                .join(", ")
        };

        setSubmitting(true);
        setFeedback(null);

        try {
            if (editingId) {
                await updateCompany(editingId, payload);
                setFeedback({
                    type: "success",
                    message: t("Company updated successfully.")
                });
            } else {
                await createCompany(payload);
                setFeedback({
                    type: "success",
                    message: t("Company registered successfully.")
                });
            }
            clearForm();
            setIsFormModalOpen(false);
            await loadCompanies();
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Failed to save company.")
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setCompanies((prev) => prev.filter((c) => c.id !== id));
            await deleteCompany(id);
            setFeedback({
                type: "success",
                message: t("Company deleted successfully.")
            });
            if (editingId === id) {
                clearForm();
            }
            await loadCompanies();
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("Could not delete company.")
            });
        }
    };

    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) return companies;
        const q = searchQuery.toLowerCase();
        return companies.filter((c) => {
            const name = (c.tradeName || c.companyName || "").toLowerCase();
            const legal = (c.legalName || "").toLowerCase();
            const fiep = (c.fiepNumber || "").toLowerCase();
            const k = (c.kind || "").toLowerCase();
            const mail = (c.email || "").toLowerCase();
            const p = (c.phone || "").toLowerCase();
            const cty = (c.city || "").toLowerCase();
            const cntry = (c.country || "").toLowerCase();
            const tId = (c.tin || "").toLowerCase();
            return (
                name.includes(q) ||
                legal.includes(q) ||
                fiep.includes(q) ||
                k.includes(q) ||
                mail.includes(q) ||
                p.includes(q) ||
                cty.includes(q) ||
                cntry.includes(q) ||
                tId.includes(q)
            );
        });
    }, [companies, searchQuery]);

    return (
        <div>
            <ModuleIntro
                eyebrow="BUSINESS DIRECTORY"
                title="Companies"
                description="Manage the businesses whose invoices and credit activity are handled in FIEP. Company records provide the identity and contact details used across the workflow."
            />

            {feedback && (
                <div
                    className={feedback.type === "error" ? "attention-banner" : "attention-banner"}
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

            {/* Company Registration / Edit Dialog Modal */}
            {isFormModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{editingId ? t("Edit Company") : t("Register Company")}</h3>
                                <p>{t("Enter business identity, kind, contact details, and registered address.")}</p>
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
                                <div className="company-form-container">
                                    {/* Section 1: Business Identity */}
                                    <div className="company-form-section">
                                        <div className="company-form-section-title">
                                            <span>🏢 {t("Business Identity")}</span>
                                        </div>
                                        <div className="company-form-row-3">
                                            <div className="company-form-field">
                                                <label htmlFor="company-fiep-number">
                                                    <span>{t("FIEP Number")}</span>
                                                    <span className="field-hint">{t("System ID")}</span>
                                                </label>
                                                <input
                                                    id="company-fiep-number"
                                                    placeholder="e.g. FIEP-ET-10029"
                                                    value={fiepNumber}
                                                    onChange={(e) => setFiepNumber(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-kind">
                                                    <span>{t("Kind")} <span className="req-star">*</span></span>
                                                    <span className="field-hint">{t("Business Role")}</span>
                                                </label>
                                                <select
                                                    id="company-kind"
                                                    value={kind}
                                                    onChange={(e) => setKind(e.target.value)}
                                                >
                                                    {COMPANY_KINDS.map((k) => (
                                                        <option key={k} value={k}>
                                                            {t(k)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-tin">
                                                    <span>{t("TIN")}</span>
                                                    <span className="field-hint">{t("Tax Identification")}</span>
                                                </label>
                                                <input
                                                    id="company-tin"
                                                    placeholder="e.g. 0012345678"
                                                    value={tin}
                                                    onChange={(e) => setTin(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field span-2">
                                                <label htmlFor="company-legal-name">
                                                    <span>{t("Legal Name")}</span>
                                                    <span className="field-hint">{t("Registered Entity")}</span>
                                                </label>
                                                <input
                                                    id="company-legal-name"
                                                    placeholder={t("Official Registered Legal Name")}
                                                    value={legalName}
                                                    onChange={(e) => setLegalName(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-trade-name">
                                                    <span>{t("Trade Name")} <span className="req-star">*</span></span>
                                                    <span className="field-hint">{t("Operating Brand")}</span>
                                                </label>
                                                <input
                                                    id="company-trade-name"
                                                    placeholder={t("Commercial / Trading Name")}
                                                    value={tradeName}
                                                    onChange={(e) => setTradeName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Contact Information */}
                                    <div className="company-form-section">
                                        <div className="company-form-section-title">
                                            <span>📞 {t("Contact Information")}</span>
                                        </div>
                                        <div className="company-form-row">
                                            <div className="company-form-field">
                                                <label htmlFor="company-email">
                                                    <span>{t("Email")}</span>
                                                    <span className="field-hint">{t("Official Email")}</span>
                                                </label>
                                                <input
                                                    id="company-email"
                                                    type="email"
                                                    placeholder="operations@company.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-phone">
                                                    <span>{t("Phone")} <span className="req-star">*</span></span>
                                                    <span className="field-hint">{t("Direct Number")}</span>
                                                </label>
                                                <input
                                                    id="company-phone"
                                                    placeholder="+251 911 000 000"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Registered Address */}
                                    <div className="company-form-section">
                                        <div className="company-form-section-title">
                                            <span>📍 {t("Registered Address")}</span>
                                        </div>
                                        <div className="company-form-row-3">
                                            <div className="company-form-field span-2">
                                                <label htmlFor="company-address-line1">
                                                    <span>{t("Address Line 1")}</span>
                                                    <span className="field-hint">{t("Street, Building, Sub-city")}</span>
                                                </label>
                                                <input
                                                    id="company-address-line1"
                                                    placeholder={t("Street Address, Building Name, House / Office Number, Sub-city")}
                                                    value={addressLine1}
                                                    onChange={(e) => setAddressLine1(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-address-line2">
                                                    <span>{t("Address Line 2")}</span>
                                                    <span className="field-hint">{t("Floor / Suite (Optional)")}</span>
                                                </label>
                                                <input
                                                    id="company-address-line2"
                                                    placeholder={t("Floor, Suite, Unit (Optional)")}
                                                    value={addressLine2}
                                                    onChange={(e) => setAddressLine2(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-city">
                                                    <span>{t("City")}</span>
                                                </label>
                                                <input
                                                    id="company-city"
                                                    placeholder="e.g. Addis Ababa"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-state">
                                                    <span>{t("State / Region")}</span>
                                                </label>
                                                <input
                                                    id="company-state"
                                                    placeholder="e.g. Addis Ababa / Oromia"
                                                    value={state}
                                                    onChange={(e) => setState(e.target.value)}
                                                />
                                            </div>
                                            <div className="company-form-field">
                                                <label htmlFor="company-country">
                                                    <span>{t("Country")}</span>
                                                </label>
                                                <input
                                                    id="company-country"
                                                    placeholder="e.g. Ethiopia"
                                                    value={country}
                                                    onChange={(e) => setCountry(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? t("Saving…")
                                        : editingId
                                        ? t("Update Company")
                                        : t("Register Company")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Company Details View Dialog Modal */}
            {viewingCompany && (
                <div className="modal-backdrop" onClick={() => setViewingCompany(null)}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{viewingCompany.tradeName || viewingCompany.companyName || viewingCompany.legalName}</h3>
                                <p>{t("Complete company profile and registered entities")}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setViewingCompany(null)}
                                aria-label={t("Close")}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <div className="company-details-card-grid">
                                <div className="company-detail-card">
                                    <span className="detail-label">🏢 {t("FIEP Number")}</span>
                                    <span className="detail-value highlight">{viewingCompany.fiepNumber || "—"}</span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">🏷️ {t("Kind")}</span>
                                    <span className="detail-value">
                                        <span className="company-kind-badge">{t(viewingCompany.kind || "—")}</span>
                                    </span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">⚖️ {t("Legal Name")}</span>
                                    <span className="detail-value">{viewingCompany.legalName || "—"}</span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">🏪 {t("Trade Name")}</span>
                                    <span className="detail-value">{viewingCompany.tradeName || viewingCompany.companyName || "—"}</span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">📋 {t("TIN")}</span>
                                    <span className="detail-value">{viewingCompany.tin || "—"}</span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">✉️ {t("Email")}</span>
                                    <span className="detail-value">
                                        {viewingCompany.email ? (
                                            <a href={`mailto:${viewingCompany.email}`} style={{ color: "var(--accent)" }}>
                                                {viewingCompany.email}
                                            </a>
                                        ) : "—"}
                                    </span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">📞 {t("Phone")}</span>
                                    <span className="detail-value">
                                        {viewingCompany.phone ? (
                                            <a href={`tel:${viewingCompany.phone}`} style={{ color: "var(--accent)" }}>
                                                {viewingCompany.phone}
                                            </a>
                                        ) : "—"}
                                    </span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">🏙️ {t("City")}</span>
                                    <span className="detail-value">{viewingCompany.city || "—"}</span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">🗺️ {t("State / Region")}</span>
                                    <span className="detail-value">{viewingCompany.state || "—"}</span>
                                </div>
                                <div className="company-detail-card">
                                    <span className="detail-label">🌍 {t("Country")}</span>
                                    <span className="detail-value">{viewingCompany.country || "—"}</span>
                                </div>
                                <div className="company-detail-card span-full">
                                    <span className="detail-label">📍 {t("Address Line 1")}</span>
                                    <span className="detail-value">{viewingCompany.addressLine1 || viewingCompany.address || "—"}</span>
                                </div>
                                {viewingCompany.addressLine2 && (
                                    <div className="company-detail-card span-full">
                                        <span className="detail-label">🚪 {t("Address Line 2")}</span>
                                        <span className="detail-value">{viewingCompany.addressLine2}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => setViewingCompany(null)}
                            >
                                {t("Close")}
                            </button>
                            <button
                                type="button"
                                className="button button-primary"
                                onClick={() => {
                                    const target = viewingCompany;
                                    setViewingCompany(null);
                                    handleEdit(target);
                                }}
                            >
                                {t("Edit Company")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Directory Toolbar with Search and CSV Export */}
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
                        <span>{t("Register Company")}</span>
                    </button>
                    <input
                        className="company-search-box"
                        type="search"
                        placeholder={t("Search companies...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="module-actions" style={{ margin: 0 }}>
                    <CsvExportButton
                        filename="fiep-companies.csv"
                        label={t("Export CSV")}
                        headers={[
                            t("FIEP Number"),
                            t("Trade Name"),
                            t("Legal Name"),
                            t("Kind"),
                            t("Email"),
                            t("Phone"),
                            t("Address Line 1"),
                            t("Address Line 2"),
                            t("City"),
                            t("State"),
                            t("Country"),
                            t("TIN")
                        ]}
                        rows={filteredCompanies.map((c) => [
                            c.fiepNumber || "",
                            c.tradeName || c.companyName || "",
                            c.legalName || "",
                            c.kind || "",
                            c.email || "",
                            c.phone || "",
                            c.addressLine1 || c.address || "",
                            c.addressLine2 || "",
                            c.city || "",
                            c.state || "",
                            c.country || "",
                            c.tin || ""
                        ])}
                    />
                </div>
            </div>

            {/* Companies Directory Table */}
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>{t("FIEP #")}</th>
                            <th>{t("Company")}</th>
                            <th>{t("Kind")}</th>
                            <th>{t("Email")}</th>
                            <th>{t("Phone")}</th>
                            <th>{t("Location")}</th>
                            <th>{t("TIN")}</th>
                            <th style={{ textAlign: "right" }}>{t("Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map((company) => {
                            const displayName = company.tradeName || company.companyName || company.legalName || "—";
                            const displayLegal = company.legalName && company.legalName !== displayName ? company.legalName : null;
                            const locationStr = [company.city, company.country]
                                .filter(Boolean)
                                .join(", ") || company.addressLine1 || company.address || "—";

                            return (
                                <tr key={company.id}>
                                    <td>
                                        {company.fiepNumber ? (
                                            <span className="company-table-badge">{company.fiepNumber}</span>
                                        ) : (
                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "grid", gap: "2px" }}>
                                            <strong
                                                style={{ color: "var(--text-primary)", cursor: "pointer" }}
                                                onClick={() => setViewingCompany(company)}
                                                title={t("View company details")}
                                            >
                                                {displayName}
                                            </strong>
                                            {displayLegal && (
                                                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                                                    {displayLegal}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {company.kind ? (
                                            <span className="company-kind-badge">{t(company.kind)}</span>
                                        ) : (
                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {company.email ? (
                                            <a
                                                href={`mailto:${company.email}`}
                                                style={{ color: "var(--accent)", textDecoration: "none" }}
                                            >
                                                {company.email}
                                            </a>
                                        ) : (
                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                        )}
                                    </td>
                                    <td>{company.phone || "—"}</td>
                                    <td>
                                        <div style={{ display: "grid", gap: "2px" }}>
                                            <span>{locationStr}</span>
                                            {company.addressLine1 && (company.city || company.country) && (
                                                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                                                    {company.addressLine1}
                                                    {company.addressLine2 ? `, ${company.addressLine2}` : ""}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>{company.tin || "—"}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "inline-flex", gap: "6px" }}>
                                            <button
                                                type="button"
                                                className="button button-secondary"
                                                onClick={() => setViewingCompany(company)}
                                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                            >
                                                {t("View")}
                                            </button>
                                            <button
                                                type="button"
                                                className="button button-secondary"
                                                onClick={() => handleEdit(company)}
                                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                            >
                                                {t("Edit")}
                                            </button>
                                            <button
                                                type="button"
                                                className="button button-secondary action-delete"
                                                onClick={() => handleDelete(company.id)}
                                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                            >
                                                {t("Delete")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredCompanies.length === 0 && (
                            <tr>
                                <td className="table-empty-state" colSpan="8">
                                    {loading
                                        ? t("Loading companies…")
                                        : searchQuery
                                        ? t("No companies matching your search.")
                                        : t("No companies found.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CompaniesPage;