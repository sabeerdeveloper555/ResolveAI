# ResolveAI Phase 2.3D — Migration 001 Verification & Closure Record

Date: 2026-11-03
Branch: `main` (commit `a533781` — `feat(database): add workflows schema migration`)
Scope: Documentation only. No source, migration, environment, frontend, or
dependency changes were made as part of this phase's closure.

---

## 1. Purpose

This record closes out ResolveAI Phase 2.3D: creation and structural
verification of migration `server/migrations/001_create_workflows.sql`, which
defines the `public.workflows` schema in the Supabase PostgreSQL database.

It is the single durable, in-repo record of:

- What migration 001 contains and why (the approved schema design).
- What was actually verified against the live database.
- Which security decisions are intentional design, not defects.
- Which runtime behaviors remain unverified and belong to the next phase.

No other project documentation file describes the database architecture or
migration status; this file is not a duplicate of anything in the repository.

---

## 2. Approved Migration Contents (verified in the SQL file)

`server/migrations/001_create_workflows.sql` was inspected and contains the
full approved implementation:

| #   | Approved element                     | Present in migration                                                                                                                       |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `public.workflows` table             | `CREATE TABLE public.workflows` (plain CREATE — no `IF NOT EXISTS`, so conflicts fail loudly)                                              |
| 2   | UUID primary key                     | `id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid()`, `workflows_pkey`                                                                  |
| 3   | `owner_id` FK to `auth.users(id)`    | `workflows_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users (id)`                                                                |
| 4   | `ON DELETE RESTRICT`                 | Explicitly chosen so deleting an auth user can never silently destroy workflow rows                                                        |
| 5   | `name VARCHAR(120)`                  | `name varchar(120) NOT NULL`; max length enforced by the type, plus `chk_workflows_name_not_blank` rejecting empty/whitespace-only names   |
| 6   | Optional description, max 2000 chars | `description text` nullable + `chk_workflows_description_length` (`NULL` or `length <= 2000`)                                              |
| 7   | Status limited to `draft`/`archived` | `chk_workflows_status CHECK (status = ANY (ARRAY['draft','archived']))`, default `'draft'`                                                 |
| 8   | Archive consistency constraint       | `chk_workflows_archive_consistency`: `archived` ⇔ `archived_at IS NOT NULL`, `draft` ⇔ `archived_at IS NULL`                               |
| 9   | Composite index                      | `workflows_owner_status_created_idx (owner_id, status, created_at)` — leading column also serves ownership lookups and the FK delete check |
| 10  | `set_updated_at()` trigger function  | `SECURITY INVOKER` (deliberate default), `SET search_path = pg_catalog, pg_temp` hardening, schema-qualified body                          |
| 11  | BEFORE UPDATE trigger                | `trg_workflows_set_updated_at BEFORE UPDATE ... FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`                                     |
| 12  | RLS enabled, no policies             | `ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY`; zero `CREATE POLICY` statements                                                  |
| 13  | FORCE RLS deliberately omitted       | No `FORCE ROW LEVEL SECURITY` — see §4                                                                                                     |
| 14  | Table privileges revoked             | `REVOKE ALL ON public.workflows FROM PUBLIC, anon, authenticated, service_role`                                                            |
| 15  | Function EXECUTE revoked             | `REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated, service_role`                                        |

All statements are schema-qualified, purely additive, and wrapped in a single
`BEGIN`/`COMMIT` transaction. Nothing in the file is executed by the
application; it was applied manually as the `postgres` role via the Supabase
SQL Editor.

---

## 3. Supabase Verification Results (actual)

The migration was **manually applied to the Supabase project** and the
resulting database structure was verified with the read-only verification
queries of `ResolveAI_Phase_2.3D_Migration_001_Verification.sql`, executed
manually in the Supabase SQL Editor as `postgres`.

> Note: the verification SQL file itself was used in the Supabase dashboard
> and is not checked into this repository. These results are structural
> catalog checks against `pg_class` / `pg_constraint` / `pg_index` /
> `pg_trigger` / `pg_proc` / privilege catalogs — **not** runtime behavior
> tests.

