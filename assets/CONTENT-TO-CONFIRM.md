# Content needing the owner's confirmation

Everything listed here was written from the supplied brief and is live on the
site. None of it is guessed silently — each item below is either an inference
that should be checked, or a fact the brief left ambiguous. All of it is
editable at `kaybeint.com/keystatic`.

---

## 1. The printed stationery points at a domain you do not own

**This is the most commercially urgent item here, and it is not a website
problem.**

`kaybeeinternational.com` appears in the printed stationery in four places. The
company's actual domain is `kaybeint.com`. Anyone typing the address from a
business card or letterhead is being sent somewhere Kaybee does not control.

| File | Location | Instances |
|---|---|---|
| `KAYBEE STATIONERY.pdf` | Page 1 — both business cards (Pravin Kamdar, Ashish Kamdar) | 2 |
| `KAYBEE STATIONERY.pdf` | Page 2 — letterhead contact block | 1 |
| `KAYBEE STATIONERY.pdf` | Page 3 — envelope | 1 |
| `KAYBEE STATIONERY.cdr` | `metadata/textinfo.xml` — the editable master | 4 |

The `.cdr` is the editable CorelDRAW master, so all four can be corrected in one
pass before the next print run. The website itself uses `kaybeint.com`
throughout and contains no reference to the wrong domain.

**Also worth checking:** the domain is `kaybeint.com` (one "e") while the email
is `kaybeeint@gmail.com` (two "e"s). This was confirmed as intentional, but it
is an easy thing for customers to mistype. A `@kaybeint.com` email address on
the domain you own would be more robust than a Gmail address long-term.

---

## 2. Two sets of phone numbers are both published

The brief and the printed stationery gave different landlines. Both sets are
shown on the site, on the instruction that both are live, so no enquiry is lost:

- `044-42144320` and `044-23456253` — from the brief
- `+91 44 2533 0290` and `+91 44 2533 0295` — from the stationery
- `+91 98401 04262` — mobile and WhatsApp

**If any of these no longer ring, remove them** in the admin under *Contact
details*. Four landlines is a lot to show; two would look more deliberate.

---

## 3. PB and SKILL — relationship unconfirmed

The brief lists these two brands against products, but they do **not** appear in
the "Authorised Distributors For" table. They are therefore published as
**Stocked brand**, which is the neutral description.

| Brand | Products | Currently shown as |
|---|---|---|
| PB | Adapter Sleeves, Withdrawal Sleeves | Stocked brand |
| SKILL | Bearings | Stocked brand |

If either is actually an authorised distribution, change the **Relationship**
field on that brand. Note this changes the "authorised distribution across seven
brands" figure on the homepage and About page, because that number is counted
from the data rather than typed in.

---

## 4. VARUNA is recorded as an authorised distributor

The brief presented VARUNA two ways: inside the authorised-distributor table,
and separately as "a partner brand where we source products from".

It is published as **Authorised distributor**, with the sourcing relationship
described in its blurb. This keeps the brand count at **seven**, matching the
"seven established brands" claim in your own About copy.

If VARUNA should be presented purely as a sourcing partner, change its
**Relationship** to *Sourcing partner* — but be aware the brand count will then
read **six** across the site.

---

## 5. Size reference — availability is not yet verified per series

The brief states ready stock "for shaft sizes from 1" to 7", covering S, SN,
SNA, SNH and MNL series". Every series is therefore marked available across the
full range.

**In reality the coverage is unlikely to be uniform** — larger housings usually
start at a bigger shaft size. Nobody guessed at those exceptions; the table
simply reflects what the brief said.

Please correct it under *Size reference* in the admin: untick any shaft size a
series is not stocked in. The shaft size columns shown are
`1"`, `1.1/2"`, `2"`, `2.1/2"`, `3"`, `3.1/2"`, `4"`, `5"`, `6"`, `7"` — adjust
these too if the real increments differ.

### No dimensional data is published, deliberately

The site publishes **availability only** — which series in which shaft sizes. It
does not publish bore, outer diameter, width or tolerance figures, because no
verified source for them was supplied. Publishing invented dimensions for
load-bearing components could lead a buyer to fit the wrong part.

If you have manufacturer dimension sheets, send them and the size reference can
become a proper specification table. That would be a genuinely strong
differentiator over a manufacturer's own site.

---

## 6. Figures on the homepage

The four statistics are typed in, not calculated, so they need a sanity check:

| Figure | Shown as | Note |
|---|---|---|
| `50+` | Years serving industry and the trade | Brief says "over five decades"; site states 1975 as the founding year throughout. Confirm 1975 is right. |
| `9` | Brands supplied | Ten brand entries exist, of which Kaybee is your own, leaving nine supplied. Update if brands are added or removed. |
| `1" to 7"` | Plummer block shaft sizes in stock | From the brief. |
| `5` | Housing series held as ready stock | S, SN, SNA, SNH, MNL. |

## 7. Product descriptions use standard industry designations

Product copy refers to the common designation series — **H** for adapter
sleeves, **AH** for withdrawal sleeves, **KM** for lock nuts, **MB** and **W**
for lock washers. These are standard industry references, described as such
rather than as a claim about your specific stock list.

If you would rather cite exact designations you actually hold, that is a stronger
statement and easy to edit under each product.

## 8. Details not supplied, currently omitted

These fields exist in the admin but are empty, so nothing renders for them:

- **Google Maps location** — paste the `src` from a Google Maps "Embed a map"
  iframe into *Contact details → Google Maps embed URL* and a map appears on the
  contact page.
- **GSTIN** — optional.
- **Business hours** — currently published as "Monday to Saturday, 10:00 to
  19:00". This was assumed. Please correct it.
- **Social media** — no accounts were supplied, so no social links are shown.
