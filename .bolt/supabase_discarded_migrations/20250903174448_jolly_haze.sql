@@ .. @@
   status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
   stripe_session_id text,
   stripe_payment_intent_id text,
   is_paid boolean DEFAULT false,
   metadata jsonb DEFAULT '{}',
   created_at timestamptz DEFAULT now(),
-  updated_at timestamptz DEFAULT now(),
-  transaction_hash text
+  updated_at timestamptz DEFAULT now()
 );
 
 -- Indexes for performance