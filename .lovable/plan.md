# Security Hardening Plan

This plan addresses a list of security issues identified in a previous audit, focusing on making the application production-ready by hardening storage, API endpoints, and data access.

## User Review Required

> [!IMPORTANT]
> Some hardening measures involve breaking changes that require careful confirmation:
> 1. **Private Storage Buckets**: Changing `signatures`, `work-order-blueprints`, `poi-photos`, and `proposal-mockups` to private will require updating all frontend code to use `createSignedUrl()` instead of `getPublicUrl()`.
> 2. **Token Encryption**: Encrypting sensitive integration tokens in the database.
> 3. **Production Order POI Access**: Further narrowing public access to production order data during proof-of-installation (POI) workflows.

## Proposed Changes

### Database & RLS Hardening

#### [RLS] Hardening `production_orders` for POI
- Create a `SECURITY DEFINER` function `get_poi_order_by_token` that validates a POI token and returns only the necessary fields for the technician (client, project, order ID).
- Remove direct public SELECT access to `production_orders` based on `poi_token`.

#### [Security] Token Encryption for Integrations
- Enable the `pgcrypto` extension.
- Update the `integrations` table to store `access_token` and `refresh_token` as encrypted `bytea`.
- Create a `SECURITY DEFINER` function to handle decryption only for authorized users/Edge Functions.

#### [RLS] Realtime Security
- Add RLS policies for the `realtime.messages` table to ensure users can only subscribe to channels belonging to their `company_id`.

### Frontend Security

#### [Auth] Token Sanitization
- Audit and minimize usage of `localStorage` for sensitive data.
- Ensure `sessionStorage` is cleared on logout (already partially implemented).

#### [Storage] Transition to Signed URLs (Optional/Conditional)
- Prepare a utility to generate signed URLs for private buckets.
- Update components to request signed URLs for sensitive files (signatures, blueprints) instead of using public URLs.

## Technical Details

### POI Access Narrowing
```sql
CREATE OR REPLACE FUNCTION public.get_poi_order_by_token(p_token text)
RETURNS TABLE (id uuid, client text, project_name text) 
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT id, client, project_name 
  FROM production_orders 
  WHERE poi_token = p_token AND poi_token_exp > now();
END;
$$ LANGUAGE plpgsql;
```

### Encryption Utility
```sql
CREATE OR REPLACE FUNCTION public.encrypt_integration_token(p_token text) 
RETURNS bytea SECURITY DEFINER AS $$
BEGIN
  RETURN pgp_sym_encrypt(p_token, 'system_secret_key');
END;
$$ LANGUAGE plpgsql;
```
