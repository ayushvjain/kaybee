# Kaybee International — Website Design

**Date:** 2026-09-17
**Status:** Approved design, pending implementation plan

## 1. Purpose

Build a marketing and product-reference website for Kaybee International, a
Chennai-based distributor of bearing accessories trading for over 50 years. The
site serves industrial manufacturers, OEMs and dealers across India who need to
identify the right plummer block, sleeve or locking component and enquire about it.

The site must be maintainable by a non-technical owner. Product descriptions,
photographs, the brochure, brand list and contact details all change without a
developer, without a database, and without the owner seeing any code.

## 2. Decisions

| Decision | Choice |
|---|---|
| Framework | Astro 5 + React + TypeScript |
| Admin CMS | Keystatic (`@keystatic/astro`), GitHub storage mode |
| Hosting | Cloudflare Pages, `@astrojs/cloudflare` adapter |
| Repository | `ayushvjain/kaybee` |
| Domain | `kaybeint.com` |
| Enquiry form | Web3Forms |
| Structure | Multi-page, plus a series/shaft-size reference matrix |
| Product imagery | Marked placeholders sized to real slots; owner uploads later |

## 3. Architecture

A single Astro project produces both the public site and the admin.

**Public pages are prerendered to static HTML at build time.** Content is read
with Keystatic's filesystem reader (`createReader`) from the repository checkout
that Cloudflare clones for the build — not from the GitHub API. GitHub storage
mode governs only where the *admin writes*; the build always reads local files.
No runtime database, no runtime API calls, no server cost for ordinary visitors.

**Only the admin runs on demand.** `/keystatic` and `/api/keystatic/*` are marked
`prerender = false` and execute as Cloudflare Workers functions. These are the
only non-static routes in the project.

The editing loop:

```
Owner edits in /keystatic  →  Keystatic commits to ayushvjain/kaybee
                           →  Cloudflare Pages rebuilds on push
                           →  Static site updated (~1 minute)
```

### 3.1 Cloudflare risk and fallback

Keystatic officially documents a Node adapter. Its GitHub-mode auth and commit
routes touch Node APIs, which on Cloudflare Workers requires the `nodejs_compat`
compatibility flag. Cloudflare is not a target Keystatic documents as tested.

**This is verified first, before any page work.** Implementation task 1 is a
spike: a minimal Astro + Keystatic + Cloudflare adapter project that builds and
serves the admin. Outcomes:

- **Works** — proceed with the single-project architecture above.
- **Fails** — fall back to splitting the deploy: the public site stays fully
  static on Cloudflare Pages, and the admin deploys as a separate small Vercel or
  Netlify project on `admin.kaybeint.com`, reading and committing to the same
  repository. DNS is already on Cloudflare, so this is a CNAME record. The
  content model, schema and site code are identical either way, so this fallback
  costs a deploy target and nothing else.

The fallback is cheap precisely because it is decided before pages are built on
top of the assumption.

### 3.2 Why React is minimal here

React is used for exactly two things: the Keystatic admin UI (which requires it)
and the enquiry form island. Every other component is a static Astro component
that ships zero JavaScript. This keeps the site fast on the mobile connections
that trade buyers actually use.

## 4. Site structure

| Route | Page | Contents |
|---|---|---|
| `/` | Home | Hero, 7-category product grid, 50-years credibility strip, authorised-brands band, non-standard/custom callout, enquiry CTA |
| `/about` | About | History, Chennai base and ready stock, authorised-distributor table, custom capability, why-Kaybee points |
| `/products` | Products index | Seven category cards |
| `/products/[slug]` | Product detail (×7) | Description, features, supplying brands, applicable series and sizes, image gallery, enquiry CTA |
| `/brands` | Brands | Card per brand with ranges covered; relationship type distinguished |
| `/size-reference` | Size reference | Series × shaft-size availability matrix |
| `/downloads` | Downloads | Brochure PDF and future catalogues |
| `/contact` | Contact | Phones, mobile, email, address, map, enquiry form |

### 4.1 Size reference scope

