-- ResolveAI Phase 2.3D — Migration 001: create public.workflows
--
-- Apply manually as the `postgres` role (Supabase SQL Editor / dashboard), once,
-- as written. Nothing in this file is executed by the application.
--
-- Design notes carried from the approved schema design:
--   * `public` was verified empty, so every statement here is purely additive.
--   * Ordinary CREATE statements on purpose: no IF NOT EXISTS / OR REPLACE, so
--     an unexpected pre-existing object fails loudly instead of being masked.
--   * Everything is schema-qualified because the connection search_path is
--     `"$user", public, extensions`.
--   * Authorization is enforced in Express with owner_id predicates; the
--     database objects below are containment, not the authorization layer.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Workflow table
-- ---------------------------------------------------------------------------
CREATE TABLE public.workflows (
    id           uuid         NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    owner_id     uuid         NOT NULL,
    name         varchar(120) NOT NULL,
    description  text,
    status       text         NOT NULL DEFAULT 'draft',
    created_at   timestamptz  NOT NULL DEFAULT pg_catalog.now(),
    updated_at   timestamptz  NOT NULL DEFAULT pg_catalog.now(),
    archived_at  timestamptz,

    CONSTRAINT workflows_pkey
        PRIMARY KEY (id),

    -- RESTRICT (not CASCADE): deleting an auth user must never silently
    -- destroy their workflow rows. Account-deletion data cleanup has to be an
    -- explicit, tested application flow.
    CONSTRAINT workflows_owner_id_fkey
        FOREIGN KEY (owner_id) REFERENCES auth.users (id)
        ON DELETE RESTRICT,

    -- Only two lifecycle states exist in this phase.
    CONSTRAINT chk_workflows_status
        CHECK (status = ANY (ARRAY['draft', 'archived'])),

    -- Rejects empty and whitespace-only names (spaces, tabs, newlines).
    -- Maximum length is enforced by varchar(120); no redundant length CHECK.
    CONSTRAINT chk_workflows_name_not_blank
        CHECK (name ~ '[^[:space:]]'),

    CONSTRAINT chk_workflows_description_length
        CHECK (description IS NULL OR length(description) <= 2000),

    -- Archived state and archive timestamp can never disagree: this makes the
    -- soft-archive invariant unrepresentable to violate at any writer, and
    -- means an archived -> draft change must clear archived_at in the same
    -- statement.
    CONSTRAINT chk_workflows_archive_consistency
        CHECK (
            (status = 'archived' AND archived_at IS NOT NULL)
            OR
            (status = 'draft'    AND archived_at IS NULL)
        )
);

-- ---------------------------------------------------------------------------
-- 2. Supporting index
-- ---------------------------------------------------------------------------
-- One index only. Its leading owner_id column also serves ownership lookups
-- and the foreign-key delete check (PostgreSQL does not auto-index the
-- referencing side), while the trailing columns cover the default
-- "my drafts, newest first" list without a separate sort step.
CREATE INDEX workflows_owner_status_created_idx
    ON public.workflows (owner_id, status, created_at);

-- ---------------------------------------------------------------------------
-- 3. updated_at trigger function
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER (the PostgreSQL default, deliberately not SECURITY
-- DEFINER): the body only assigns NEW.updated_at, touches no table, and must
-- not run with escalated privileges.
-- search_path is pinned so no catalog name inside the body can be redirected
-- by a schema placed earlier in a caller's path; pg_temp is listed explicitly
-- per the documented temp-schema hardening form.
CREATE FUNCTION public.set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    NEW.updated_at := pg_catalog.now();
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_workflows_set_updated_at
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
-- ENABLE only, with NO policies: every non-BYPASSRLS role then sees and can
-- affect zero rows, as a second fence behind the revokes below.
-- FORCE is deliberately omitted: it would also apply RLS to the table owner,
-- which is the `postgres` role the application pool connects as, and would
-- lock Express out of this table.
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 6. Table privilege revocations
-- ---------------------------------------------------------------------------
-- Supabase default privileges in `public` auto-grant full DML to anon,
-- authenticated and service_role for future tables, and those arrive as
-- explicit grants that a PUBLIC-only revoke would not remove — so all four
-- principals are named. No GRANT statement is issued anywhere: the backend
-- reaches this table only through the direct pool as its owner, never through
-- PostgREST.
REVOKE ALL ON public.workflows
    FROM PUBLIC, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 7. Function privilege revocations
-- ---------------------------------------------------------------------------
-- Without this, the same default-privilege rules would make the trigger
-- function callable as a PostgREST RPC with the browser-side key.
REVOKE EXECUTE ON FUNCTION public.set_updated_at()
    FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
