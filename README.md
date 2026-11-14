# FIEP Factoring & Credit Intelligence

FIEP is a role-based factoring operations application. The React frontend is the
workspace used by staff; a Spring Boot REST API authenticates users, enforces
role access, stores operational records in PostgreSQL, and provides the data
shown by the workspace.

## What the system does

| Module | Purpose |
| --- | --- |
| Overview | Shows a live count of invoices and the other modules available to the signed-in role. |
| Companies | Admin-managed business directory with FIEP number, trade name, legal name, kind, email, phone, registered address lines, city, state, country, and tax ID. |
| Invoices | Registers freight invoices with carrier company association, shipper, amount, issue date, due date, uploaded documents, and verification results. |
| Credit Assessments | Links a company to a credit score, analyst remarks, and a `BUY` or `NO_BUY` decision. |
| Factoring Deals | Links one invoice to a financing record. A user-entered advance rate and fee rate calculate the financed amount, fee, and estimated net disbursement; the deal then moves through its lifecycle status. |
| Payments & Collections | Records one or more partial payments for a factoring deal, tracks pending/received/overdue status, receipts, and invoice due dates. The total received cannot exceed the deal's financed amount. A sweep marks pending records overdue after the linked invoice due date. |
| Audit Logs | Admin view of recorded operational actions such as company and API-key changes and overdue sweeps. It is not yet a complete audit of every CRUD action. |
| API Keys | Admin tool for issuing and revoking integration keys. A key inherits its selected FIEP role and has an expiration date. |
| User Management | Admin-only account creation and role assignment. Admin privileges cannot be self-assigned at public registration. |

The invoice-verification action calls a separately configured verification
service. It does not make an external request until an invoice is verified.
The service URL and API key are required to use this action; without them the
backend returns HTTP 503 rather than claiming an invoice was checked.
Organization-wide pricing rules are not configured; advance and fee rates are
entered for each deal and should match its approved commercial terms.

Companies, invoices, credit assessments, factoring deals, payments, and audit
logs can be exported from their pages as CSV. The payment export contains the
currently filtered rows. Exports are generated in the browser from data already
loaded for the signed-in user; handle downloaded files according to your
organization's data-protection rules.

## Language

The frontend includes English and Amharic (አማርኛ) language selection on both
the sign-in screens and the signed-in workspace. The choice is saved in the
browser and remains selected on later visits. User-entered business data and
API/database values are not modified; the interface translates labels, help
text, statuses, and common validation or service messages for display.

## Role access

| Role | Main access |
| --- | --- |
| `ADMIN` | All workspace modules and API-key administration. |
| `CREDIT_ANALYST` | Dashboard, invoices, and credit assessments. |
| `FACTORING_OFFICER` | Dashboard, invoices, and factoring deals. |
| `FINANCE_OFFICER` | Dashboard, invoices, factoring deals, and payments. |

The frontend hides navigation and protects routes for usability. The backend
also enforces roles on protected endpoints; frontend visibility alone is not an
authorization boundary. Admin access is a bypass for role-restricted pages and
controllers.

## How a workflow moves through the system

1. **Sign in:** The frontend posts credentials to `POST /api/auth/login`. The
   backend checks the stored password hash and returns a signed JWT. The
   frontend stores that token locally and sends it as
   `Authorization: Bearer <token>`.
2. **Load the workspace:** The frontend requests `GET /api/auth/me` to identify
   the signed-in user and role, then loads role-scoped dashboard statistics
   and attention items. The attention queue links invoice review, pending deal
   review, or overdue collections only when those tasks apply to the user's
   role.
   The sidebar and route guards use the returned role. The top header provides
   a sign-out action on every workspace page; it clears the current login and
   returns to the sign-in screen.
3. **Register an account:** Public sign-up creates Credit Analyst, Factoring
   Officer, or Finance Officer accounts. Only a signed-in Admin can create an
   Admin account or assign other roles from User Management. Passwords are
   hashed before storage.