The matrix records **availability**: which series (S, SN, SNA, SNH, MNL) Kaybee
stocks across which shaft sizes (1″–7″). It is CMS-driven so the owner can mark
sizes in or out of stock.

It deliberately does **not** publish dimensional data — bore, outer diameter,
width, tolerances. No such data exists in the supplied assets, and fabricating
dimensions for load-bearing mechanical components would be actively dangerous to
a buyer selecting a part. If verified dimension sheets are supplied later, they
become a richer second version of this page.

## 5. Content model

Keystatic schema in `keystatic.config.ts`. Content is YAML and Markdoc in
`content/`, committed to the repository.

### Collections

**`products`** — `path: content/products/*`
- `name` (slug field), `order` (integer, controls display sequence)
- `summary` (text, single line — used on cards and meta descriptions)
- `description` (Markdoc document — rich text, owner-editable)
- `features` (array of text)
- `brands` (multi-select, references brand slugs)
- `series` (array of text — e.g. S, SN, SNA, SNH, MNL)
- `shaftSizeRange` (text — e.g. `1" – 7"`)
- `images` (array of image fields, each with required `alt` text)
- `seoTitle`, `seoDescription` (optional overrides)

**`brands`** — `path: content/brands/*`
- `name` (slug field), `order` (integer)
- `relationship` (select: `own` | `authorised-distributor` | `partner` | `stocked`)
- `ranges` (array of text — product ranges supplied)
- `blurb` (text, multiline)
- `logo` (image, optional — absent for most brands today)

**`downloads`** — `path: content/downloads/*`
- `title`, `description`, `file` (file field), `order`

### Singletons

**`company`** — `content/company.yaml`
- `landlines` (array of text), `mobile`, `email`
- `addressLines` (array of text), `city`, `pincode`, `state`
- `hours`, `mapEmbedUrl`, `socials` (array of label + url)

**`homepage`** — `content/homepage.yaml`
- `heroHeadline`, `heroSubhead`, `heroImage`
- `stats` (array of value + label)
- `whyUs` (array of heading + body)
- `customWorkTitle`, `customWorkBody`

**`about`** — `content/about.yaml`
- `intro` (Markdoc), `history` (Markdoc), `customCapability` (Markdoc)

### 5.1 Seed content

Seeded from the supplied brief.

Products: Adapter Sleeves, Withdrawal Sleeves, Plummer Blocks, Locating Rings,
Lock Nuts, Lock Washers, Bearings.

Brand-to-product mapping as supplied:

| Product | Brands |
|---|---|
| Adapter Sleeves | MASTA, MTN, VARUNA, AND, PB |
| Withdrawal Sleeves | MASTA, MTN, PB, AND, VARUNA |
| Plummer Blocks | MASTA, AEC, USA |
| Locating Rings | MASTA |
| Lock Nuts | MASTA, MTN, VARUNA, AND |
| Lock Washers | MASTA, MTN, VARUNA, AND |
| Bearings | SKILL, GEM (GEM: thrust bearings) |

Brand relationships seeded as: Kaybee `own`; MASTA, AEC, USA, MTN, AND, GEM
`authorised-distributor`; VARUNA `partner` (sourcing partner, per the brief).

**Open item flagged to the owner, not guessed:** PB and SKILL appear in the
product brand lists but not in the authorised-distributor table, so their
relationship is seeded as `stocked` and marked in `assets/CONTENT-TO-CONFIRM.md`
for the owner to correct in the admin. The brief's "seven established brands"
counts the distributor table only; with PB and SKILL the site shows nine, so the
homepage copy says "authorised distribution across seven brands" and the brands
page shows all nine with relationship labels. This is consistent rather than
contradictory.

## 6. Visual design

Palette extracted from the vector data in `KAYBEE STATIONERY.pdf` rather than
guessed:

| Token | Hex | Use |
|---|---|---|
| `--kb-blue` | `#0054A6` | Primary, headings, body links, buttons |
| `--kb-cyan` | `#00AEEF` | Accents, rules, icon strokes, gradient end |
| `--kb-blue-mid` | `#0072BC` | Gradient mid, hover states |
| `--kb-sky` | `#0095DA` | Gradient mid |
| `--kb-ink` | `#231F20` | Body text |
| `--kb-paper` | `#F0EFE8` | Warm section grounds, monogram watermark |

