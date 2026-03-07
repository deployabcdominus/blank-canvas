
-- 1. Drop company_name from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS company_name;

-- 2. Update handle_new_user trigger to not insert company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- 3. Update companies UPDATE policy to allow any admin of that company
DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
CREATE POLICY "Company admins can update company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    id = get_user_company_id(auth.uid()) 
    AND is_company_admin(auth.uid())
  );

-- 4. Update companies SELECT to allow any member of the company
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
CREATE POLICY "Company members can view company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    id = get_user_company_id(auth.uid())
  );
