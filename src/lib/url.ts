/**
 * URL helpers for deploying under a path prefix.
 *
 * The production site runs at the root of kaybeint.com, but the staging copy
 * runs at ayushvjain.github.io/kaybee/. Astro rewrites the asset URLs it
 * generates itself, but it cannot rewrite paths written as plain strings in
 * `href` and `src` attributes, nor the image paths stored in CMS content.
 * Those go through `withBase` instead.
 *
 * At the root deployment `BASE_URL` is "/", so every call is a no-op.
 */

/** Trailing slash stripped: "" at root, "/kaybee" under a prefix. */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** Absolute origin for canonical URLs and structured data. */
export const SITE_URL = (import.meta.env.SITE || 'https://kaybeint.com').replace(/\/+$/, '');

/** True when this build is the staging copy, which must never be indexed. */
export const IS_STAGING = import.meta.env.PUBLIC_STAGING === 'true';

/** Anything already absolute, or a non-navigational scheme, is left alone. */
function isExternal(path: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path);
}

/**
 * Prefix a site-root-relative path with the deployment base.
 *
 * withBase('/about')   -> '/about'          at root
 *                      -> '/kaybee/about'   under a prefix
 */
export function withBase(path: string): string {
  if (!path) return path;
  if (isExternal(path)) return path;
  if (!path.startsWith('/')) return path;
  if (!BASE) return path;
  return `${BASE}/${path.replace(/^\/+/, '')}`;
}

/** Fully qualified URL, for canonical tags, Open Graph and JSON-LD. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${withBase(path.startsWith('/') ? path : `/${path}`)}`;
}

/**
 * Strip the base off the current pathname so it can be compared against the
 * logical routes used in navigation.
 */
export function logicalPath(pathname: string): string {
  const stripped = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return stripped.replace(/\/+$/, '') || '/';
}
