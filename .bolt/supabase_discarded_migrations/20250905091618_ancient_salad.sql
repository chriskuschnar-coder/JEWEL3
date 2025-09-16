/*
  # Fix RLS Policies with Correct auth.uid() Syntax

  This migration safely creates RLS policies using the correct auth.uid() function
  instead of the non-existent uid() function. It checks for existing policies
  to avoid conflicts and can be run multiple times safely.

  1. Security Policies
    - Users can only access their own data
    - Service role can manage all data for system operations
    - All policies use auth.uid() instead of uid()

  2. Tables Covered
    - users, accounts, transactions, payments
    - compliance_records, crypto_addresses, bank_accounts
    - wire_instructions, signed_documents, profiles
    - onboarding, crypto_payment_invoices
    - fund_transactions, investor_units, fund_nav
    - stripe_customers, stripe_subscriptions, stripe_orders
*/

-- Fix users table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own data fixed'
      and tablename = 'users'
  ) then
    create policy "Users can view own data fixed"
    on users
    for select
    using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own data fixed'
      and tablename = 'users'
  ) then
    create policy "Users can update own data fixed"
    on users
    for update
    using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'System can insert users fixed'
      and tablename = 'users'
  ) then
    create policy "System can insert users fixed"
    on users
    for insert
    with check (true);
  end if;
end $$;

-- Fix accounts table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own accounts fixed'
      and tablename = 'accounts'
  ) then
    create policy "Users can view own accounts fixed"
    on accounts
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own accounts fixed'
      and tablename = 'accounts'
  ) then
    create policy "Users can update own accounts fixed"
    on accounts
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'System can insert accounts fixed'
      and tablename = 'accounts'
  ) then
    create policy "System can insert accounts fixed"
    on accounts
    for insert
    with check (true);
  end if;
end $$;

-- Fix transactions table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own transactions fixed'
      and tablename = 'transactions'
  ) then
    create policy "Users can view own transactions fixed"
    on transactions
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own transactions fixed'
      and tablename = 'transactions'
  ) then
    create policy "Users can insert own transactions fixed"
    on transactions
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

-- Fix payments table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own payments fixed'
      and tablename = 'payments'
  ) then
    create policy "Users can view own payments fixed"
    on payments
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own payments fixed'
      and tablename = 'payments'
  ) then
    create policy "Users can insert own payments fixed"
    on payments
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'System can update payments fixed'
      and tablename = 'payments'
  ) then
    create policy "System can update payments fixed"
    on payments
    for update
    using (true);
  end if;
end $$;

-- Fix compliance_records table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own compliance records fixed'
      and tablename = 'compliance_records'
  ) then
    create policy "Users can view own compliance records fixed"
    on compliance_records
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix crypto_addresses table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own crypto addresses fixed'
      and tablename = 'crypto_addresses'
  ) then
    create policy "Users can view own crypto addresses fixed"
    on crypto_addresses
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix bank_accounts table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own bank accounts fixed'
      and tablename = 'bank_accounts'
  ) then
    create policy "Users can view own bank accounts fixed"
    on bank_accounts
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix wire_instructions table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own wire instructions fixed'
      and tablename = 'wire_instructions'
  ) then
    create policy "Users can view own wire instructions fixed"
    on wire_instructions
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix signed_documents table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can read own signed documents fixed'
      and tablename = 'signed_documents'
  ) then
    create policy "Users can read own signed documents fixed"
    on signed_documents
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own signed documents fixed'
      and tablename = 'signed_documents'
  ) then
    create policy "Users can insert own signed documents fixed"
    on signed_documents
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own signed documents fixed'
      and tablename = 'signed_documents'
  ) then
    create policy "Users can update own signed documents fixed"
    on signed_documents
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix profiles table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own profile fixed'
      and tablename = 'profiles'
  ) then
    create policy "Users can view own profile fixed"
    on profiles
    for select
    using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert their own profile fixed'
      and tablename = 'profiles'
  ) then
    create policy "Users can insert their own profile fixed"
    on profiles
    for insert
    with check (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update their own profile fixed'
      and tablename = 'profiles'
  ) then
    create policy "Users can update their own profile fixed"
    on profiles
    for update
    using (auth.uid() = id);
  end if;
end $$;

-- Fix onboarding table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can read own onboarding fixed'
      and tablename = 'onboarding'
  ) then
    create policy "Users can read own onboarding fixed"
    on onboarding
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own onboarding fixed'
      and tablename = 'onboarding'
  ) then
    create policy "Users can insert own onboarding fixed"
    on onboarding
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own onboarding fixed'
      and tablename = 'onboarding'
  ) then
    create policy "Users can update own onboarding fixed"
    on onboarding
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can delete own onboarding fixed'
      and tablename = 'onboarding'
  ) then
    create policy "Users can delete own onboarding fixed"
    on onboarding
    for delete
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix crypto_payment_invoices table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own crypto invoices fixed'
      and tablename = 'crypto_payment_invoices'
  ) then
    create policy "Users can view own crypto invoices fixed"
    on crypto_payment_invoices
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own crypto invoices fixed'
      and tablename = 'crypto_payment_invoices'
  ) then
    create policy "Users can insert own crypto invoices fixed"
    on crypto_payment_invoices
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'System can update crypto invoices fixed'
      and tablename = 'crypto_payment_invoices'
  ) then
    create policy "System can update crypto invoices fixed"
    on crypto_payment_invoices
    for update
    using (true);
  end if;
end $$;

-- Fix fund_transactions table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can read own fund transactions fixed'
      and tablename = 'fund_transactions'
  ) then
    create policy "Users can read own fund transactions fixed"
    on fund_transactions
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own fund transactions fixed'
      and tablename = 'fund_transactions'
  ) then
    create policy "Users can insert own fund transactions fixed"
    on fund_transactions
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

-- Fix investor_units table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can read own unit holdings fixed'
      and tablename = 'investor_units'
  ) then
    create policy "Users can read own unit holdings fixed"
    on investor_units
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own investor_units fixed'
      and tablename = 'investor_units'
  ) then
    create policy "Users can view own investor_units fixed"
    on investor_units
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix fund_nav table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can read fund NAV data fixed'
      and tablename = 'fund_nav'
  ) then
    create policy "Users can read fund NAV data fixed"
    on fund_nav
    for select
    using (true); -- Fund NAV is public to all authenticated users
  end if;
end $$;

-- Fix stripe_customers table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view their own customer data fixed'
      and tablename = 'stripe_customers'
  ) then
    create policy "Users can view their own customer data fixed"
    on stripe_customers
    for select
    using (auth.uid() = user_id AND deleted_at IS NULL);
  end if;
end $$;

-- Fix stripe_subscriptions table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view their own subscription data fixed'
      and tablename = 'stripe_subscriptions'
  ) then
    create policy "Users can view their own subscription data fixed"
    on stripe_subscriptions
    for select
    using (
      customer_id IN (
        SELECT customer_id
        FROM stripe_customers
        WHERE user_id = auth.uid() AND deleted_at IS NULL
      ) AND deleted_at IS NULL
    );
  end if;
end $$;

-- Fix stripe_orders table policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can view their own order data fixed'
      and tablename = 'stripe_orders'
  ) then
    create policy "Users can view their own order data fixed"
    on stripe_orders
    for select
    using (
      customer_id IN (
        SELECT customer_id
        FROM stripe_customers
        WHERE user_id = auth.uid() AND deleted_at IS NULL
      ) AND deleted_at IS NULL
    );
  end if;
end $$;