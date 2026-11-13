-- Migration V6: Create pricing_rules table and link pricing_rule to factoring_deals
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id uuid PRIMARY KEY,
    name varchar(255) NOT NULL,
    code varchar(100) UNIQUE,
    advance_rate_percent numeric(12, 8) NOT NULL,
    fee_rate_percent numeric(12, 8) NOT NULL,
    description varchar(500),
    is_default boolean DEFAULT false,
    min_amount numeric(15, 2),
    max_amount numeric(15, 2)
);

ALTER TABLE public.factoring_deals
    ADD COLUMN IF NOT EXISTS pricing_rule_id uuid,
    ADD COLUMN IF NOT EXISTS pricing_rule_name varchar(255);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_deals_pricing_rule'
    ) THEN
        ALTER TABLE public.factoring_deals
            ADD CONSTRAINT fk_deals_pricing_rule FOREIGN KEY (pricing_rule_id) REFERENCES public.pricing_rules(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Seed default pricing rules
INSERT INTO public.pricing_rules (id, name, code, advance_rate_percent, fee_rate_percent, description, is_default)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Standard Freight', 'STANDARD', 85.00000000, 3.00000000, 'Standard 85% advance with 3% factoring fee', true),
    ('a0000000-0000-0000-0000-000000000002', 'Prime / High Volume', 'PRIME', 90.00000000, 2.00000000, 'Preferred 90% advance with discounted 2% fee for high volume', false),
    ('a0000000-0000-0000-0000-000000000003', 'Spot / Single Load', 'SPOT', 80.00000000, 4.00000000, 'Conservative 80% advance with 4% fee for one-off loads', false),
    ('a0000000-0000-0000-0000-000000000004', 'Accelerated Cash Flow', 'ACCELERATED', 92.00000000, 3.50000000, 'Aggressive 92% advance for rapid working capital', false)
ON CONFLICT (code) DO NOTHING;
