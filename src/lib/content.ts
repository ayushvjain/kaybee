import { createReader } from '@keystatic/core/reader';
import Markdoc from '@markdoc/markdoc';
import keystaticConfig from '../../keystatic.config';

/**
 * Single access point for all site content.
 *
 * Pages never touch the filesystem or the Keystatic reader directly, so
 * switching storage backends or content shapes touches only this file.
 * Everything here runs at build time against the repository checkout.
 */
const reader = createReader(process.cwd(), keystaticConfig);

/* ------------------------------------------------------------------ *
 * Markdoc rendering
 * ------------------------------------------------------------------ */

/**
 * Keystatic returns `{ node }` (a Markdoc AST) from content fields. Transform
 * and render it to an HTML string for `set:html`.
 */
export function renderMarkdoc(content: unknown): string {
  if (!content) return '';
  const node = (content as { node?: unknown }).node ?? content;
  try {
    return Markdoc.renderers.html(Markdoc.transform(node as never));
  } catch {
    return '';
  }
}

/** Resolve a lazy content field, tolerating both the function and plain shapes. */
async function resolveContent(field: unknown): Promise<string> {
  if (typeof field === 'function') {
    return renderMarkdoc(await (field as () => Promise<unknown>)());
  }
  return renderMarkdoc(field);
}

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type ProductImage = { file: string | null; alt: string };

export type Product = {
  slug: string;
  name: string;
  order: number;
  summary: string;
  descriptionHtml: string;
  features: string[];
  brands: string[];
  series: string[];
  shaftSizeRange: string;
  images: ProductImage[];
  seoTitle: string;
  seoDescription: string;
};

export type BrandRelationship = 'own' | 'authorised-distributor' | 'partner' | 'stocked';

export type Brand = {
  slug: string;
  name: string;
  order: number;
  relationship: BrandRelationship;
  ranges: string[];
  blurb: string;
  logo: string | null;
};

export type Download = {
  slug: string;
  title: string;
  order: number;
  description: string;
  file: string | null;
};

/* ------------------------------------------------------------------ *
 * Collections
 * ------------------------------------------------------------------ */

const byOrderThenName = <T extends { order: number; name?: string; title?: string }>(a: T, b: T) =>
  a.order - b.order || (a.name ?? a.title ?? '').localeCompare(b.name ?? b.title ?? '');

export async function getProducts(): Promise<Product[]> {
  const entries = await reader.collections.products.all();

  const products = await Promise.all(
    entries.map(async ({ slug, entry }) => ({
      slug,
      name: entry.name,
      order: entry.order ?? 0,
      summary: entry.summary ?? '',
      descriptionHtml: await resolveContent(entry.description),
      features: [...(entry.features ?? [])],
      brands: [...(entry.brands ?? [])],
      series: [...(entry.series ?? [])],
      shaftSizeRange: entry.shaftSizeRange ?? '',
      images: (entry.images ?? []).map((img) => ({
        file: img.file ?? null,
        alt: img.alt ?? '',
      })),
      seoTitle: entry.seoTitle ?? '',
      seoDescription: entry.seoDescription ?? '',
    }))
  );

  return products.sort(byOrderThenName);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getBrands(): Promise<Brand[]> {
  const entries = await reader.collections.brands.all();

  return entries
    .map(({ slug, entry }) => ({
      slug,
      name: entry.name,
      order: entry.order ?? 0,
      relationship: (entry.relationship ?? 'stocked') as BrandRelationship,
      ranges: [...(entry.ranges ?? [])],
      blurb: entry.blurb ?? '',
      logo: entry.logo ?? null,
    }))
    .sort(byOrderThenName);
}

export async function getDownloads(): Promise<Download[]> {
  const entries = await reader.collections.downloads.all();

  return entries
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      order: entry.order ?? 0,
      description: entry.description ?? '',
      file: entry.file ?? null,
    }))
    .sort(byOrderThenName);
}

/* ------------------------------------------------------------------ *
 * Singletons
 * ------------------------------------------------------------------ */

export async function getCompany() {
  const c = await reader.singletons.company.read();

  const landlines = [...(c?.landlines ?? [])].filter(Boolean);
  const addressLines = [...(c?.addressLines ?? [])].filter(Boolean);

  return {
    legalName: c?.legalName || 'Kaybee International',
    tagline: c?.tagline || '',
    landlines,
    mobile: c?.mobile || '',
    email: c?.email || '',
    addressLines,
    city: c?.city || '',
    pincode: c?.pincode || '',
    state: c?.state || '',
    hours: c?.hours || '',
    mapEmbedUrl: c?.mapEmbedUrl || '',
    gstin: c?.gstin || '',
    /** Single-line address for JSON-LD and meta tags. */
    addressOneLine: [...addressLines, c?.city, c?.pincode, c?.state].filter(Boolean).join(', '),
  };
}

export async function getHomepage() {
  const h = await reader.singletons.homepage.read();

  return {
    heroEyebrow: h?.heroEyebrow || '',
    heroHeadline: h?.heroHeadline || '',
    heroSubhead: h?.heroSubhead || '',
    heroImage: { file: h?.heroImage?.file ?? null, alt: h?.heroImage?.alt ?? '' },
    stats: [...(h?.stats ?? [])],
    whyUs: [...(h?.whyUs ?? [])],
    customWorkTitle: h?.customWorkTitle || '',
    customWorkBody: h?.customWorkBody || '',
  };
}

export async function getAbout() {
  const a = await reader.singletons.about.read();

  return {
    heading: a?.heading || 'About Us',
    introHtml: await resolveContent(a?.intro),
    historyHeading: a?.historyHeading || '',
    history: a?.history || '',
    customHeading: a?.customHeading || '',
    custom: a?.custom || '',
  };
}

export async function getSizeReference() {
  const s = await reader.singletons.sizeReference.read();

  return {
    heading: s?.heading || 'Size Reference',
    intro: s?.intro || '',
    shaftSizes: [...(s?.shaftSizes ?? [])].filter(Boolean),
    rows: (s?.rows ?? []).map((r) => ({
      series: r.series,
      note: r.note ?? '',
      available: [...(r.available ?? [])],
    })),
    footnote: s?.footnote || '',
  };
}

/* ------------------------------------------------------------------ *
 * Presentation helpers
 * ------------------------------------------------------------------ */

export const RELATIONSHIP_LABEL: Record<BrandRelationship, string> = {
  own: 'Our own brand',
  'authorised-distributor': 'Authorised distributor',
  partner: 'Sourcing partner',
  stocked: 'Stocked brand',
};

/** Strip spaces, dashes and slashes so a printed number becomes a dialable one. */
export function telHref(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return `tel:${cleaned}`;
  if (cleaned.startsWith('0')) return `tel:+91${cleaned.slice(1)}`;
  return `tel:+91${cleaned}`;
}

/** wa.me requires a bare international number with no punctuation. */
export function whatsappHref(raw: string, message?: string): string {
  const digits = raw.replace(/\D/g, '');
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  const base = `https://wa.me/${withCc}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoHref(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}
