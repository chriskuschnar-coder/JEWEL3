@@ .. @@
 /*
   # Complete Hedge Fund Platform Database Schema
 
   1. New Tables
     - `users` - User profiles with KYC status
     - `accounts` - Trading accounts with balances
     - `transactions` - All financial transactions
     - `compliance_records` - KYC/AML compliance data
     - `crypto_addresses` - Cryptocurrency wallet addresses
     - `bank_accounts` - Connected bank accounts via Plaid
     - `wire_instructions` - Wire transfer instructions
     - `payments` - Stripe payment records
     - `stripe_customers` - Stripe customer mapping
     - `stripe_subscriptions` - Subscription management
     - `stripe_orders` - Order tracking
 
   2. Security
     - Enable RLS on all tables
     - User-specific access policies
     - Secure data isolation
 
   3. Functions
     - Automatic account creation on user signup
     - Updated timestamp triggers
 */
 
-DO $$
-BEGIN
-  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
-    CREATE TYPE stripe_subscription_status AS ENUM (
-      'not_started',
-      'incomplete', 
-      'incomplete_expired',
-      'trialing',
-      'active',
-      'past_due',
-      'canceled',
-      'unpaid',
-      'paused'
-    );
-  END IF;
-END$$;
-
-DO $$
-BEGIN
-  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
-    CREATE TYPE stripe_order_status AS ENUM (
-      'pending',
-      'completed', 
-      'canceled'
-    );
-  END IF;
-END$$;
+-- Create custom types if they don't exist
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1 
+    FROM pg_type 
+    WHERE typname = 'stripe_subscription_status'
+  ) THEN
+    CREATE TYPE stripe_subscription_status AS ENUM ('not_started','incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused');
+  END IF;
+END$$;
+
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1 
+    FROM pg_type 
+    WHERE typname = 'stripe_order_status'
+  ) THEN
+    CREATE TYPE stripe_order_status AS ENUM ('pending','completed','canceled');
+  END IF;
+END$$;