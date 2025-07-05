# Supabase Migration Repair Report (2025-07-05)

## What Happened

- The local migration history and the remote Supabase database became out of sync.
- Migrations were marked as applied on the remote, but the actual tables (products, categories, etc.) were missing.
- This was likely caused by running `supabase migration repair` or marking migrations as applied without actually running them, or by resetting/replacing the remote DB without clearing migration history.
- As a result, `supabase db push` reported that the remote was up to date, but the schema was incomplete.

## Steps Taken to Fix

1. **Identified** that the remote database was missing tables despite migrations being marked as applied.
2. **Dropped the migration history** on the remote by running:
    ```sql
    DROP SCHEMA IF EXISTS supabase_migrations CASCADE;
    ```
    in the Supabase SQL editor.
3. **Repaired migration history** using:
    ```sh
    npx supabase migration repair --status applied <migration_id>
    ```
    for each migration that was already applied.
4. **Pushed missing migrations** using:
    ```sh
    npx supabase db push
    ```
    to apply any migrations that had not yet been run (e.g., for product tables).
5. **Verified** that all tables were present and the migration history was in sync.

## How to Avoid This in the Future

- **Never mark migrations as applied unless you are sure the schema matches.**
- **Do not manually edit or delete migrations unless you know the consequences.**
- **If you reset or replace your remote DB, always clear the migration history (`supabase_migrations` schema) before pushing migrations.**
- **Always check the Supabase dashboard after migration operations to confirm the schema is correct.**
- **Use `supabase db push` to apply new migrations, and `supabase migration repair` only if you are sure about the migration state.**

---

_This report documents the repair of a Supabase migration state mismatch and provides guidance to prevent similar issues in the future._
