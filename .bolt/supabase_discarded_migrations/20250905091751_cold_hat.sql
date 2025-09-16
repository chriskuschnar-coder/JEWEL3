/*
  # Clean RLS Policies Migration

  This migration creates only the missing RLS policies using correct auth.uid() syntax.
  Skips policies that already exist to avoid conflicts.

  1. Security Policies
    - Creates missing policies with proper auth.uid() syntax
    - Skips existing policies to prevent errors
    - Maintains proper access control
*/

-- Fix compliance_records policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own compliance records'
      and tablename = 'compliance_records'
  ) then
    create policy "Users can insert own compliance records"
    on compliance_records
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own compliance records'
      and tablename = 'compliance_records'
  ) then
    create policy "Users can update own compliance records"
    on compliance_records
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix crypto_addresses policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own crypto addresses'
      and tablename = 'crypto_addresses'
  ) then
    create policy "Users can insert own crypto addresses"
    on crypto_addresses
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own crypto addresses'
      and tablename = 'crypto_addresses'
  ) then
    create policy "Users can update own crypto addresses"
    on crypto_addresses
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix bank_accounts policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own bank accounts'
      and tablename = 'bank_accounts'
  ) then
    create policy "Users can insert own bank accounts"
    on bank_accounts
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own bank accounts'
      and tablename = 'bank_accounts'
  ) then
    create policy "Users can update own bank accounts"
    on bank_accounts
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix wire_instructions policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own wire instructions'
      and tablename = 'wire_instructions'
  ) then
    create policy "Users can insert own wire instructions"
    on wire_instructions
    for insert
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own wire instructions'
      and tablename = 'wire_instructions'
  ) then
    create policy "Users can update own wire instructions"
    on wire_instructions
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix crypto_payment_invoices policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own crypto invoices'
      and tablename = 'crypto_payment_invoices'
  ) then
    create policy "Users can update own crypto invoices"
    on crypto_payment_invoices
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can delete own crypto invoices'
      and tablename = 'crypto_payment_invoices'
  ) then
    create policy "Users can delete own crypto invoices"
    on crypto_payment_invoices
    for delete
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix payments policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own payments'
      and tablename = 'payments'
  ) then
    create policy "Users can update own payments"
    on payments
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can delete own payments'
      and tablename = 'payments'
  ) then
    create policy "Users can delete own payments"
    on payments
    for delete
    using (auth.uid() = user_id);
  end if;
end $$;

-- Fix fund_transactions policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own fund transactions'
      and tablename = 'fund_transactions'
  ) then
    create policy "Users can update own fund transactions"
    on fund_transactions
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users can delete own fund transactions'
      and tablename = 'fund_transactions'
  ) then
    create policy "Users can delete own fund transactions"
    on fund_transactions
    for delete
    using (auth.uid() = user_id);
  end if;
end $$;