-- AMBOT 365 — PostgreSQL schema
-- Source of truth for the `bots` and `websites` catalog served by the .NET API.
--
-- Columns are snake_case so they work unquoted in Postgres. EF Core maps them
-- with UseSnakeCaseNamingConvention(), and ASP.NET serializes to camelCase, so
-- the JSON the Next.js app receives still matches src/lib/types.ts unchanged.
--
-- Safe to re-run: every statement is guarded.
--
--   psql -U postgres -d ambot365 -f db/schema.sql

begin;

-- gen_random_uuid()
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------------
-- updated_at trigger
-- The database owns this timestamp so the API can't forget to set it.
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- bots  →  Bot in src/lib/types.ts
-- ---------------------------------------------------------------------------
create table if not exists bots (
  id                          uuid        primary key default gen_random_uuid(),
  name                        text        not null,
  slug                        text        not null,
  description                 text        not null default '',
  script_code                 text        not null,
  background_image_url        text,
  mobile_background_image_url text,
  category                    text        not null default 'other',
  enabled                     boolean     not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint bots_slug_key      unique (slug),
  constraint bots_name_not_blank check (length(btrim(name)) > 0),
  constraint bots_slug_format    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint bots_category_valid check (category in (
    'education', 'real-estate', 'healthcare', 'customer-support',
    'e-commerce', 'hospitality', 'finance', 'other'
  ))
);

comment on table  bots             is 'Embeddable demo chatbots shown at /bots and /bot/[slug].';
comment on column bots.script_code is 'Raw third-party embed snippet, injected by BotEmbed.tsx. Never rendered as trusted HTML.';
comment on column bots.slug        is 'URL segment for /bot/[slug]. Unique; the API retries with a -N suffix on conflict.';

drop trigger if exists bots_set_updated_at on bots;
create trigger bots_set_updated_at
  before update on bots
  for each row execute function set_updated_at();


-- ---------------------------------------------------------------------------
-- websites  →  DemoWebsite in src/lib/types.ts
-- ---------------------------------------------------------------------------
create table if not exists websites (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  slug          text        not null,
  description   text        not null default '',
  url           text        not null,
  thumbnail_url text,
  category      text        not null default 'other',
  tags          text[]      not null default '{}',
  enabled       boolean     not null default true,
  featured      boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint websites_slug_key         unique (slug),
  constraint websites_title_not_blank  check (length(btrim(title)) > 0),
  constraint websites_slug_format      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint websites_url_is_http      check (url ~* '^https?://'),
  constraint websites_category_valid   check (category in (
    'education', 'real-estate', 'healthcare', 'customer-support',
    'e-commerce', 'hospitality', 'finance', 'other'
  ))
);

comment on table  websites      is 'Demo websites showcased at /websites and /website/[slug].';
comment on column websites.url  is 'Live demo URL, loaded in an iframe by WebsitePreviewModal.tsx. http/https only.';
comment on column websites.tags is 'Free-form labels. text[] maps natively via Npgsql to string[].';

drop trigger if exists websites_set_updated_at on websites;
create trigger websites_set_updated_at
  before update on websites
  for each row execute function set_updated_at();


-- ---------------------------------------------------------------------------
-- Indexes
-- Both listing pages filter on enabled and sort by created_at desc.
-- ---------------------------------------------------------------------------
create index if not exists bots_enabled_created_idx
  on bots (enabled, created_at desc);

create index if not exists websites_enabled_created_idx
  on websites (enabled, created_at desc);

-- The homepage pulls featured demos separately.
create index if not exists websites_featured_idx
  on websites (created_at desc)
  where enabled and featured;




commit;
