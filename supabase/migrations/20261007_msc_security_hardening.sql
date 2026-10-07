-- MSC Safety security hardening and least-privilege baseline.
-- Designed to be portable to the future standalone MSC Safety Supabase project.

-- HR / payroll
drop policy if exists msc_erp_read on public.msc_employees;
drop policy if exists msc_erp_write on public.msc_employees;
drop policy if exists msc_hr_read on public.msc_employees;
drop policy if exists msc_hr_write on public.msc_employees;
create policy msc_hr_read on public.msc_employees
for select to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = any(array['admin','supervisor','lectura']));
create policy msc_hr_write on public.msc_employees
for all to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin')
with check (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin');

drop policy if exists msc_erp_read on public.msc_employment_contracts;
drop policy if exists msc_erp_write on public.msc_employment_contracts;
drop policy if exists msc_hr_read on public.msc_employment_contracts;
drop policy if exists msc_hr_write on public.msc_employment_contracts;
create policy msc_hr_read on public.msc_employment_contracts
for select to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = any(array['admin','supervisor','lectura']));
create policy msc_hr_write on public.msc_employment_contracts
for all to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin')
with check (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin');

drop policy if exists msc_erp_read on public.msc_leave_requests;
drop policy if exists msc_erp_write on public.msc_leave_requests;
drop policy if exists msc_hr_read on public.msc_leave_requests;
drop policy if exists msc_hr_write on public.msc_leave_requests;
create policy msc_hr_read on public.msc_leave_requests
for select to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = any(array['admin','supervisor','lectura']));
create policy msc_hr_write on public.msc_leave_requests
for all to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin')
with check (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin');

drop policy if exists msc_erp_read on public.msc_payroll_periods;
drop policy if exists msc_erp_write on public.msc_payroll_periods;
drop policy if exists msc_payroll_read on public.msc_payroll_periods;
drop policy if exists msc_payroll_write on public.msc_payroll_periods;
create policy msc_payroll_read on public.msc_payroll_periods
for select to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = any(array['admin','supervisor','lectura']));
create policy msc_payroll_write on public.msc_payroll_periods
for all to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin')
with check (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin');

drop policy if exists msc_erp_read on public.msc_payroll_lines;
drop policy if exists msc_erp_write on public.msc_payroll_lines;
drop policy if exists msc_payroll_read on public.msc_payroll_lines;
drop policy if exists msc_payroll_write on public.msc_payroll_lines;
create policy msc_payroll_read on public.msc_payroll_lines
for select to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = any(array['admin','supervisor','lectura']));
create policy msc_payroll_write on public.msc_payroll_lines
for all to authenticated
using (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin')
with check (((auth.jwt()->'app_metadata'->>'msc_role')) = 'admin');

-- Sales order lines
drop policy if exists msc_read on public.msc_sales_order_lines;
drop policy if exists msc_write on public.msc_sales_order_lines;
drop policy if exists msc_sales_order_lines_read on public.msc_sales_order_lines;
drop policy if exists msc_sales_order_lines_write on public.msc_sales_order_lines;
create policy msc_sales_order_lines_read on public.msc_sales_order_lines
for select to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega','supervisor','lectura']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1 from public.msc_sales_orders so
      where so.id = msc_sales_order_lines.sales_order_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);
create policy msc_sales_order_lines_write on public.msc_sales_order_lines
for all to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1 from public.msc_sales_orders so
      where so.id = msc_sales_order_lines.sales_order_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
)
with check (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1 from public.msc_sales_orders so
      where so.id = msc_sales_order_lines.sales_order_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);

-- Dispatch visibility
drop policy if exists msc_read on public.msc_dispatches;
drop policy if exists msc_dispatches_read on public.msc_dispatches;
create policy msc_dispatches_read on public.msc_dispatches
for select to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega','supervisor','lectura']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1 from public.msc_sales_orders so
      where so.id = msc_dispatches.sales_order_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);

drop policy if exists msc_read on public.msc_dispatch_lines;
drop policy if exists msc_dispatch_lines_read on public.msc_dispatch_lines;
create policy msc_dispatch_lines_read on public.msc_dispatch_lines
for select to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega','supervisor','lectura']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1
      from public.msc_dispatches d
      join public.msc_sales_orders so on so.id=d.sales_order_id
      where d.id = msc_dispatch_lines.dispatch_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);

-- Order events
drop policy if exists msc_order_events_read on public.msc_order_events;
create policy msc_order_events_read on public.msc_order_events
for select to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega','supervisor','lectura','transportista']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1 from public.msc_sales_orders so
      where so.id = msc_order_events.sales_order_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);

-- Documents and document lines
drop policy if exists msc_documents_read on public.msc_documents;
create policy msc_documents_read on public.msc_documents
for select to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega','supervisor','lectura']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and sales_order_id is not null
    and exists (
      select 1 from public.msc_sales_orders so
      where so.id = msc_documents.sales_order_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);

drop policy if exists msc_lines_read on public.msc_document_lines;
drop policy if exists msc_document_lines_read on public.msc_document_lines;
create policy msc_document_lines_read on public.msc_document_lines
for select to authenticated
using (
  ((auth.jwt()->'app_metadata'->>'msc_role') = any(array['admin','bodega','supervisor','lectura']))
  or (
    (auth.jwt()->'app_metadata'->>'msc_role')='ventas'
    and exists (
      select 1
      from public.msc_documents d
      join public.msc_sales_orders so on so.id=d.sales_order_id
      where d.id = msc_document_lines.document_id
        and coalesce(so.seller_user_id,so.created_by)=auth.uid()
    )
  )
);

-- Defense in depth: anonymous role has no direct privileges on MSC operational tables.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename
    from pg_tables
    where schemaname='public' and tablename like 'msc\_%' escape '\'
  loop
    execute format('revoke all privileges on table %I.%I from anon', r.schemaname, r.tablename);
  end loop;
end $$;
