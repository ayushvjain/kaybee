# Kaybee International — website

Marketing and product-reference site for Kaybee International, bearing accessories
distributor, Chennai.

**Live domain:** `kaybeint.com`
**Stack:** Astro 7 + React + TypeScript, Keystatic CMS, deployed to Cloudflare
**Repository:** `ayushvjain/kaybee`

---

## How editing works

The site has a built-in admin. There is no separate CMS to host and no database.

```
Owner signs in at kaybeint.com/keystatic with GitHub
   -> edits text, uploads photos or a new brochure
   -> Keystatic commits the change to this repository
   -> Cloudflare rebuilds automatically (about a minute)
   -> the live site is updated
```

Everything below is editable without touching code:

| Section | What can change |
|---|---|
| Products | Name, summary, full description, features, brands, series, shaft sizes, photographs |
| Brands | Brand list, relationship type, ranges supplied, logos |
| Downloads | Brochure and catalogue PDFs |
| Homepage | Hero headline and image, statistics, "why us" points, custom-work text |
| About page | All body copy |
| Size reference | Shaft size columns, series rows, availability ticks, footnote |
| Contact details | Phones, mobile, email, address, hours, map |

Contact details live in one place, so changing a phone number updates the header,
footer, contact page and search-engine structured data together.

---

## Local development

Requires Node 22 or newer.

```bash
npm install
npm run dev
```

- Site: http://localhost:4321
- Admin: http://localhost:4321/keystatic

In development the admin writes **directly to files on disk** (no GitHub sign-in
needed). In production it commits to GitHub instead. That switch is automatic.

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build on the Cloudflare runtime locally |
| `npm run check` | TypeScript and Astro diagnostics |

### Two things about the dev setup that look odd but are deliberate

Both are worked around already — this is just so the next person does not
"simplify" them back into bugs.

**1. The dev server uses the Node adapter, not the Cloudflare one.**
See the comment in `astro.config.mjs`. The Cloudflare adapter runs on-demand
routes inside `workerd` during `astro dev`, and Keystatic's API module is
CommonJS, which `workerd` rejects outright with `exports is not defined`. The
result is a completely dead admin at `/keystatic` in development. Builds and
`npm run preview` still use the Cloudflare adapter, so what ships is unchanged —
only `astro dev` takes the Node branch.

**2. `npm run dev` goes through `scripts/dev.mjs` instead of calling `astro dev`.**
Astro 7 daemonises the dev server and allows it a hardcoded 30 seconds to become
ready. Keystatic's dependency graph is large enough that Vite's first cold
pre-bundle can exceed that, and the watchdog then kills a server that was
starting normally, reporting `Dev server failed to start within 30s`. The wrapper
runs it in the foreground instead, where no watchdog applies. Stop it with
Ctrl+C as usual.

---

## Setup required before going live

Three things must be configured. The site builds and runs without them, but the
admin sign-in and the enquiry form will not work until they are done.

### 1. GitHub App (for admin sign-in)

This cannot be automated and must be done once by hand.

1. Go to https://github.com/settings/apps → **New GitHub App**.
2. **Name:** anything, e.g. `Kaybee Website Admin`.
3. **Homepage URL:** `https://kaybeint.com`
4. **Callback URL:** `https://kaybeint.com/api/keystatic/github/oauth/callback`
5. Tick **Request user authorization (OAuth) during installation**.
6. Uncheck **Webhook → Active**.
7. Under **Permissions → Repository permissions**, set **Contents** to
   **Read and write**. Set **Metadata** to **Read-only**.
8. Create the App, then generate a **client secret**.
9. Install the App on the `ayushvjain/kaybee` repository.
10. Put the values into environment variables (below).

For local admin testing against GitHub, add a second callback URL:
`http://127.0.0.1:4321/api/keystatic/github/oauth/callback`

### 2. Web3Forms (for the enquiry form)

