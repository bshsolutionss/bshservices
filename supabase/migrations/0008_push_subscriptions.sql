-- Web Push subscriptions for admin-panel staff — "new lead" / "new booking"
-- notifications. Admin-only by design: there are no public customer
-- accounts on this site to target with push, so this table is written and
-- read exclusively via the service-role client from admin-authenticated API
-- routes (see lib/push.ts, app/api/admin/push/subscription/route.ts).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text
);

-- Same default-deny RLS posture as every other table in this project: RLS
-- is enabled with zero policies granted to anon/authenticated, so only the
-- service-role client (server-side only) can read or write.
alter table public.push_subscriptions enable row level security;
