# Easibie Platform Upgrade Plan

Applied on top of the current codebase. No rebuild.

---

## 1. Database Migrations

**`profiles` table — add columns**
- `ar_slots_used INTEGER DEFAULT 0`
- `user_sequence_number` — auto-assigned via sequence on signup trigger
- `is_free_trial_growth BOOLEAN DEFAULT FALSE`
- `phone TEXT`, `business_name TEXT`, `website_url TEXT`, `country TEXT`, `timezone TEXT`, `avatar_url TEXT`
- `notify_on_scan`, `notify_weekly_summary`, `notify_product_tips` (all BOOLEAN DEFAULT TRUE)

**`ar_products` table — add column**
- `ar_customization JSONB DEFAULT '{}'` (button colors, page bg, overlay, font, radius, shadow, accent, button text, default camera, show product name)

**New table: `ar_sessions`**
- Columns: `product_id`, `vendor_id`, `session_id`, `timestamp`, `user_agent`, `referrer`, `country`, `time_spent_seconds`, `camera_used`, `ar_mode`, `did_interact`, `did_close_manually`, `device_type`, `os_type`
- RLS: vendor can SELECT own; INSERT open (widget posts via edge fn with service role)
- GRANTs for authenticated + service_role

**Update `handle_new_user()` trigger**
- Assign `user_sequence_number` from sequence
- If seq ≤ 10: set plan='growth', `is_free_trial_growth=true`, `ar_product_limit=50`
- Else: plan='free', limit=1

**Update plan limits**
- Free=1, Starter=10, Growth=50

**Slot enforcement (DB-side)**
- Trigger on `ar_products` INSERT: increment `profiles.ar_slots_used`, reject if `>= ar_product_limit`
- No decrement on DELETE

---

## 2. AR Button & Page Customization (Dashboard)

**File:** `src/routes/_authenticated/dashboard.upload.tsx` + new product-edit route
- Add Color Customization panel — plan-gated:
  - **Free:** single solid Button Color picker
  - **Growth:** full 10-field panel (btn bg/text/border/hover, page bg, overlay UI, font color, radius slider 0–32, shadow toggle, accent, custom button text, default camera, show/hide product name)
- Live preview on right showing the AR page mockup with applied tokens
- Save to `ar_products.ar_customization`
- Starter plan: same as Free (solid color only) — clarify if needed

---

## 3. AR Slot Credit System

- Dashboard (`dashboard.index.tsx`): show "X of Y AR slots used (slots are permanent)" with progress bar + tooltip "Deleting an AR product does not recover your slot…"
- Upload flow blocks creation when `ar_slots_used >= ar_product_limit` with upgrade CTA
- Delete keeps row count down but slot count unchanged

---

## 4. Profile Page Rebuild

**File:** `src/routes/_authenticated/dashboard.settings.tsx` (or new `dashboard.profile.tsx`)

Sections A–F:
- **A Account Info**: avatar upload (Supabase `avatars` bucket), display name, email (read-only + change link), phone, business name, website, country, timezone
- **B Plan & Usage**: plan badge, slot progress, products created, embed installs, AR sessions this month, Upgrade CTA, billing history placeholder
- **C Notifications**: 3 toggles bound to profile columns
- **D Security**: change password (Supabase reset email), sessions placeholder, delete account (confirmation modal → server fn)
- **E Integrations**: Shopify/Woo connect buttons (placeholder), widget snippet
- **F Referral**: copy link + placeholder copy

Visual style matches premium gradient dashboard already in place.

---

## 5. AR Viewer Page

**File:** `src/routes/ar.view.$productId.tsx`
- Show product NAME only at top (no price)
- Front/Back camera toggle button
- Read `ar_customization` from product and apply: button colors, page bg, text colors, radius, accent, custom button text
- Honor `show_product_name` flag and `default_camera`

Widget (`public/widget.js`) updated to pass color overrides when launching.

---

## 6. Silent Growth Plan for First 10 Users

- Sequence assignment + auto-grant in `handle_new_user()` trigger
- Pricing page: when authenticated user is `is_free_trial_growth`, "Choose Growth" instantly activates without payment flow
- ZERO UI badge/banner about the promotion — completely silent
- Plan limit (50) and feature unlocks driven by existing `plan='growth'` checks

---

## 7. Customer Behaviour Analytics

**Tracking ingest — new edge function `track-ar-session`** (public, `verify_jwt=false`)
- POST endpoint, validates payload with Zod, geolocates IP via ipapi.co
- Inserts into `ar_sessions` using service role

**Widget updates (`public/widget.js`)**
- On AR open: generate session UUID, capture start time
- Track interactions (rotate/zoom events from model-viewer)
- On close/unload: POST full payload to edge function (sendBeacon)

**Dashboard page — new `dashboard.behaviour.tsx`**
- Plan-gated:
  - **Starter:** up to 100 sessions/product — session count, avg time, device split, country split, interaction rate
  - **Growth:** up to 1000 sessions + per-customer timeline + heatmap "Coming Soon" card + CSV export + "Generate Marketing Report" button
- Info tooltip with the customer-tracking explanation copy verbatim

**Marketing Report**
- Server function calls Lovable AI Gateway with `google/gemini-3-flash-preview` (replacing Claude — `LOVABLE_API_KEY` already provisioned, no Anthropic key needed)
- Aggregates sessions → prompt → returns plain-English report (best times, top devices/countries, engagement score, 3 recommendations)
- Display in modal with copy button

> Note: original brief asks for Claude `claude-sonnet-4-20250514`. Lovable AI Gateway does not currently expose Claude. Will use `google/gemini-3-flash-preview` unless you want to add an Anthropic API key.

---

## Technical Notes

- All schema changes in one migration, GRANTs included
- RLS: vendors see only their `ar_sessions`; widget writes via service role inside edge function only after basic validation
- All new server-side work uses `createServerFn` except `track-ar-session` (public HTTP) and AI report (server fn)
- Avatar uploads go to existing `avatars` bucket

---

## Open Questions

1. **AI provider for marketing report**: OK to use Lovable AI (Gemini) instead of Claude? Adds no cost/key setup.
2. **Starter plan customization**: brief specifies Free + Growth only. Should Starter get the simple single-color picker (same as Free) or the full Growth panel?
3. **Existing users**: should current users be retroactively numbered (first 10 by signup date get Growth free)?
