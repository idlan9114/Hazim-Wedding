# Connect ucapan to Supabase

The website supports Supabase. Follow these steps when setting up a new environment or reconnecting a project. The design and two-card scrolling area stay the same.

## 1. Copy the browser connection settings

In the Supabase project shown in your screenshot, click the green **Connect** button at the top. Copy the **Project URL** and **Publishable key** for a browser/Vue app. You can also find keys under **Settings → API Keys**.

Open `.env.local` in the project root and fill both values:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Use a publishable key, not a secret or service-role key. These Vite settings are included in the browser build. `.env.local` is ignored by Git; `.env.example` contains the blank template.

## 2. Create the wishes table

1. In Supabase, open **SQL Editor** from the left sidebar.
2. Start a new query.
3. Copy the entire contents of [`supabase/setup-guest-wishes.sql`](../supabase/setup-guest-wishes.sql) into the editor.
4. Click **Run**.

This creates `public.guest_wishes`, validates message lengths, enables row-level security, allows public reading and submitting, and enables Realtime updates. Guests cannot edit/delete wishes or set timestamps. The table stores only a name, message, ID, and submission time; names and messages are public to visitors. You can remove unwanted wishes in Supabase's Table Editor.

The script can be run again without duplicating the table, policies, or Realtime publication entry. Do not add the example/demo wishes to the database.

## 3. Restart and test locally

Stop the current Vite terminal with **Ctrl+C**, then run:

```powershell
. ./scripts/use-node.ps1
npm.cmd run dev
```

Open `http://localhost:5173`. With both settings filled, the ucapan section switches from the demo to saved wishes and the button says **Send wish**.

Scroll to the ucapan section, submit a short test wish, refresh the page, and confirm it remains. Open another tab, scroll to ucapan there, and submit a second wish: the first tab should update automatically while its ucapan section is visible. The list shows two cards at a time and scrolls independently for older wishes.

If the table/key/network is unavailable, the page shows an error and preserves unsent text. It does not claim the wish was saved. With both settings blank, local development still uses the clearly labelled, temporary demo guest book.

## Deploy to Netlify later

The included `netlify.toml` sets:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `22` |
| Vue Router fallback | `/*` → `/index.html`, status `200` |

When you are ready:

1. Push the project, including `package-lock.json` and `netlify.toml`, to your Git repository. Keep `.env.local` out of Git.
2. Import that repository into Netlify.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the Netlify project's **Environment variables**, available to **Builds**. Use the same values as your local settings.
4. Deploy. Netlify runs the configured build and publishes `dist`.
5. Test sending a wish on the deployed site, refreshing, and receiving it in a second tab.

Changing a `VITE_` setting requires another build/deploy because Vite embeds it at build time. New wishes are saved in Supabase and do not require redeploying the website. No Netlify Function or Netlify Form is needed: RSVP continues to use your Google Form.

## Reducing requests and bandwidth

The invitation stays a static Vite site. Reading and sending wishes go directly from the browser to Supabase, so they do not invoke Netlify Functions or create deployments.

- Images, CSS, and JavaScript under `/assets/` have content-hashed filenames and a one-year immutable browser cache. Returning browsers can reuse them without downloading them again. HTML revalidates so a new deploy can reference new asset filenames.
- The Supabase SDK, initial wishes request, and live connection are deferred until the ucapan section is within 400px of the viewport. Guests who only read the invitation do not load the database SDK or open that connection.
- New wishes, edits, and deletions update from the Realtime payload. They do not each trigger another full-list download. Saving a wish uses the returned saved row rather than immediately fetching the list again.
- Concurrent refreshes share a single in-flight request. One snapshot is fetched when joining or rejoining to reconcile missed changes. A slow live connection can require a fallback read followed by a reconciliation read when it connects.
- Scrolling away or hiding the tab removes the channel and closes its WebSocket immediately. Returning reconnects and catches up. If Realtime is unavailable, ordinary reads, submissions, and the refresh button still work.

These changes reduce usage; they cannot make Netlify traffic unmetered. On current credit-based Free plans, Netlify includes 300 credits/month and meters bandwidth at 20 credits/GB, web requests at 2 credits/10,000, and production deployments at 15 credits each. Netlify CDN cache hits still count as delivered traffic; browser cache hits can avoid requesting the files altogether. Older legacy accounts can have different allowances. See [Netlify credit usage](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/).

Netlify's published Free plan does not specify a fixed simultaneous-visitor count for static pages. Its concurrent-build limit is about building/deploying, not visitor count. This project has not been load-tested on Netlify, so no simultaneous-visitor guarantee is implied. Supabase Free's separate limit of 200 Realtime connections still applies, now used only by active visitors near ucapan. See [Netlify plans](https://www.netlify.com/pricing/) and [Supabase limits](https://supabase.com/docs/guides/realtime/limits).

Run `npm.cmd run verify:supabase` for local mocked checks of incremental updates, connection cleanup, error recovery, two-tab synchronization, and independent scrolling. Run a production build followed by `npm.cmd run verify:delivery` to check deferred SDK loading and repeat-visit browser caching locally. These do not deploy the site or write to your real database.

## Reference

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Netlify environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)
