-- Migration: gestão de artigos (CMS Web) + integração com o app
-- Rode este script inteiro no SQL Editor do seu projeto Supabase (uma vez só).
--
-- Observação sobre as policies de SELECT em "artigos": existem DUAS policies de
-- SELECT (uma pública para artigos publicados, outra para admins verem tudo,
-- inclusive rascunhos). O Postgres RLS combina múltiplas policies permissivas do
-- mesmo comando com OR, então isso é intencional, não duplicado.

-- 1. Extensão necessária para gen_random_uuid()
create extension if not exists pgcrypto;

-- 2. Tabela de artigos
create table if not exists public.artigos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  cover_image_url text,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Trigger para manter updated_at em dia
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists artigos_set_updated_at on public.artigos;
create trigger artigos_set_updated_at
  before update on public.artigos
  for each row execute function public.set_updated_at();

-- 4. Flag de admin no profiles existente
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 5. RLS em artigos
alter table public.artigos enable row level security;

drop policy if exists "public read published artigos" on public.artigos;
create policy "public read published artigos"
  on public.artigos for select
  to anon, authenticated
  using (published = true);

drop policy if exists "admins read all artigos" on public.artigos;
create policy "admins read all artigos"
  on public.artigos for select
  to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ));

drop policy if exists "admins insert artigos" on public.artigos;
create policy "admins insert artigos"
  on public.artigos for insert
  to authenticated
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ));

drop policy if exists "admins update artigos" on public.artigos;
create policy "admins update artigos"
  on public.artigos for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "admins delete artigos" on public.artigos;
create policy "admins delete artigos"
  on public.artigos for delete
  to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ));

-- 6. Bucket de storage para imagens/vídeos dos artigos
insert into storage.buckets (id, name, public)
values ('article-media', 'article-media', true)
on conflict (id) do nothing;

drop policy if exists "public read article-media" on storage.objects;
create policy "public read article-media"
  on storage.objects for select
  to public
  using (bucket_id = 'article-media');

drop policy if exists "admins write article-media" on storage.objects;
create policy "admins write article-media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'article-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

drop policy if exists "admins update article-media" on storage.objects;
create policy "admins update article-media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'article-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

drop policy if exists "admins delete article-media" on storage.objects;
create policy "admins delete article-media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'article-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 7. Habilita Realtime na tabela artigos (necessário para o app receber updates ao vivo)
alter publication supabase_realtime add table public.artigos;

-- 8. Depois de rodar tudo acima, marque seu próprio usuário como admin:
-- (troque '<seu-uid>' pelo id do seu usuário, visível em Authentication > Users no painel Supabase)
--
-- update public.profiles set is_admin = true where id = '<seu-uid>';
