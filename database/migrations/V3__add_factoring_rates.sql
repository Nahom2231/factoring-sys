ALTER TABLE public.factoring_deals
    ADD COLUMN IF NOT EXISTS advance_rate_percent numeric(12, 8),
    ADD COLUMN IF NOT EXISTS fee_rate_percent numeric(12, 8);

UPDATE public.factoring_deals
SET advance_rate_percent = round(
        financed_amount / nullif(invoice_amount, 0) * 100,
        8)
WHERE advance_rate_percent IS NULL
  AND invoice_amount > 0;

UPDATE public.factoring_deals
SET fee_rate_percent = round(
        fee / nullif(invoice_amount, 0) * 100,
        8)
WHERE fee_rate_percent IS NULL
  AND invoice_amount > 0;