1. Go to https://web3forms.com and enter `kaybeeint@gmail.com`.
2. Copy the access key it emails you.
3. Set it as `PUBLIC_WEB3FORMS_KEY`.

Until this is set, the contact page shows a clear notice plus phone, WhatsApp and
email links. It deliberately does **not** show a form that would accept enquiries
and silently lose them.

### 3. Environment variables

Copy `.env.example` to `.env` for local work, and add the same variables in the
Cloudflare dashboard for production.

| Variable | Purpose |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `KEYSTATIC_SECRET` | Random string for signing admin sessions |
| `PUBLIC_WEB3FORMS_KEY` | Web3Forms access key |

Generate `KEYSTATIC_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**This repository is public. Never commit `.env`.** It is gitignored.

---

## Deploying to Cloudflare

The Cloudflare adapter builds a Worker with static assets. Public pages are
prerendered to static HTML; only `/keystatic` and `/api/keystatic/*` run on
demand.

1. In the Cloudflare dashboard: **Workers & Pages → Create → Connect to Git**.
2. Select `ayushvjain/kaybee`.
3. Build command: `npm run build`
4. Deploy command / output: the adapter emits `dist/server` with its own
   `wrangler.json`; Cloudflare's Astro preset handles this automatically.
5. Add the four environment variables from above as **Secrets**.
6. Attach the custom domain `kaybeint.com`.

### Compatibility flags

`wrangler.jsonc` already sets `nodejs_compat`, which the admin's GitHub
integration requires. Do not remove it.

### Session storage

The adapter enables Astro sessions backed by a KV namespace bound as `SESSION`.
Create a KV namespace in Cloudflare and bind it under that name, or the deploy
will fail on the missing binding.

---

## Project structure

```
assets/                     Original supplied artwork (source of truth, not used at runtime)
  NEEDED-IMAGES.md          Photographs still to be supplied
  CONTENT-TO-CONFIRM.md     Facts needing the owner's confirmation
content/                    All editable site content, committed as YAML and Markdoc
public/brand/               Logo files extracted from the stationery artwork
public/images/              Owner-uploaded photographs
public/downloads/           Owner-uploaded PDFs
src/components/             UI components (one React island: EnquiryForm)
src/layouts/BaseLayout.astro  Page shell, metadata, structured data
src/lib/content.ts          Single content access point for every page
src/pages/                  Routes
src/styles/                 Design tokens and global styles
keystatic.config.ts         Admin schema: what the owner can edit
```

### Where the brand colours came from

The palette was extracted from the vector data inside
`assets/KAYBEE STATIONERY.pdf`, not chosen by eye, so the site matches the
printed business cards and letterhead:

`#0054A6` deep blue · `#00AEEF` cyan · `#0072BC` / `#0095DA` mids ·
`#231F20` ink · `#F0EFE8` warm paper tint

The logo files in `public/brand/` are vector paths lifted from that same PDF, so
they are sharp at any size. `kaybee-logo-horizontal.svg` is a side-by-side
lockup built for the web header; the stacked `kaybee-logo.svg` matches the print
original.

---

## Known outstanding items

- **No product photography yet.** Pages show branded placeholders sized to the
  real slots. See `assets/NEEDED-IMAGES.md`.
- **No brochure yet.** The downloads page explains this rather than showing a
  broken link. Upload one through the admin and the page populates itself.
- **Brand logos.** Only Kaybee's is available as vector artwork. Every brand
  renders as a typographic card until logos are supplied.
- **No dimensional data published.** The size reference is an availability
  matrix by series and shaft size. Bore, outer diameter, width and tolerance
  figures are deliberately not published, because no verified source for them
  exists. See `assets/CONTENT-TO-CONFIRM.md`.
- **Printed stationery references a domain the company does not own**
  (`kaybeeinternational.com` appears in four places). Details in
  `assets/CONTENT-TO-CONFIRM.md`. This is a print fix, not a website one.
