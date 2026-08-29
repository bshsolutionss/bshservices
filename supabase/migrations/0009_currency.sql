-- Currency support — PKR is the business's standard/default currency
-- everywhere; Invoices remain free to be billed in any of the four
-- supported currencies (USD/PKR/CAD/AUD) per client. Dashboard KPIs convert
-- everything to one PKR figure using these manually-maintained rates rather
-- than a live FX feed — see lib/currency.ts, /admin (Settings → Exchange
-- Rates) and app/api/admin/settings/exchange-rates/route.ts.
-- Run this once in the Supabase Dashboard → SQL Editor. Safe to re-run.

create table if not exists public.exchange_rates (
  currency text primary key check (currency in ('USD', 'PKR', 'CAD', 'AUD')),
  -- How many PKR one unit of `currency` is worth, e.g. USD -> 278 means $1 = PKR 278.
  rate_to_pkr numeric not null check (rate_to_pkr > 0),
  updated_at timestamptz not null default now()
);

-- Starting values only — these are approximate and WILL drift from the real
-- market rate over time. Update them from /admin's Exchange Rates screen;
-- `on conflict do nothing` means re-running this migration never clobbers a
-- rate you've since edited there.
insert into public.exchange_rates (currency, rate_to_pkr) values
  ('PKR', 1),
  ('USD', 278),
  ('CAD', 205),
  ('AUD', 183)
on conflict (currency) do nothing;

alter table public.exchange_rates enable row level security;

-- Projects: budget had no currency at all before this — every amount
-- defaulted to an implicit, unlabeled "$". Existing rows backfill to PKR
-- (the business standard) since that's the more likely reality for
-- historical local projects than USD.
alter table public.projects add column if not exists currency text not null default 'PKR'
  check (currency in ('USD', 'PKR', 'CAD', 'AUD'));

-- Leads: expected_value's currency. Defaults to USD because the automated
-- lead-scorer (lib/lead-scoring.ts) derives its estimates from
-- lib/pricing-data.ts's GLOBAL (USD) tiers — this default keeps existing
-- auto-scored rows correctly labeled. Admin can switch a specific lead to
-- PKR manually when it's actually a local-currency deal.
alter table public.leads add column if not exists expected_value_currency text not null default 'USD'
  check (expected_value_currency in ('USD', 'PKR', 'CAD', 'AUD'));
