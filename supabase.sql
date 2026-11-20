create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  status text not null default 'To Do' check (status in ('To Do','In Progress','Completed')),
  due_date date,
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "Classroom demo read" on public.tasks for select to anon using (true);
create policy "Classroom demo insert" on public.tasks for insert to anon with check (true);
create policy "Classroom demo update" on public.tasks for update to anon using (true) with check (true);
create policy "Classroom demo delete" on public.tasks for delete to anon using (true);
