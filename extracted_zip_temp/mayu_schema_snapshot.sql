-- MAYU PUSH SUSHI — snapshot técnico do schema Supabase
-- Capturado em 23/11/2026. Não executar cegamente sobre produção:
-- conferir migrations e ambiente de destino antes de aplicar.
-- O app usa mayu_cloud_data como payload JSONB; não é um schema relacional
-- normalizado de produtos/estoque.

create table if not exists public.mayu_cloud_data (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint mayu_cloud_data_payload_object
    check (jsonb_typeof(payload) = 'object')
);

alter table public.mayu_cloud_data enable row level security;

drop policy if exists "Mayu user can read own cloud backup" on public.mayu_cloud_data;
create policy "Mayu user can read own cloud backup"
  on public.mayu_cloud_data
  for select to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Mayu user can create own cloud backup" on public.mayu_cloud_data;
create policy "Mayu user can create own cloud backup"
  on public.mayu_cloud_data
  for insert to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Mayu user can update own cloud backup" on public.mayu_cloud_data;
create policy "Mayu user can update own cloud backup"
  on public.mayu_cloud_data
  for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

grant select, insert, update on public.mayu_cloud_data to authenticated;

create table if not exists public.mayu_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('manager', 'employee')),
  workspace_owner_id uuid not null references auth.users(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  username text not null
    check (username ~ '^[a-z0-9._-]{3,30}$')
);

create unique index if not exists mayu_profiles_username_lower_uidx
  on public.mayu_profiles (lower(username));

alter table public.mayu_profiles enable row level security;

drop policy if exists "Mayu profile self or workspace manager read" on public.mayu_profiles;
create policy "Mayu profile self or workspace manager read"
  on public.mayu_profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or private.mayu_can_manage_workspace(workspace_owner_id)
  );

drop policy if exists "Mayu workspace manager updates active status" on public.mayu_profiles;
create policy "Mayu workspace manager updates active status"
  on public.mayu_profiles
  for update to authenticated
  using (private.mayu_can_manage_workspace(workspace_owner_id))
  with check (private.mayu_can_manage_workspace(workspace_owner_id));

create table if not exists public.mayu_cloud_backups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null
    check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  snapshot_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_by_username text not null default '',
  label text not null default 'Backup automático',
  snapshot_version integer
);

create index if not exists mayu_cloud_backups_owner_created_idx
  on public.mayu_cloud_backups (owner_id, created_at desc);

create unique index if not exists mayu_cloud_backups_daily_auto_unique
  on public.mayu_cloud_backups (owner_id, snapshot_date)
  where label = 'Backup automático';

alter table public.mayu_cloud_backups enable row level security;

-- IMPORTANTE:
-- A tabela mayu_cloud_backups está com RLS habilitado e sem policies públicas.
-- O acesso operacional observado ocorre pela Edge Function mayu-admin,
-- que usa a chave de serviço somente no servidor e valida o JWT/perfil.
-- Não adicionar policy para anon/authenticated sem revisar o modelo de segurança.

create schema if not exists private;

create or replace function private.mayu_can_manage_workspace(p_workspace_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from public.mayu_profiles p
    where p.user_id = (select auth.uid())
      and p.workspace_owner_id = p_workspace_owner_id
      and p.role = 'manager'
      and p.active = true
  );
$function$;

-- Índices/constraints observados:
-- mayu_cloud_data: PK(owner_id), FK owner_id -> auth.users(id) ON DELETE CASCADE,
--   CHECK jsonb_typeof(payload)='object'.
-- mayu_profiles: PK(user_id), UNIQUE(email), UNIQUE INDEX lower(username),
--   role IN ('manager','employee'), username regex; FK user_id CASCADE,
--   FK workspace_owner_id RESTRICT.
-- mayu_cloud_backups: PK(id), FK owner_id CASCADE, FK created_by SET NULL,
--   CHECK payload JSON object, índice owner_id/created_at DESC e índice único
--   parcial por owner_id/snapshot_date para label='Backup automático'.
