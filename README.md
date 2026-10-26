# RouteNest — Transport & Logistics

RouteNest is a Next.js application built from the existing transport-route project. It preserves the route search, sign-in/sign-up, booking preview, payment-method preview and EcoScore calculator, and adds bus/metro timetable browsing, parcel/cargo fare estimates, shipment requests and private shipment tracking.

## Setup

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local`.
3. In Supabase Project Settings → API, copy the project URL and publishable/anon key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Use only the publishable/anon key. Never put a `service_role` or secret key in browser variables or share it publicly.

4. In a terminal in this project folder run:

```bash
npm install
npm run dev
```

5. Open `http://localhost:3001`.

## Pages

- `/` — route search using the existing Supabase route API
- `/login` — Supabase sign-in and sign-up
- `/booking` — existing booking-flow preview (not a confirmed ticket reservation)
- `/payment` — existing payment-method preview (no money is charged)
- `/ecoscore` — emissions comparison calculator
- `/schedules` — bus and metro timetables from `transit_schedules` and `transit_stop_times`
- `/logistics` — parcel/cargo fare estimate and authenticated shipment request
- `/tracking` — list shipments owned by the signed-in user and read status history

## Important integration notes

- Sample schedules and sample fare rules are demo data; they are not official operator timetables or guaranteed prices.
- The logistics distance is currently entered by the user as an estimate. Real distance/geocoding and courier-provider integration are not included.
- Creating a shipment stores a request in Supabase. It does not dispatch a courier or confirm real-world delivery.
- Booking and payment pages remain previews; live ticketing and payment processing need provider integration.
- Shipment APIs validate the signed-in user with Supabase Auth and use the user's access token for row-level security. Keep RLS enabled and do not add a service-role key to the frontend.
- The shipment POST API requires the `calculate_logistics_fare` RPC and insert permission for authenticated users on `logistics_shipments`. If the insert is rejected by RLS, configure an authenticated insert policy that checks `user_id = auth.uid()` after reviewing your schema. Do not disable RLS.

## Existing database assumptions

This version expects the tables already set up in your Supabase project: `routes`, `stops`, `fare_rules`, `transit_schedules`, `transit_stop_times`, `logistics_fare_rules`, `logistics_shipments`, and `logistics_status_history`, plus the `calculate_logistics_fare` function. It does not drop or recreate existing tables.

## One-time shipment RLS migration

Before creating shipment requests, open Supabase SQL Editor and run `supabase/routeNest_shipment_access.sql`. This adds an authenticated insert policy limited to the signed-in user's own `user_id`, and updates the trusted status-history trigger function so the trigger can record status changes without exposing direct history writes. Keep the existing own-shipment and own-history SELECT policies enabled.
