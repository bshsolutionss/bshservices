-- BSH Solutions — Project extras: service category, description, archiving.
-- Run this once in the Supabase Dashboard → SQL Editor, after 0002_pipeline.sql.
-- Safe to re-run.

alter table public.projects add column if not exists service_category text
  check (service_category in ('Development', 'Designing', 'Marketing', 'Photography', 'AI Services'));
alter table public.projects add column if not exists description text;
alter table public.projects add column if not exists archived boolean not null default false;

create index if not exists projects_archived_idx on public.projects (archived);

-- Re-create the won-conversion function so newly auto-created projects carry
-- the lead's service_category over (CREATE OR REPLACE — same function,
-- same signature, just one more populated column on insert).
create or replace function public.convert_lead_to_client_and_project(p_lead_id uuid)
returns table(out_client_id uuid, out_project_id uuid, client_created boolean, project_created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_client_id uuid;
  v_project_id uuid;
  v_client_created boolean := false;
  v_project_created boolean := false;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead % not found', p_lead_id;
  end if;

  if v_lead.client_id is not null then
    v_client_id := v_lead.client_id;
  else
    select id into v_client_id from public.clients
      where lower(contact_email) = lower(v_lead.email) limit 1;
    if v_client_id is null then
      insert into public.clients (company_name, contact_email, contact_phone, industry, converted_from_lead_id)
      values (coalesce(v_lead.business, v_lead.name), v_lead.email, v_lead.phone, v_lead.business_type, v_lead.id)
      returning id into v_client_id;
      v_client_created := true;
    end if;
    update public.leads set client_id = v_client_id where id = p_lead_id;
  end if;

  select id into v_project_id from public.projects where lead_id = p_lead_id limit 1;
  if v_project_id is null then
    insert into public.projects (name, client_id, lead_id, stage, budget, service_category)
    values (
      coalesce(v_lead.selected_service, v_lead.service_category, 'New Project')
        || ' — ' || coalesce(v_lead.business, v_lead.name),
      v_client_id, p_lead_id, 'planning', v_lead.expected_value, v_lead.service_category
    )
    returning id into v_project_id;
    v_project_created := true;
  end if;

  return query select v_client_id, v_project_id, v_client_created, v_project_created;
end;
$$;

-- Function grants aren't reset by CREATE OR REPLACE when the signature is
-- unchanged, but re-asserting this is cheap and keeps the migration
-- self-contained/idempotent regardless.
revoke execute on function public.convert_lead_to_client_and_project(uuid) from public, anon, authenticated;
