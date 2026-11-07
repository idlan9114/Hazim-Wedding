# Hazim & Shafikah wedding invitation

**Deploy this repository:** [GitHub → Netlify instructions](DEPLOY-NETLIFY.md) for `idlan9114/Hazim-Wedding`, including the two Supabase environment settings.

Vue 3 Composition API, TypeScript, Vue Router, Vite 7, and Tailwind CSS 4. The invitation uses a dark teal backdrop, warm ivory paper, sand cards, and soft mist accents. Shared theme tokens in `src/assets/styles/main.css` keep text, buttons, borders, forms, and section backgrounds consistent.

For permanent ucapan with live updates and Netlify deployment, follow [Supabase and Netlify setup](docs/supabase-netlify-setup.md). Each environment needs its publishable settings and database setup. The guest book loads near its section, applies live changes without re-fetching the whole list, and disconnects when away. Content-hashed static assets use browser caching to reduce repeat downloads.

Each page load begins with a white envelope cover, teal fold lines, the couple's names, and a circular seal. Tap or click it, or focus it and press Enter/Space, to open the invitation. The top flap folds up and the bottom slides away to reveal the website directly underneath; reduced-motion preferences skip that animation. The page starts at the top with keyboard focus on the invitation. Run `npm.cmd run verify:envelope` to check the opening screen, responsive layout, keyboard and touch controls, and reduced-motion behavior without connecting to Supabase.

## Run locally on Windows

Use Node.js **22.12+** (Node 22 LTS recommended). A verified portable copy is available in this workspace at `.tools/node`; it is ignored by Git. New VS Code integrated terminals add that folder to PATH automatically. Reopen an existing terminal, or enable it in the current PowerShell terminal:

```powershell
. ./scripts/use-node.ps1
npm.cmd install
npm.cmd run dev
```

Open **http://localhost:5173**. `npm run dev` also works wherever PowerShell permits npm's script shim. Use `npm.cmd` if a Windows execution-policy error blocks `npm.ps1`. On another computer, install Node from [nodejs.org](https://nodejs.org/) and run `npm.cmd ci` using the committed lockfile; the portable runtime is not part of the source.

## F5 in Google Chrome

Open this project folder in VS Code, select **Wedding invitation · Chrome** in Run and Debug, and press **F5**. The background task starts Vite and waits for its ready message before the built-in Chrome debugger opens http://localhost:5173. Google Chrome must be installed. This uses `pwa-chrome` and the stable Chrome channel.

The server uses `strictPort: true`: if port 5173 is occupied, stop the existing dev server first with Ctrl+C or **Tasks: Terminate Task**. Shift+F5 closes debugging; terminate the background task when finished. Vue, TypeScript, and CSS changes update through Vite HMR. Incompatible module changes may cause Vite to reload the page. No manual refresh is normally required. No polling or browser extension is necessary.

## Checks

```powershell
npm.cmd run type-check
npm.cmd run build
npm.cmd run preview
npm.cmd run verify:supabase
npm.cmd run verify:delivery
npm.cmd run verify:motion
```

Build output is in `dist/`. Hosting must serve `index.html` for unknown paths because Vue Router uses HTML5 history. `npm run preview` serves the production build at http://localhost:4173.

Motion uses CSS and a shared IntersectionObserver: a staggered cover entrance, a settling date badge, section reveals, staggered schedule/couple/countdown content, subtle button interactions, and a short fade for the newest wish. Reveals run once, keyboard focus makes content immediately visible, and reduced-motion preferences and printing disable animation. `verify:motion` checks those behaviors and the two-card scrolling area using local demo data without accessing Supabase.

`verify:supabase` starts an isolated local test server and uses HTTP/WebSocket fixtures to test saved wishes, error recovery, refresh persistence, updates between two tabs, and two-card scrolling. It does not connect to a real Supabase project or verify the database SQL; run the setup guide and confirm against your own project before publishing.

With the dev server running, `npm.cmd run verify:browser` uses installed Google Chrome through Playwright Core. It checks all requested viewport widths, the Google Forms RSVP link, guest wishes, absence of demo music, reduced motion, countdown, routing, and Vue/TS/CSS updates without reload. It briefly edits source files for HMR probes and restores them in `finally`; run this only when those files are not being edited. Screenshots and the verification report go to ignored `.verification/`.

## Personalize before sharing

- Edit **`src/config/wedding.ts`** to personalize remaining details: RSVP deadline, invitation text, example wishes, and closing message. The couple's names, Friday 11 December 2026 wedding date (displayed as Jumaat, 11 Disember 2026), five evening activities and times, Kuasa Kaseh Kota Masai venue/address/Google Maps link, and Google Forms RSVP link are supplied by the couple. Fathers' names follow the supplied full names; mothers' names have not been supplied. Guests are asked to confirm attendance before 15 November 2026. Keep the ISO date and its human-readable labels in sync; its time matches the 7:30 PM arrival. The live countdown uses the ISO date; after it passes, it shows zero and a celebration message.
- Replace **`src/assets/images/*-placeholder.svg`** with your optimized WebP/AVIF/JPEG photographs. Update imports, meaningful alt text, captions, and `isPlaceholder` in the config. The first gallery image is not automatically the hero: change the image import in `WeddingHero.vue` too. Preserve image dimensions to avoid layout shifts.
- Music is disabled and the music control is removed from the invitation.
- Update **`index.html`** title, description, theme colour, and **`public/favicon.svg`**.
- Match your reference images in the Vue templates and **`src/assets/styles/main.css`** / **`responsive.css`**. The current local illustrations and system fonts are placeholders, not a finalized design.
- RSVP uses **`wedding.rsvp.formUrl`**, opening the supplied Google Form in a new tab. Responses are collected through that form rather than a local demo form. **Guest wishes use Supabase when configured; with both settings blank they remain a clearly labelled temporary demo.** Follow the Supabase setup guide before collecting real wishes. No analytics, tracking, or external photo/font services are included.

## Structure

`src/components/wedding/` contains the cover, invitation, couple, events, countdown, venue, gallery, forms, music, and closing sections. `src/views/WeddingInvitation.vue` composes them; `src/types/wedding.ts` defines their content types. Tailwind utilities live directly in templates; shared base styles and more involved responsive rules live in the two CSS files.

The browser checks cover 320, 375, 390, 430, 768, 1024, 1440, and 1920 CSS pixels. Controls have visible focus styles; forms have labels and linked errors; reduced-motion preferences disable animation and smooth scrolling.
