
-- 1. Drop the blanket anon SELECT policy
DROP POLICY IF EXISTS "Anyone can validate invitation by token" ON public.invitations;

-- 2. Create a SECURITY DEFINER RPC that returns only the matching valid invitation
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token uuid)
RETURNS TABLE(
  id uuid,
  company_id uuid,
  email text,
  role text,
  token uuid,
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.company_id, i.email, i.role, i.token, i.expires_at, i.accepted_at
  FROM public.invitations i
  WHERE i.token = p_token
  LIMIT 1;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(uuid) TO anon, authenticated;
