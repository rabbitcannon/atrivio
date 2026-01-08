/**
 * Site configuration
 * Centralizes environment-specific settings
 */

export const siteConfig = {
  /** Platform domain for subdomains (e.g., atrivio.io, dev.atrivio.io) */
  platformDomain: process.env['NEXT_PUBLIC_PLATFORM_DOMAIN'] || 'atrivio.io',

  /** CNAME target for custom domains */
  get cnameTarget() {
    return `cname.${this.platformDomain}`;
  },

  /** Build a subdomain URL */
  getSubdomainUrl(slug: string): string {
    return `https://${slug}.${this.platformDomain}`;
  },

  /** Check if a domain is a platform subdomain */
  isSubdomain(domain: string): boolean {
    return domain.endsWith(`.${this.platformDomain}`);
  },

  /** Extract slug from a subdomain */
  getSlugFromSubdomain(domain: string): string | null {
    if (!this.isSubdomain(domain)) return null;
    return domain.replace(`.${this.platformDomain}`, '');
  },
} as const;
