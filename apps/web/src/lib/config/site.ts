/**
 * Site configuration
 * Centralizes environment-specific settings
 */

// Known production domain pattern for detecting subdomains from any environment
const PRODUCTION_DOMAIN = 'atrivio.io';

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

  /** Check if a domain is a platform subdomain (works across environments) */
  isSubdomain(domain: string): boolean {
    // Check both current env domain and production domain pattern
    return (
      domain.endsWith(`.${this.platformDomain}`) || domain.endsWith(`.${PRODUCTION_DOMAIN}`)
    );
  },

  /** Extract slug from a subdomain (works across environments) */
  getSlugFromSubdomain(domain: string): string | null {
    if (domain.endsWith(`.${this.platformDomain}`)) {
      return domain.replace(`.${this.platformDomain}`, '');
    }
    if (domain.endsWith(`.${PRODUCTION_DOMAIN}`)) {
      return domain.replace(`.${PRODUCTION_DOMAIN}`, '');
    }
    return null;
  },

  /**
   * Get environment-aware URL for a domain
   * For subdomains: reconstructs with current env's platform domain
   * For custom domains: returns as-is
   */
  getDomainUrl(domain: string): string {
    const slug = this.getSlugFromSubdomain(domain);
    if (slug) {
      // It's a platform subdomain - rebuild with current env's domain
      return `https://${slug}.${this.platformDomain}`;
    }
    // It's a custom domain - use as-is
    return `https://${domain}`;
  },
} as const;
