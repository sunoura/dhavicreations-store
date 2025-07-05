# Supabase Schema Change Workflow

This document explains the correct workflow for making schema changes with Supabase and Drizzle ORM, both during development and for production deployments.

---

## 1. During Development

### When you make a schema change (edit Drizzle schema, add/remove tables/columns, etc.):

1. **Generate a new migration:**
    ```sh
    npx drizzle-kit generate:pg
    # or your project's migration command
    ```
2. **Apply the migration to your local Supabase instance:**
    ```sh
    npx supabase db reset
    # or
    npx supabase db push
    ```
    This will apply all pending migrations to your local database.
3. **Test your app locally** to ensure the schema and code work as expected.
4. **Commit your migration files** to version control (git).

---

## 2. For Production (Remote Supabase Project)

### When you are ready to deploy schema changes:

1. **Ensure your migration history is clean and up to date.**
    - All migrations should be committed and pushed to your repo.
2. **Push migrations to the remote Supabase database:**
    ```sh
    npx supabase db push
    ```

    - This will apply all pending migrations to the remote database.
    - If you see errors about existing tables/columns, check if the migration history is out of sync (see the migration repair report).
3. **Verify the schema in the Supabase dashboard** (Table Editor) to confirm all changes are present.
4. **Deploy your application code** to production.

---

## Troubleshooting

- If migrations fail due to out-of-sync history, see the migration repair report in `docs/reports/` for recovery steps.
- Never manually edit the remote database schema; always use migrations.
- Always back up important data before running destructive migrations in production.

---

_This workflow ensures your local and remote Supabase schemas stay in sync and reduces the risk of migration issues._