| #   | Check                         | Result | Detail                                                                                                    |
| --- | ----------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| 1   | Table existence               | PASS   | `public.workflows` exists                                                                                 |
| 2   | Column definitions            | PASS   | All 8 columns match the approved types/nullability/defaults                                               |
| 3   | Constraints                   | PASS   | 6 constraints: pkey, FK, 4 CHECKs                                                                         |
| 4   | Indexes                       | PASS   | 2 indexes: `workflows_pkey` + `workflows_owner_status_created_idx`                                        |
| 5   | RLS configuration             | PASS   | `relrowsecurity = true`, `relforcerowsecurity = false` — per approved design (see §4)                     |
| 6   | Trigger                       | PASS   | `trg_workflows_set_updated_at` present, `BEFORE UPDATE`, per-row                                          |
| 7   | Trigger function              | PASS   | `public.set_updated_at()` present with pinned `search_path`                                               |
| 8   | Table privileges              | PASS   | SELECT/INSERT/UPDATE/DELETE all `false` for `anon`, `authenticated`, `service_role` — per approved design |
| 9   | Function execution privileges | PASS   | `can_execute = false` for all three roles                                                                 |
| 10  | RLS policies                  | PASS   | No policies exist — intentional per approved design (see §4)                                              |
| 11  | Name maximum length           | PASS   | `character_maximum_length = 120`                                                                          |

No verification check failed. Items 5, 8, and 10 "pass" **relative to the
approved design**, not relative to a hypothetical configuration where
PostgREST clients access the table directly.

---

## 4. Authorization Architecture (intentional design decisions)

These are approved product/architecture decisions. They are **not defects**
and must not be reported as such:

1. **Authorization is handled in the Express backend**, using `owner_id`
   predicates on every query issued through the application's direct database
   pool. The database objects in migration 001 are containment, not the
   authorization layer.
2. **Supabase RLS is enabled as a containment layer only.** With RLS enabled
   and no policies, every non-BYPASSRLS role sees and can affect zero rows —
   a second fence behind the privilege revokes.
3. **No RLS policies are intentionally configured.** Adding policies would
   imply planned browser-side access, which is not part of the approved
   architecture.
4. **FORCE ROW LEVEL SECURITY is intentionally omitted.** The application's
   database pool connects as `postgres`, the table owner. `FORCE` would apply
   RLS to the owner as well and would lock the Express backend out of the
   table entirely.
5. **Browser-side PostgREST access to `public.workflows` is not part of the
   approved architecture.** The table has no `GRANT`s to `anon`/`authenticated`
   and no exposed policies; the browser reaches data only through the backend.
6. **The backend accesses PostgreSQL through its direct connection pool**
   (`pg`, connection as owner), never through PostgREST.

---

## 5. Runtime Verification — NOT YET VERIFIED

Structural verification (§3) proves the schema matches the design. It does
**not** prove runtime authorization. The following remain **NOT YET VERIFIED**
and no claim of passing testing is made for any of them:

- [ ] Express JWT authentication at runtime (Phase 2.3C3 code exists; runtime
      end-to-end behavior against the deployed stack not yet exercised for
      workflow endpoints).
- [ ] Workflow ownership enforcement (`owner_id` predicates) under real
      requests.
- [ ] Cross-user workflow isolation (user A cannot read/modify user B's rows).
- [ ] Workflow CRUD endpoint behavior (create / list / get / update / archive).
- [ ] Database connection and CRUD operations under the actual application
      configuration (pool, SSL, `search_path`, role).

These items define the verification scope of the next phase.

---

## 6. Phase 2.3D Closure Status

| Area                        | Status                                        |
| --------------------------- | --------------------------------------------- |
| Migration 001               | Applied and structurally verified             |
| Database schema             | Verified against approved design              |
| Security configuration      | Matches approved migration design             |
| Runtime CRUD implementation | Pending                                       |
| Next phase                  | Workflow CRUD API implementation (Phase 2.3E) |

**Phase 2.3D is closed.**
