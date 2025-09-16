-- =============================================================================
-- SUPABASE DATABASE STATE AUDIT
-- =============================================================================
-- Run these queries in your Supabase SQL Editor to audit current state
-- DO NOT run any migrations until we analyze the results

-- 1. List all tables in the public schema
SELECT 
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all functions in public schema
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type,
  prosrc as source_code
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;

-- 3. List all triggers
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE NOT tgisinternal
ORDER BY tgrelid::regclass, tgname;

-- 4. List ALL RLS policies with full details
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. List all foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 7. Check for any policies using uid() instead of auth.uid()
SELECT 
  tablename,
  policyname,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual LIKE '%uid()%' 
    OR with_check LIKE '%uid()%'
  )
ORDER BY tablename, policyname;

-- =============================================================================
-- COPY AND PASTE THESE RESULTS TO BOLT FOR ANALYSIS
-- =============================================================================