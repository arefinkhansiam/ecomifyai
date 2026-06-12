# Security Memory

## App
Ecomify AI — AR/Try-On platform. Vendors upload products; shoppers view via public embed widget.

## Invariants
- `ar_products.embed_token` is a secret. Anon role MUST NOT have column SELECT on it. Owners read it via the "Users view own products" policy (authenticated keeps column grant).
- Public `ar_products` SELECT policy is scoped to `anon` only.
- `tryon_events` inserts are server-side only (supabaseAdmin in `/api/public/tryon-event`). No client INSERT policy needed; do not flag missing INSERT policy.
- Public widget/webhook routes live under `/api/public/*` and use supabaseAdmin with input validation.

## Auth
- Leaked password protection (HIBP) enabled.
- Anonymous sign-ins disabled.
