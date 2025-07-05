# Dhavi Creations Store

This is the private codebase for the ecommerce store of **Dhavi Creations**, a fabric painting creator. The store is designed to showcase and sell unique hand-painted fabric products.

---

## 🛠️ Tech Stack

- **Frontend:** SvelteKit
- **Styling:** Tailwind CSS (via app.css)
- **State Management:** Svelte stores (`.svelte.ts` in `$lib/stores`)
- **Backend:** SvelteKit server endpoints
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit
- **Authentication:** Custom admin auth (see `src/lib/server/auth.ts`)
- **Image Storage:** Supabase Storage & Vercel Blob
- **Testing:** Vitest
- **Package Manager:** pnpm

---

## 📁 Repo Structure

- `src/` — SvelteKit app source
    - `lib/` — shared components, stores, hooks, server utils
    - `routes/` — SvelteKit routes (public & admin)
    - `lib/server/db/schema.ts` — Drizzle ORM schema
- `supabase/` — migrations and config for Supabase
- `scripts/` — utility scripts (admin creation, db reset, etc.)
- `tests/` — Vitest tests

---

## 📝 Notes

- This is a **private repository** for personal reference and development.
- All admin and sensitive logic is server-side only.
- For database management, prefer the Supabase Table Editor or a GUI client.
- Drizzle Studio is in beta and may not work reliably with Supabase.

---

## 🚀 Quick Start

1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Install dependencies:
    ```sh
    pnpm install
    ```
3. Run migrations:
    ```sh
    pnpm drizzle-kit push
    ```
4. Start the dev server:
    ```sh
    pnpm dev
    ```

---

## About

Dhavi Creations is dedicated to the art of fabric painting, offering unique, hand-crafted products for sale online.

---

_This README is for personal reference only. For questions, contact the repo owner._
