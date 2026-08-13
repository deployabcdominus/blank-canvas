# SEO Audit & Fixes - 2026-08-12

## Findings
1. **Sitemap Base URL Mismatch**: `robots.txt` and `sitemap.xml` used `signflowapp.lovable.app` instead of the primary domain `www.signflowapp.com`.
2. **Missing Alt Text**: Several components used empty or generic `alt` attributes on images, which hurts accessibility and SEO.
3. **Structured Data**: JSON-LD was present but limited in scope.

## Corrected Issues
- [x] Updated `public/robots.txt` to point to the correct sitemap location on `www.signflowapp.com`.
- [x] Updated `public/sitemap.xml` entries to use the canonical domain (previously partially done, now verified).
- [x] Fixed `src/components/work-orders/ProductionSheetModal.tsx` missing alt text for installation photos.
- [x] Hardened `src/components/StorageImage.tsx` and `src/components/ImageWithFallback.tsx` to ensure `alt` attributes are never omitted.
- [x] Improved accessibility in `src/pages/Settings.tsx`, `src/pages/PrintPage.tsx`, and `src/pages/ProposalApproval.tsx` by using safe dynamic company names in alt text.
- [x] Verified remaining `alt` attributes in `src/components/work-orders/ProductionSheetModal.tsx` and `src/components/work-orders/QCSignaturePad.tsx`.

## Verified
- Indexing rules in `robots.txt`.
- Canonical tags in `index.html`.
- Image accessibility across the Tenant Admin and Public Proposal views.
