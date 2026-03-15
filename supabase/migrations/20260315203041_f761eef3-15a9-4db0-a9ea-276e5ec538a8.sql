
-- Allow anonymous users to read company name/logo for public proposal page
CREATE POLICY "Public can view company branding"
  ON public.companies
  FOR SELECT
  TO anon
  USING (true);