**Accessibility constraint:** `#00AEEF` on white is roughly 2.3:1 and fails WCAG
AA for text. It is restricted to large decorative elements, borders and icon
strokes. All body and link text uses `--kb-blue` or `--kb-ink`. Contrast is
checked during verification, not assumed.

**Signature device:** the KB monogram as a large outlined watermark on section
backgrounds, reproducing the treatment already used on the letterhead. This
carries brand presence on pages that have no photography yet, which is what makes
the placeholder period look deliberate rather than unfinished.

Layout follows the reference site's conventions — clean industrial grid, card
collections, generous whitespace, numbered section labels — in Kaybee's own
palette. Type is a humanist sans (Inter), consistent with the Arial-based
stationery.

## 7. Assets

### 7.1 Logo

The Kaybee logo is fully vector inside `KAYBEE STATIONERY.pdf` and has been
extracted successfully. Two SVGs are produced by hand-cleaning those paths:

- `public/brand/kaybee-logo.svg` — full lockup (monogram + KAYBEE + INTERNATIONAL)
- `public/brand/kaybee-monogram.svg` — KB mark alone, for favicon and watermark

Hand-cleaned because a direct PDF-to-SVG export carries the whole clipped page at
roughly 67 KB. The target is a minimal SVG containing only the four monogram
paths and the wordmark outlines.

### 7.2 Brand logos

Only Varuna has any logo asset, recoverable at 96×96 — too low-resolution to use,
and it is a partner's trademark, so it will not be redrawn by hand. All brands
therefore render as **typographic cards** in the brand palette. This is a
deliberate choice: nine consistent cards read better than two logos beside seven
gaps. The `logo` field exists in the schema so real logos drop in per-brand as
they arrive, with the card falling back to type when absent.

### 7.3 Missing assets

No product photography and no brochure exist in the supplied assets, despite the
brief referring to both. Handling:

- A single `ImagePlaceholder` component renders at the exact aspect ratio of the
  real slot, visibly marked as a placeholder, styled in the brand palette.
- `assets/NEEDED-IMAGES.md` lists every required shot with its intended slot,
  aspect ratio and minimum pixel dimensions.
- The brochure download is hidden automatically while the `downloads` collection
  is empty, so no broken link ships.

Replacing a placeholder is an upload in the admin. No layout work.

### 7.4 Domain correction required in print assets

`kaybeeinternational.com` is not owned by Kaybee but appears in the printed
stationery in four places, all of which direct customers to a domain the company
does not control:

| File | Location |
|---|---|
| `KAYBEE STATIONERY.pdf` p1 | Both business cards |
| `KAYBEE STATIONERY.pdf` p2 | Letterhead contact block |
| `KAYBEE STATIONERY.pdf` p3 | Envelope |
| `KAYBEE STATIONERY.cdr` | `metadata/textinfo.xml` (editable master, 4 instances) |

The CDR is the editable master; all four are correctable in one CorelDRAW pass to
`kaybeint.com`. This is outside the website's scope but is recorded here because
it is a live commercial problem and the website build is what surfaced it. The
website itself uses `kaybeint.com` throughout.

Note the intentional spelling difference confirmed by the owner: domain
`kaybeint.com` (single "e"), email `kaybeeint@gmail.com` (double "e").

## 8. Contact data

Both number sets are live and all are shown, so no enquiry is lost to an
outdated listing:

- Landlines: `044-42144320`, `044-23456253`, `+91 44 2533 0290`, `+91 44 2533 0295`
- Mobile / WhatsApp: `+91 98401 04262`
- Email: `kaybeeint@gmail.com`
- Address: Old No. 144, Thambu Chetty Street, Ground Floor, Chennai 600001, Tamil Nadu

All held in the `company` singleton and rendered from one place, so a change in
the admin updates the header, footer, contact page and structured data together.
Phones are `tel:` links and the mobile also offers a `wa.me` link.

