# LeadFlow

A personal lead management tool I built to organize and tag business leads exported from Google Maps scraping. I had a CSV with ~950 entries across hotels, coaching centers, banquet halls, and a bunch of other categories — manually going through them in a spreadsheet was a nightmare, so I just built something that actually works the way I needed.

The main thing I wanted was to open it on my phone while I'm out, tag something, and have that change show up on my laptop when I get back. No syncing headaches, no exporting JSON back and forth — it just works.

---

## What it does

- Loads all leads from an embedded dataset (originally `generator_results_all_2026-03-01.csv`, cleaned and deduped)
- Tag each lead as **Job**, **Freelance**, or **Skip** — toggles off if you click the same one again
- All status changes sync across devices via **Vercel KV** — open it on your phone, change something, your laptop shows the same state
- Falls back to localStorage if you're offline, syncs when you reconnect
- Filter by status (Job / Freelance / Unset), by category, sort by reviews or rating
- Click any email to copy it to clipboard
- Export checked leads as CSV
- Fully responsive — same codebase on desktop and mobile

---

## Stack

Just a single HTML file on the frontend — no framework, no build step. Tailwind via CDN, Google Material Symbols for icons. The only "backend" is a single Vercel serverless function (`/api/statuses`) that reads and writes to Vercel KV (Redis).

```
leadflow/
├── api/
│   └── statuses.js     — GET / POST endpoint for Vercel KV
    └── leads.js
├── public/
│   └── index.html      — the whole app
├── package.json
└── vercel.json
```

---

## Running it yourself

You'll need a Vercel account. Once you have that:

1. Fork/clone this repo
2. Import it into Vercel
3. Go to the **Storage** tab in your project → Create a KV database → Connect it (Vercel injects the env vars automatically)
4. Redeploy once after connecting the KV store
5. That's it

The sync dot in the header tells you the current state — green means everything's saved, yellow means it's writing, red means something went wrong (it retries automatically).

---

## Data

The leads are from a Google Maps scraper run on March 1, 2026. I removed 3 true duplicates (same business name + same phone number, scraped from two different listing pages). Entries with the same name but different addresses/phones are kept — those are legitimately different branches.

950 leads across ~40 categories. Biggest ones are hotels (413), coaching centers (148), guest houses (80), banquet halls (65), wedding venues (49).

---

## Notes

- Status data lives in Vercel KV under a single key. It's not multi-user — this is a personal tool, so there's no auth or conflict resolution. Last write wins.
- The backup button in Settings downloads a JSON snapshot of all statuses. Worth doing occasionally if you care about the data.
- To use this with your own CSV, replace the `ALL_LEADS` array in `index.html` with your data. Each object needs `id`, `name`, `phone`, `website`, `email`, `category`, `rating`, `reviews`, `address`.
