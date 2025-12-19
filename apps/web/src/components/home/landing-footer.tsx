const footerLinks = {
  solutions: [
    { label: 'Staffing', href: '#staffing' },
    { label: 'Ticketing', href: '#ticketing' },
    { label: 'Operations', href: '#operations' },
    { label: 'Financials', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  resources: [
    { label: 'Help Center', href: '#' },
    { label: 'API Documentation', href: '#' },
    { label: 'Status', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-darkest))] px-5 py-20">
      <div className="mx-auto max-w-[var(--landing-container-max)]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a
              href="/"
              className="mb-5 flex items-center gap-2 text-2xl font-extrabold text-[hsl(var(--landing-text-primary))]"
            >
              <span className="text-3xl" role="img" aria-label="Ghost">
                👻
              </span>
              <span>UHP</span>
            </a>
            <p className="text-[hsl(var(--landing-text-muted))]">
              The ultimate multi-tenant, operator-centric platform for
              professional haunts and seasonal attractions.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="mb-5 font-semibold text-[hsl(var(--landing-text-primary))]">
              Solutions
            </h4>
            <nav aria-label="Solutions">
              <ul className="space-y-3">
                {footerLinks.solutions.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[hsl(var(--landing-text-muted))] transition-colors duration-[var(--landing-transition-fast)] hover:text-[hsl(var(--landing-accent-primary))]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-5 font-semibold text-[hsl(var(--landing-text-primary))]">
              Company
            </h4>
            <nav aria-label="Company">
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[hsl(var(--landing-text-muted))] transition-colors duration-[var(--landing-transition-fast)] hover:text-[hsl(var(--landing-accent-primary))]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-5 font-semibold text-[hsl(var(--landing-text-primary))]">
              Resources
            </h4>
            <nav aria-label="Resources">
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[hsl(var(--landing-text-muted))] transition-colors duration-[var(--landing-transition-fast)] hover:text-[hsl(var(--landing-accent-primary))]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 border-t border-[hsl(var(--landing-border-subtle))] pt-8 text-center text-sm text-[hsl(var(--landing-text-muted))]">
          © {new Date().getFullYear()} Ultimate Haunt Platform. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
