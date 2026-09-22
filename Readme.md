# 📚 ATU PQ Hub — Read Me First

**Owned by:** Omar Sulley Bin ("Officer Moyole"), SRC Part-Time Representative, ATU 2026/2027
**Built by:** Ibrahim Mohammed Lotsu — "C4" (Ibratech)

---

## Where the real setup guide lives

This project used to ship with a long Markdown setup guide right here in this
file. That guide has since moved into the website itself and is kept up to
date there instead of in two places at once:

👉 **Open `setup.html` in your browser** (double-click it, or open it from
inside the `atu-pq-hub` folder) for the full, current, step-by-step guide —
Supabase setup, connecting your API keys, creating the database tables,
uploading past questions, deploying to Vercel, and a full launch checklist.

## Quick facts

- **Stack:** Vanilla HTML/CSS/JS, Supabase (auth + database + storage), deployed on **Vercel**
- **Student login:** Student ID + password (e.g. `01234567B`) — no email required
- **Admin access:** Gated by an `is_admin` flag on the account (see setup.html → "Make Your Admin Account")
- **Database setup:** Run `supabase-schema.sql` once in your Supabase project's SQL Editor — it creates every table, security rule, and the storage bucket in one go
- **Shared config file:** `js/pq-hub.js` — your Supabase URL/key, plus the faculty/department/level/year lists used by every dropdown on the site
- **Contact numbers:** 024 560 7110 (Omar Sulley Bin — student-facing) · 054 419 6068 (Ibrahim/C4 — developer)

## Folder contents

```
atu-pq-hub/
├── *.html              → all 16 pages
├── js/pq-hub.js         → shared Supabase config, auth helpers, faculty/dept/level/year data
├── js/carousel.js        → shared image carousel logic
├── css/carousel.css      → shared image carousel styles
├── images/               → logos + photos (see PUT_YOUR_IMAGES_HERE.txt inside)
├── supabase-schema.sql   → run once in Supabase SQL Editor
├── robots.txt / sitemap.xml → for search engines (update the domain once deployed)
└── setup.html            → the real, full guide — start here
```

If anything here ever looks out of date compared to `setup.html`, trust
`setup.html` — it's the one that gets kept current.