## 9. Enquiry form

Web3Forms, submitting to `kaybeeint@gmail.com`.

Fields: name, company, phone (required), email, product category (select, sourced
from the `products` collection), shaft size, quantity, message.

- Access key in `PUBLIC_WEB3FORMS_KEY`, never committed.
- Honeypot field for spam.
- Client-side validation before submit; inline errors.
- Explicit success and failure states. On failure the form surfaces the phone,
  WhatsApp and email fallbacks rather than silently dropping the enquiry.
- Implemented as `EnquiryForm.tsx`, the site's only hydrated React island.

## 10. SEO and metadata

- Per-page `title` and `description`, editable for products via `seoTitle` and
  `seoDescription`.
- `LocalBusiness` JSON-LD built from the `company` singleton: name, address,
  phones, geo, opening hours.
- `Product` JSON-LD on product detail pages.
- `@astrojs/sitemap`, plus `robots.txt`.
- Canonical URLs on `https://kaybeint.com`.
- Open Graph and Twitter card images generated from the monogram and palette.
- Semantic headings, one `h1` per page, descriptive alt text required by schema
  on every image field.

## 11. Project layout

```
assets/                       Supplied source assets, left untouched
  NEEDED-IMAGES.md            Shot list for the owner
  CONTENT-TO-CONFIRM.md       Facts needing owner confirmation
content/                      CMS content, committed
  products/*.yaml
  brands/*.yaml
  downloads/*.yaml
  company.yaml  homepage.yaml  about.yaml
public/
  brand/                      Cleaned logo SVGs, favicons
  images/products/            Owner-uploaded photography
  downloads/                  Owner-uploaded PDFs
src/
  components/                 Header, Footer, Hero, ProductCard, BrandCard,
                              SizeMatrix, Monogram, ImagePlaceholder,
                              EnquiryForm.tsx, StatStrip, SectionLabel
  layouts/BaseLayout.astro
  lib/reader.ts               Keystatic reader, single content access point
  pages/                      Routes per section 4
    keystatic/[...params].astro
    api/keystatic/[...params].ts
  styles/tokens.css global.css
keystatic.config.ts
astro.config.mjs
tsconfig.json
package.json
```

Content is accessed only through `src/lib/reader.ts`. Pages never read the
filesystem directly, so the local-mode to GitHub-mode switch touches one file.

## 12. Configuration and secrets

| Variable | Purpose |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `KEYSTATIC_SECRET` | Keystatic session signing secret |
| `PUBLIC_WEB3FORMS_KEY` | Web3Forms access key |

Kept in `.env` locally and in Cloudflare Pages environment variables in
production. `.env` is gitignored; `.env.example` documents the names with no
values. Keystatic storage is `local` in development and `github` in production,
so the owner edits live while a developer works offline against the filesystem.

A GitHub App must be created against `ayushvjain/kaybee` with contents
read/write permission. Exact steps are written into `README.md`, because this is
the one setup step that cannot be automated and will need repeating if secrets
are ever rotated.

## 13. Testing and verification

No completion claim is made without the corresponding command output.

| Check | Method |
|---|---|
| Types | `astro check` clean |
| Build | `npm run build` succeeds; public routes confirmed prerendered |
| Admin loads | `/keystatic` renders and GitHub sign-in completes |
| Round trip | A content edit saved in the admin appears as a repo commit and shows on rebuild |
| Form | Real submission arrives at the target inbox; failure path shows fallbacks |
| Responsive | Every page at 375px, 768px and 1440px |
| Contrast | Text and background pairs verified against WCAG AA |
| Links | No broken internal links; no remaining `kaybeeinternational.com` reference |
| Metadata | JSON-LD validates; sitemap lists all routes |

## 14. Out of scope

Deliberately excluded to keep the first version shippable:

- Dimensional specification tables (no verified source data — see 4.1)
- E-commerce, pricing, stock quantities, or customer accounts
- Multi-language content
- Blog or news section
- Redrawing partner brand logos
- Correcting the print stationery files (flagged in 7.4, owner's action)
