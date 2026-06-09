-- Remove permissive public policies
DROP POLICY IF EXISTS "Anyone can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can update invoices" ON public.invoices;

-- Revoke Data API access; only service_role (edge functions) may touch this table
REVOKE ALL ON public.invoices FROM anon;
REVOKE ALL ON public.invoices FROM authenticated;
GRANT ALL ON public.invoices TO service_role;

-- RLS stays enabled; with no policies, anon/authenticated are fully denied
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Stop broadcasting invoice changes over Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.invoices;
