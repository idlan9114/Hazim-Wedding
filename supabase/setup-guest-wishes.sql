-- Run once in your Supabase project's SQL Editor. Safe to run again.
begin;

create table if not exists public.guest_wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  message text not null check (char_length(btrim(message)) between 5 and 300),
  created_at timestamptz not null default now()
);

create index if not exists guest_wishes_created_at_idx
  on public.guest_wishes (created_at desc, id desc);

alter table public.guest_wishes enable row level security;

-- Guests may read wishes and submit a name/message, but cannot edit/delete wishes
-- or supply their own timestamps. No account or sign-in is required.
revoke all on public.guest_wishes from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.guest_wishes to anon, authenticated;
grant insert (name, message) on public.guest_wishes to anon, authenticated;

drop policy if exists "Guests can read wishes" on public.guest_wishes;
create policy "Guests can read wishes"
  on public.guest_wishes for select to anon, authenticated
  using (true);

drop policy if exists "Guests can submit wishes" on public.guest_wishes;
create policy "Guests can submit wishes"
  on public.guest_wishes for insert to anon, authenticated
  with check (
    name = btrim(name) and message = btrim(message)
    and char_length(name) between 2 and 80
    and char_length(message) between 5 and 300
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'guest_wishes'
  ) then
    alter publication supabase_realtime add table public.guest_wishes;
  end if;
end $$;

commit;
