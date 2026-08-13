-- Extend the activities timeline to cover invoice edits and payment removal,
-- added alongside the admin-panel-wide CRUD (delete/edit) pass.
alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost',
    'booking_cancelled', 'invoice_updated', 'payment_deleted'
  ));
