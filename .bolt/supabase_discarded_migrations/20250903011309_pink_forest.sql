@@ .. @@
 ALTER TABLE public.crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
 
 -- Add constraints safely with DO blocks
-ALTER TABLE public.crypto_payment_invoices
-ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_cryptocurrency_check
-CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text]));
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1
+    FROM information_schema.table_constraints
+    WHERE constraint_name = 'crypto_payment_invoices_cryptocurrency_check'
+      AND table_name = 'crypto_payment_invoices'
+      AND table_schema = 'public'
+  ) THEN
+    ALTER TABLE public.crypto_payment_invoices
+    ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
+    CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text]));
+  END IF;
+END
+$$;
 
-ALTER TABLE public.crypto_payment_invoices
-ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_status_check
-CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text]));
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1
+    FROM information_schema.table_constraints
+    WHERE constraint_name = 'crypto_payment_invoices_status_check'
+      AND table_name = 'crypto_payment_invoices'
+      AND table_schema = 'public'
+  ) THEN
+    ALTER TABLE public.crypto_payment_invoices
+    ADD CONSTRAINT crypto_payment_invoices_status_check
+    CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text]));
+  END IF;
+END
+$$;