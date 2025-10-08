-- Tabla de usuarios para almacenar datos adicionales del perfil
-- Ejecuta este script en el SQL Editor de Supabase (Proyecto > SQL > New query) o con Supabase CLI

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  id_number text not null,
  full_name text not null,
  career text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz null
);

-- Restricción de dominio institucional
alter table public.users
  add constraint users_email_domain_chk check (email ilike '%@unab.edu.co');

-- Unicidad por correo e identificación
create unique index if not exists users_email_unique on public.users (email);
create unique index if not exists users_id_number_unique on public.users (id_number);

-- Habilitar RLS y políticas básicas para el dueño del registro
alter table public.users enable row level security;

create policy "Users can select own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own row"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- Trigger de inserción automática al crear usuario en auth.users usando metadata (id_number, full_name, career)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, id_number, full_name, career, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'id_number',''),
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'career',''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Asegurar trigger para nuevas cuentas
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Privilegios para rol authenticated (respetando RLS)
grant select, insert, update on table public.users to authenticated;
-- Lectura para visitantes (anon) y política de lectura pública
grant select on table public.users to anon;
create policy "Lectura pública de perfiles"
  on public.users for select
  using (true);