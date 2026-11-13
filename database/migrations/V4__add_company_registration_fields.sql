-- Migration V4: Add company registration fields (FIEP number, legal name, trade name, kind, email, address lines, city, state, country)
ALTER TABLE public.companies
    ADD COLUMN IF NOT EXISTS fiep_number varchar(255),
    ADD COLUMN IF NOT EXISTS legal_name varchar(255),
    ADD COLUMN IF NOT EXISTS trade_name varchar(255),
    ADD COLUMN IF NOT EXISTS kind varchar(100),
    ADD COLUMN IF NOT EXISTS email varchar(255),
    ADD COLUMN IF NOT EXISTS address_line1 varchar(255),
    ADD COLUMN IF NOT EXISTS address_line2 varchar(255),
    ADD COLUMN IF NOT EXISTS city varchar(100),
    ADD COLUMN IF NOT EXISTS state varchar(100),
    ADD COLUMN IF NOT EXISTS country varchar(100);

-- Backfill existing companies so trade_name, legal_name, and address_line1 match legacy fields
UPDATE public.companies
SET legal_name = coalesce(nullif(legal_name, ''), company_name),
    trade_name = coalesce(nullif(trade_name, ''), company_name),
    address_line1 = coalesce(nullif(address_line1, ''), address)
WHERE legal_name IS NULL OR trade_name IS NULL OR address_line1 IS NULL;
