# MSC Safety — security and migration baseline

This prototype is temporary inside Núcleo Vivo. Treat it as a staging environment for the future standalone MSC Safety platform.

## Non-negotiable security baseline

- No operational MSC table may be readable by the anonymous role.
- All private tables must keep RLS enabled.
- Seller access is row-scoped to the seller's own orders and related logistics/documents.
- HR and payroll data are restricted to admin/supervisor/read-only management roles; write access is admin-only.
- Uploaded commercial documents live only in a private Storage bucket. The current `msc-documents` bucket is private and PDF-only.
- No service-role key, AI secret, password, or privileged token may be shipped to browser JavaScript.
- Private routes and APIs must be noindex, non-cacheable, frame-protected, and served only over HTTPS.
- Preview deployments stay behind Vercel authentication. Custom production domains remain public only for intended public pages.
- Sensitive actions must be attributable in `msc_audit_log`.
- Development/testing uses fictitious or minimized personal data where possible.

## Migration rule

Before moving from nucleovivo.net to the final MSC Safety domain/project:

1. Create a dedicated Vercel project and a dedicated Supabase project.
2. Apply all MSC schema migrations, including `20261007_msc_security_hardening.sql`.
3. Recreate roles and users; never copy auth secrets.
4. Create private Storage buckets and migrate documents server-side.
5. Rotate every API key and secret.
6. Point the frontend only to the new Supabase project.
7. Run RLS tests for admin, ventas, bodega, supervisor, lectura, transportista, customer and anonymous roles.
8. Confirm that anonymous requests return no operational rows.
9. Verify security headers, TLS, robots/noindex for private routes, backups, logs, recovery and incident procedures.
10. Only then redirect or attach the final MSC Safety domain.

## Current prototype status

The MSC database already has RLS enabled across the MSC tables. Security hardening further scopes seller rows, protects HR/payroll, removes anonymous table privileges, and keeps uploaded MSC documents in a private bucket.

This file is an engineering control record, not a replacement for legal/privacy documentation.
