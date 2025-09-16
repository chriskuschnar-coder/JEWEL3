/*
  # Fix Existing RLS Policies with Incorrect uid() Function

  This migration fixes the existing policies that use `uid()` instead of `auth.uid()`.
  It drops the broken policies and recreates them with correct syntax.

  ## What This Fixes
  - Users table: "Users can view own data" policy
  - Accounts table: "Users can view own accounts" policy  
  - Transactions table: "Users can view own transactions" policy
  - Any other policies using incorrect `uid()` function

  ## Safety
  - Only touches policies that are actually broken
  - Preserves all existing data and table structure
  - Uses bulletproof DO blocks to prevent conflicts
*/

-- Fix users table policy
do $$
begin
  -- Drop the broken policy if it exists
  if exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own data'
      and tablename = 'users'
  ) then
    drop policy "Users can view own data" on users;
  end if;

  -- Create the fixed policy
  create policy "Users can view own data"
  on users
  for select
  using (auth.uid() = id);
end $$;

-- Fix accounts table policies
do $$
begin
  -- Drop broken policies if they exist
  if exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own accounts'
      and tablename = 'accounts'
  ) then
    drop policy "Users can view own accounts" on accounts;
  end if;

  if exists (
    select 1
    from pg_policies
    where policyname = 'Users can update own accounts'
      and tablename = 'accounts'
  ) then
    drop policy "Users can update own accounts" on accounts;
  end if;

  -- Create fixed policies
  create policy "Users can view own accounts"
  on accounts
  for select
  using (auth.uid() = user_id);

  create policy "Users can update own accounts"
  on accounts
  for update
  using (auth.uid() = user_id);
end $$;

-- Fix transactions table policies
do $$
begin
  -- Drop broken policies if they exist
  if exists (
    select 1
    from pg_policies
    where policyname = 'Users can view own transactions'
      and tablename = 'transactions'
  ) then
    drop policy "Users can view own transactions" on transactions;
  end if;

  if exists (
    select 1
    from pg_policies
    where policyname = 'Users can insert own transactions'
      and tablename = 'transactions'
  ) then
    drop policy "Users can insert own transactions" on transactions;
  end if;

  -- Create fixed policies
  create policy "Users can view own transactions"
  on transactions
  for select
  using (auth.uid() = user_id);

  create policy "Users can insert own transactions"
  on transactions
  for insert
  with check (auth.uid() = user_id);
end $$;

-- Fix any other tables with broken uid() policies
do $$
begin
  -- Fix compliance_records if needed
  if exists (
    select 1
    from pg_policies
    where tablename = 'compliance_records'
      and qual like '%uid()%'
  ) then
    drop policy if exists "Users can view own compliance records" on compliance_records;
    
    create policy "Users can view own compliance records"
    on compliance_records
    for select
    using (auth.uid() = user_id);
  end if;

  -- Fix bank_accounts if needed
  if exists (
    select 1
    from pg_policies
    where tablename = 'bank_accounts'
      and qual like '%uid()%'
  ) then
    drop policy if exists "Users can view own bank accounts" on bank_accounts;
    
    create policy "Users can view own bank accounts"
    on bank_accounts
    for select
    using (auth.uid() = user_id);
  end if;

  -- Fix wire_instructions if needed
  if exists (
    select 1
    from pg_policies
    where tablename = 'wire_instructions'
      and qual like '%uid()%'
  ) then
    drop policy if exists "Users can view own wire instructions" on wire_instructions;
    
    create policy "Users can view own wire instructions"
    on wire_instructions
    for select
    using (auth.uid() = user_id);
  end if;
end $$;