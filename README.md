# Xeltrix Sparkle ✨

Hotel housekeeping & operations app — your own, free, unlimited.
Next.js + Supabase. English / Tamil / Hindi. PIN login. Photos + voice notes.

## Features
- **Cleaner**: My Rooms → checklist + multiple photos → Mark Cleaned
- **Supervisor**: Inspect → see proof → Approve / Redo (blocked while maintenance is open)
- **Report Issue**: anyone → photo + **voice note** (records in-app)
- **Owner Dashboard**: room board + open issues + present-today counts
- **Check In**: one-tap attendance
- **3 languages** (English / தமிழ் / हिन्दी), switchable anytime
- **Name + 4-digit PIN** login (no email/SMS needed)

---

## Setup (one time)

### 1. Create a Supabase project
- supabase.com → New Project (region: Mumbai / ap-south-1). Save the DB password.

### 2. Run the database schema
- Supabase → **SQL Editor** → New query → paste all of `supabase-schema.sql` → **Run**.
- This creates the tables, security rules, realtime, and the `photos` + `voice` storage buckets.

### 3. Add your keys
- Copy `.env.local.example` to `.env.local`.
- From Supabase → **Settings → API**, fill in:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`  (keep secret!)
  - `SESSION_SECRET` = any long random text

### 4. Create staff + sample rooms
- Edit the staff list at the top of `scripts/seed.mjs` (names, roles, PINs).
- Run:
  ```
  node --env-file=.env.local scripts/seed.mjs
  ```
- It prints each person's login PIN.

### 5. Run it
```
npm run dev
```
Open http://localhost:3000 — pick a name, enter the PIN.

---

## Deploy free (Vercel)
1. Push this folder to a GitHub repo.
2. vercel.com → New Project → import the repo.
3. Add the same 4 env vars from `.env.local` in Vercel → Settings → Environment Variables.
4. Deploy → you get `xeltrix-sparkle.vercel.app`.
5. Staff open the link → log in → **Add to Home Screen**.

## Default seed logins
| Name | Role | PIN |
|---|---|---|
| Anitha | owner | 1234 |
| Harini | supervisor | 1111 |
| Suresh | cleaner | 2222 |
| Kumar | cleaner | 3333 |

(Change these in `scripts/seed.mjs`, or later in the Supabase `staff` table.)