4. **Recover an account:** The user requests a reset link from the sign-in page.
   FIEP emails a short-lived, single-use link; only a hash of its random token
   is stored. The reset form updates the password after validating the token.
   This requires SMTP configuration as described below.
5. **Register an invoice:** An invoice contains an invoice number, mandatory
   carrier company, mandatory shipper, amount, issue date, and due date. The
   carrier selector loads its choices from `GET /api/companies/options`; if
   there are no companies, an Admin must add one in the Companies module.
   Staff may upload the document.
   `POST /api/invoices/{id}/verify` sends invoice details to the configured
   verification service and stores `VERIFIED` or `REJECTED`, its message, and
   check time. Editing invoice details resets verification to `NOT_CHECKED`.
6. **Assess credit:** A credit analyst creates an assessment for a company with
   a score, remarks, and decision. The company selector uses the same company
   options endpoint and explains when an Admin needs to add a company. These
   records provide review context; the application does not automatically
   approve a deal based on a score.
7. **Create a factoring deal:** A factoring/finance officer links an invoice
   and enters an advance rate and a fee rate. The backend uses the invoice's
   saved amount to calculate the financed amount and fee (rounded to two
   decimal places), then derives estimated net disbursement as financed amount
   minus fee. The fee rate must be below the advance rate so the net amount is
   positive. The officer also sets the status (`PENDING`, `APPROVED`,
   `DISBURSED`, or `CLOSED`). The invoice-to-deal relationship is used by the
   collections view.
8. **Record collection:** Finance can record multiple partial payments for a
   factoring deal. Each payment has an amount, status, optional received date,
   and optional receipt. The sum of payments marked `RECEIVED` cannot exceed
   the deal's financed amount. The collection view shows the received total and
   remaining financed balance for the deal, and derives expected date and
   invoice/company labels from the related invoice. “Sweep overdue” changes
   pending payments to `OVERDUE` when the invoice due date is earlier than
   today; it does not change received payments or payments due today.
9. **Administer and trace:** Admins can manage user accounts, review recorded
   audit entries, and issue
   API keys. API-key secrets are displayed only at creation and are stored as
   hashes. Integrations send the key in the `X-API-Key` header; the assigned
   role determines what the integration may access. Keys can be revoked and
   expire within 30–365 days.

## Requirements

- Java 21
- PostgreSQL
- Node.js 20.19+ or 22.12+ (required by the Vite version in this project)
- PowerShell on Windows, or a shell that can run the Maven wrapper and npm

## Configure and run locally (Windows PowerShell)

Open PowerShell in the project root (the directory containing `pom.xml`).

1. **Create a PostgreSQL database**, for example `factoring_db`.
2. **Set runtime configuration** in the same PowerShell window. Use a private,
   random JWT secret; do not commit it or share it:

   ```powershell
   $bytes = New-Object byte[] 48
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
   $env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/factoring_db"
   $env:SPRING_DATASOURCE_USERNAME = "postgres"
   $env:SPRING_DATASOURCE_PASSWORD = "<your-local-database-password>"
   ```

   `JWT_SECRET` must contain at least 32 UTF-8 bytes. The backend fails fast if
   it is missing or too short. Automated tests use a test-only key configured
   on the application-context test; it is not used by the application.

   If you intend to use invoice verification, configure the provider in this
   same PowerShell window before starting the backend:

   ```powershell
   $env:INVOICE_VERIFICATION_URL = "https://<provider-host>/<verification-endpoint>"
   $env:INVOICE_VERIFICATION_API_KEY = "<provider-api-key>"
   $env:INVOICE_VERIFICATION_API_KEY_HEADER = "X-API-Key"
   ```

   Replace these placeholders with the values supplied by your provider; never
   commit a real key. The header defaults to `X-API-Key` but must not be blank.
   The endpoint must use HTTPS; HTTP is allowed only for localhost development.
   It must accept the verification request and return JSON containing a boolean
   `verified` field and an optional `message`. If any required setting is
   missing, verification returns HTTP 503 rather than reporting a false result.
   Restart the backend after changing these environment variables.

