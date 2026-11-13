DO $$
DECLARE
    payment_deal_unique record;
BEGIN
    IF to_regclass('public.payments') IS NULL THEN
        RETURN;
    END IF;

    FOR payment_deal_unique IN
        SELECT constraint_row.conname
        FROM pg_constraint constraint_row
        JOIN pg_class table_row
            ON table_row.oid = constraint_row.conrelid
        JOIN pg_namespace schema_row
            ON schema_row.oid = table_row.relnamespace
        WHERE schema_row.nspname = 'public'
          AND table_row.relname = 'payments'
          AND constraint_row.contype = 'u'
          AND (
              SELECT array_agg(attribute_row.attname ORDER BY key_column.ordinality)
              FROM unnest(constraint_row.conkey) WITH ORDINALITY AS key_column(attribute_number, ordinality)
              JOIN pg_attribute attribute_row
                  ON attribute_row.attrelid = table_row.oid
                 AND attribute_row.attnum = key_column.attribute_number
          ) = ARRAY['factoring_deal_id']::name[]
    LOOP
        EXECUTE format(
            'ALTER TABLE public.payments DROP CONSTRAINT %I',
            payment_deal_unique.conname);
    END LOOP;
END $$;
