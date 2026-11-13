import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/LanguageContext";
import MainLayout from "../layouts/MainLayout";
import AuditLogsPage from "../pages/AuditLogsPage";
import ApiKeysPage from "../pages/ApiKeysPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import CompaniesPage from "../pages/CompaniesPage";
import CreditAssessmentsPage from "../pages/CreditAssessmentsPage";
import DashboardPage from "../pages/DashboardPage";
import FactoringDealsPage from "../pages/FactoringDealPage";
import InvoicesPage from "../pages/InvoicesPage";
import LoginPage from "../pages/LoginPage";
import PaymentsPage from "../pages/PaymentsPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

function ProtectedPage({ children, allowedRoles }) {
    const { user, loading, error, isAuthenticated, retryUserLoad } = useAuth();
    const { t } = useLanguage();

    if (loading) {
        return (
            <div className="full-page-state" role="status">
                <span className="loading-spinner" />
                <span>{t("Preparing your secure workspace…")}</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (error || !user) {
        return (
            <div className="full-page-state" role="alert">
                <p>{t(error || "Unable to verify your account.")}</p>
                <button className="button button-primary" onClick={retryUserLoad}>
                    {t("Retry")}
                </button>
            </div>
        );
    }

    if (
        allowedRoles &&
        user.role !== "ADMIN" &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedPage>
                        <DashboardPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/companies"
                element={
                    <ProtectedPage allowedRoles={["ADMIN"]}>
                        <CompaniesPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/invoices"
                element={
                    <ProtectedPage>
                        <InvoicesPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/payments"
                element={
                    <ProtectedPage allowedRoles={["ADMIN", "FINANCE_OFFICER"]}>
                        <PaymentsPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/audit"
                element={
                    <ProtectedPage allowedRoles={["ADMIN"]}>
                        <AuditLogsPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/api-keys"
                element={
                    <ProtectedPage allowedRoles={["ADMIN"]}>
                        <ApiKeysPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedPage allowedRoles={["ADMIN"]}>
                        <AdminUsersPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/credit"
                element={
                    <ProtectedPage allowedRoles={["ADMIN", "CREDIT_ANALYST"]}>
                        <CreditAssessmentsPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/factoring"
                element={
                    <ProtectedPage
                        allowedRoles={[
                            "ADMIN",
                            "FACTORING_OFFICER",
                            "FINANCE_OFFICER"
                        ]}
                    >
                        <FactoringDealsPage />
                    </ProtectedPage>
                }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;