3. **Start the backend** from the project root with the included launcher:

   ```powershell
   .\run-backend.ps1
   ```

   On first launch, this script generates a cryptographically random JWT
   secret and saves it to your Windows user environment. Later launches reuse
   the same value, so signing out or restarting the backend does not
   invalidate tokens by changing the signing key. Do not share or commit the
   secret. Directly running `.\mvnw.cmd spring-boot:run` still requires
   `JWT_SECRET` to already be set in that PowerShell process.

   The API listens at `http://localhost:8080`. Hibernate is configured with
   `ddl-auto=update` for this project; use reviewed migrations rather than this
   setting for production schema changes. For an existing PostgreSQL database,
   apply [`database/migrations/V2__allow_multiple_payments_per_deal.sql`](./database/migrations/V2__allow_multiple_payments_per_deal.sql)
   before recording multiple payments, then apply
   [`database/migrations/V3__add_factoring_rates.sql`](./database/migrations/V3__add_factoring_rates.sql)
   before editing or creating deals. V2 removes the old unique constraint on
   `payments.factoring_deal_id`; V3 adds advance/fee rates and backfills them
   from existing deal amounts. Hibernate's update mode does not reliably remove
   the old payment constraint or populate the new rate values.

4. **Start the frontend** in a second PowerShell window:

   ```powershell
   Set-Location .\frontend-app
   npm install
   npm run dev
   ```

   Open the local URL printed by Vite (normally `http://localhost:5173`).
   Local `/api` requests are proxied by Vite to the Render backend
   (`https://factoring-backend-jhdm.onrender.com`), so a local Spring backend
   does not need to be running. Set `VITE_API_BASE_URL` to override the API
   target when needed.

The API exposes `POST /api/auth/register` for account creation and
`POST /api/auth/login` for sign-in. Public registration is limited to the three
non-admin roles. Admin account creation and user listing require an authenticated
Admin.

To promote an existing account to Admin in a hosted environment, configure
`BOOTSTRAP_ADMIN_EMAIL` with that account's exact email. The backend promotes
that account on startup and preserves its current password. If the account does
not exist yet, also configure `BOOTSTRAP_ADMIN_PASSWORD` (12–72 UTF-8 bytes) to
create it. An optional `BOOTSTRAP_ADMIN_NAME` sets the display name. Keep any
password in the hosting provider's secret environment variables; do not commit
it to source control.

Password reset requires a configured SMTP service. Set these environment
variables in the same PowerShell session before starting the backend:

```powershell
$env:MAIL_HOST = "<smtp-host>"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "<smtp-username>"
$env:MAIL_PASSWORD = "<smtp-password>"
$env:MAIL_SMTP_AUTH = "true"
$env:MAIL_SMTP_STARTTLS = "true"
$env:APP_MAIL_FROM = "FIEP <no-reply@your-domain.example>"
$env:APP_FRONTEND_URL = "http://localhost:5173"
```

Use values supplied by your mail provider and do not commit SMTP credentials.
Without `MAIL_HOST` and `APP_MAIL_FROM`, the forgot-password endpoint returns
an explicit service-unavailable response; it does not reveal whether an email
belongs to an account or claim that an email was sent. Reset links expire after
20 minutes and can only be used once.

## API outline

All API paths below are relative to `http://localhost:8080`.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Create an account. |
| `POST /api/auth/login` | Authenticate and receive a JWT. |
| `GET /api/auth/me` | Return the authenticated account profile. |
| `POST /api/auth/password/forgot` | Request an email password-reset link (requires SMTP). |
| `POST /api/auth/password/reset` | Set a new password using a valid reset token. |
| `/api/auth/admin/users` | Admin-only account creation and account listing. |
| `GET /api/dashboard/statistics` | Return role-scoped workspace counts. |
| `GET /api/dashboard/attention` | Return nonzero invoice-review, pending-deal, and overdue-payment counts for the signed-in role. |
| `/api/companies` | Admin company records; `GET /api/companies/options` returns names/IDs for linked forms. |
| `/api/invoices` | Invoice create/list/update/delete, document upload, and verification. |
| `/api/credit-assessments` | Company-linked credit assessment create/list/update/delete. |
| `/api/factoring-deals` | Invoice-linked financing create/list/update/delete. |
| `/api/payments` | Payment CRUD and receipt upload. |
| `GET /api/payments/collections` | Payment/invoice details for the collections table. |
| `POST /api/payments/sweep-overdue` | Mark pending payments overdue when their linked invoice is past due. |
| `GET /api/audit-logs` | Admin audit history. |
| `/api/api-keys` | Admin issue/list/revoke API keys. |

