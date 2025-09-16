@@ .. @@
 CREATE TABLE IF NOT EXISTS public.crypto_payment_invoices (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id uuid NOT NULL,
   amount_usd numeric(15,2) NOT NULL,
   cryptocurrency text NOT NULL,
   crypto_amount numeric(20,8) NOT NULL,
+  payment_address text NOT NULL,
   status text DEFAULT 'pending',
   expires_at timestamptz NOT NULL,
   paid_at timestamptz,
   transaction_hash text,
   confirmations integer DEFAULT 0,
   metadata jsonb DEFAULT '{}',
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );