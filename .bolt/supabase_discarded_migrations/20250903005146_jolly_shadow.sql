@@ .. @@
 
 -- Add constraints with proper validation
-ALTER TABLE crypto_payment_invoices
-ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_cryptocurrency_check
-CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL'));
+-- Cryptocurrency constraint
+ALTER TABLE public.crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
 
-ALTER TABLE crypto_payment_invoices
-ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_status_check
-CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed'));
+ALTER TABLE public.crypto_payment_invoices
+ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
+CHECK (cryptocurrency IN ('BTC','ETH','USDT','SOL'));
+
+-- Status constraint
+ALTER TABLE public.crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;
+
+ALTER TABLE public.crypto_payment_invoices
+ADD CONSTRAINT crypto_payment_invoices_status_check
+CHECK (status IN ('pending','partial','confirmed','expired','failed'));