Protected requests use a JWT bearer token, except integrations can instead
authenticate with `X-API-Key`. The invoice-verification API key is separate:
it authenticates FIEP to the external verification service, not an integration
to FIEP.

## Validate the project

Run these from the project root:

```powershell
Set-Location .\frontend-app
npm run lint
npm run build

Set-Location ..
.\mvnw.cmd test
```

The frontend lint command checks all frontend source. The Maven test command
compiles the backend and runs the test suite, including payment collection,
invoice verification, factoring deal, API-key, and application-context tests.

## Manual end-to-end test checklist

1. Start PostgreSQL, set the environment variables, and start the backend and
   frontend. Configure SMTP if testing password recovery. Confirm that the
   login screen loads and that the API is reachable.
2. Sign in with a test user. Confirm the dashboard loads and that the sidebar
   matches the user's assigned role. Attempting a restricted API request as a
   non-authorized role should return `403`; an unauthenticated request should
   return `401`.
3. Create an account through public registration and confirm that choosing
   `ADMIN` is impossible there. As Admin, create a second Admin through User
   Management. Test forgot-password email delivery, expiry, single-use reset,
   and sign-in with the new password.
4. As Admin, create a company. As a credit analyst, create a credit assessment
   and select that company; confirm the labeled selector shows the company and
   its name appears in the assessment list. Check the helper message when no
   company exists. Confirm the header sign-out button returns to sign-in.
5. Create an invoice with a due date and company. Upload a document. If the
   external verification service is configured, verify the invoice and confirm
   its verification state/message. Edit an invoice and confirm verification
   resets to `NOT_CHECKED`.
6. Create a factoring deal for the invoice. Confirm the invoice association and
   status appear in the deals table.
7. As a Finance Officer, record a pending payment for the deal. Confirm expected
   date and invoice details appear in collections. Test “Sweep overdue” with
   an invoice whose due date is before today; confirm the payment becomes
   overdue. Record multiple received partial payments with received dates and
   upload a receipt. Confirm the received total and remaining balance update,
   and that a payment that would take the total over the financed amount is
   rejected.
8. As Admin, create an API key with a non-admin role and a short test lifetime.
   Copy the secret once, use `X-API-Key` on an endpoint allowed to that role,
   confirm a restricted endpoint is denied, and revoke the key. Confirm it no
   longer authenticates.
9. Review Audit Logs for supported recorded actions. Do not treat the current
   page as a complete event history for every type of record.
10. Export CSVs from the invoice, deal, payment, and audit pages. On Payments,
    apply a search or status filter first and verify that the exported rows
    match the visible filtered collection.

## Data and current boundaries

- A factoring deal references one invoice; it can have multiple payment
  records. Only payments marked `RECEIVED` count toward the financed-amount
  cap; pending and overdue records do not reserve part of that cap.
- Advance and fee rates are entered on each factoring deal; no organization-
  wide default pricing rate is configured. Confirm the applicable contract
  rates before creating a deal.
- Invoices store a mandatory carrier company, shipper, issue date, and due
  date, with bidirectional compatibility for legacy queries and services.
- Credit scores and BUY/NO BUY decisions are recorded for review; no automated
  credit scoring service or deal-approval rule is configured here.
- API-key role assignment grants that role's endpoint permissions, not
  per-endpoint scopes. Keep keys private, use the least-privileged role, and
  revoke unused keys.
- Receipt and invoice documents are currently stored by the backend's upload
  paths. Use safe, managed storage and review upload limits/retention before
  exposing this application publicly.
