-- Migration V5: Add carrier, shipper, and issue_date to invoices
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS carrier_id uuid,
    ADD COLUMN IF NOT EXISTS carrier_name varchar(255),
    ADD COLUMN IF NOT EXISTS shipper_id uuid,
    ADD COLUMN IF NOT EXISTS shipper_name varchar(255),
    ADD COLUMN IF NOT EXISTS issue_date date;

-- Add foreign key constraints safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoices_carrier'
    ) THEN
        ALTER TABLE public.invoices
            ADD CONSTRAINT fk_invoices_carrier FOREIGN KEY (carrier_id) REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoices_shipper'
    ) THEN
        ALTER TABLE public.invoices
            ADD CONSTRAINT fk_invoices_shipper FOREIGN KEY (shipper_id) REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Backfill from existing company and buyer_name
UPDATE public.invoices
SET carrier_id = coalesce(carrier_id, company_id),
    shipper_name = coalesce(shipper_name, buyer_name),
    issue_date = coalesce(issue_date, due_date)
WHERE carrier_id IS NULL OR shipper_name IS NULL OR issue_date IS NULL;
