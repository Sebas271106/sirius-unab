-- ==============================================
-- SCRIPT COMPLETO: POSTS + MEDIA + LIKES + COMMENTS + STORAGE
-- Compatible con Supabase 2025 / Storage v3
-- ==============================================

create extension if not exists pgcrypto;

-- ==============================================
-- TABLA: posts
-- ==============================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz null,
  visibility text not null default 'public',
  comments_count int not null default 0,
  likes_count int not null default 0
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

alter table public.posts enable row level security;

create policy "Posts son públicos para lectura"
  on public.posts for select
  using (visibility = 'public');

create policy "Usuarios pueden crear sus propias publicaciones"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id);

create policy "Usuarios pueden actualizar sus publicaciones"
  on public.posts for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Usuarios pueden eliminar sus publicaciones"
  on public.posts for delete to authenticated
  using (auth.uid() = author_id);

-- Trigger para updated_at
create or replace function public.posts_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.posts_set_updated_at();

-- ==============================================
-- TABLA: post_media
-- ==============================================
create table if not exists public.post_media (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  url text not null,
  mime_type text not null,
  size_bytes int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists post_media_post_id_idx on public.post_media (post_id);

alter table public.post_media enable row level security;

create policy "Lectura pública de medios de posts"
  on public.post_media for select
  using (true);

create policy "Insert de medios por dueño de la publicación"
  on public.post_media for insert to authenticated
  with check (exists (
    select 1 from public.posts p
    where p.id = post_id and p.author_id = auth.uid()
  ));

create policy "Delete de medios por dueño de la publicación"
  on public.post_media for delete to authenticated
  using (exists (
    select 1 from public.posts p
    where p.id = post_id and p.author_id = auth.uid()
  ));

-- ==============================================
-- TABLA: post_likes
-- ==============================================
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Lectura de likes pública"
  on public.post_likes for select
  using (true);

create policy "Usuarios pueden dar like"
  on public.post_likes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Usuarios pueden quitar su like"
  on public.post_likes for delete to authenticated
  using (auth.uid() = user_id);

-- ==============================================
-- TABLA: post_comments
-- ==============================================
create table if not exists public.post_comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz null
);

alter table public.post_comments enable row level security;

create policy "Lectura pública de comentarios"
  on public.post_comments for select
  using (true);

create policy "Usuarios pueden crear comentarios"
  on public.post_comments for insert to authenticated
  with check (auth.uid() = author_id);

create policy "Usuarios pueden actualizar sus comentarios"
  on public.post_comments for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Usuarios pueden eliminar sus comentarios"
  on public.post_comments for delete to authenticated
  using (auth.uid() = author_id);

-- ==============================================
-- STORAGE (Supabase Storage v3)
-- ==============================================
insert into storage.buckets (id, name, public)
select 'posts', 'posts', true
where not exists (select 1 from storage.buckets where id = 'posts');

create policy "Public read for posts bucket"
  on storage.objects for select
  using (bucket_id = 'posts');

create policy "Authenticated upload to posts bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'posts');

create policy "Authenticated update own objects in posts bucket"
  on storage.objects for update to authenticated
  using (bucket_id = 'posts' and owner = auth.uid())
  with check (bucket_id = 'posts' and owner = auth.uid());

create policy "Authenticated delete own objects in posts bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'posts' and owner = auth.uid());
