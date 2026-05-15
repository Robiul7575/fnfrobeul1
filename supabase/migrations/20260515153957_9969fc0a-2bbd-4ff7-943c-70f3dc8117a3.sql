CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  action TEXT NOT NULL,
  chemist_name TEXT,
  chemist_code TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  payment_mode TEXT,
  snapshot JSONB,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (invoice_number, action)
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invoices"
  ON public.invoices FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update invoices"
  ON public.invoices FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete invoices"
  ON public.invoices FOR DELETE
  USING (true);

CREATE INDEX idx_invoices_saved_at ON public.invoices (saved_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;