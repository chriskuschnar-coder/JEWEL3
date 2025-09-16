@@ .. @@
 END$$;
 
--- Create stripe_order_status enum type if it doesn't exist
+-- Create stripe_order_status enum type if it doesn't exist
 DO $$
 BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
@@ .. @@
 END$$;
 
--- Create users table with proper auth integration
+-- Create users table with proper auth integration
 CREATE TABLE IF NOT EXISTS users (
   id uuid PRIMARY KEY REFERENCES auth.users(id),
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on users table
+-- Enable RLS on users table
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 
--- Create accounts table
+-- Create accounts table
 CREATE TABLE IF NOT EXISTS accounts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on accounts table
+-- Enable RLS on accounts table
 ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
 
--- Create transactions table
+-- Create transactions table
 CREATE TABLE IF NOT EXISTS transactions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on transactions table
+-- Enable RLS on transactions table
 ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
 
--- Create compliance_records table
+-- Create compliance_records table
 CREATE TABLE IF NOT EXISTS compliance_records (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on compliance_records table
+-- Enable RLS on compliance_records table
 ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
 
--- Create crypto_addresses table
+-- Create crypto_addresses table
 CREATE TABLE IF NOT EXISTS crypto_addresses (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   created_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on crypto_addresses table
+-- Enable RLS on crypto_addresses table
 ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;
 
--- Create bank_accounts table
+-- Create bank_accounts table
 CREATE TABLE IF NOT EXISTS bank_accounts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on bank_accounts table
+-- Enable RLS on bank_accounts table
 ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
 
--- Create wire_instructions table
+-- Create wire_instructions table
 CREATE TABLE IF NOT EXISTS wire_instructions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   created_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on wire_instructions table
+-- Enable RLS on wire_instructions table
 ALTER TABLE wire_instructions ENABLE ROW LEVEL SECURITY;
 
--- Create payments table
+-- Create payments table
 CREATE TABLE IF NOT EXISTS payments (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
--- Enable RLS on payments table
+-- Enable RLS on payments table
 ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
 
--- Create stripe_customers table
+-- Create stripe_customers table
 CREATE TABLE IF NOT EXISTS stripe_customers (
   id bigserial PRIMARY KEY,
@@ .. @@
   deleted_at timestamptz
 );
 
--- Enable RLS on stripe_customers table
+-- Enable RLS on stripe_customers table
 ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
 
--- Create stripe_subscriptions table
+-- Create stripe_subscriptions table
 CREATE TABLE IF NOT EXISTS stripe_subscriptions (
   id bigserial PRIMARY KEY,
@@ .. @@
   deleted_at timestamptz
 );
 
--- Enable RLS on stripe_subscriptions table
+-- Enable RLS on stripe_subscriptions table
 ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
 
--- Create stripe_orders table
+-- Create stripe_orders table
 CREATE TABLE IF NOT EXISTS stripe_orders (
   id bigserial PRIMARY KEY,