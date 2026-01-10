import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getPublicFaqs, getPublicStorefront, type StorefrontFaq } from '@/lib/api';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Frequently asked questions about your visit',
};

export default async function FaqsPage() {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return null;

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) return null;

  // Fetch FAQs from separate endpoint
  const { faqs } = await getPublicFaqs(identifier);

  // Group FAQs by category
  const categorizedFaqs = faqs.reduce<Record<string, StorefrontFaq[]>>((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(categorizedFaqs);
  const hasBackgroundImage = !!storefront.settings.theme.backgroundImageUrl;

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about your visit
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-6 text-storefront-primary">
                {category}
              </h2>
              <div className="space-y-4">
                {categorizedFaqs[category]?.map((faq) => (
                  <details
                    key={faq.id}
                    className={`group border border-border rounded-lg overflow-hidden ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : ''}`}
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                      <span className="font-medium pr-4">{faq.question}</span>
                      <span className="text-2xl text-muted-foreground group-open:rotate-45 transition-transform flex-shrink-0">
                        +
                      </span>
                    </summary>
                    <div className="p-4 pt-0 text-muted-foreground whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No FAQs available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
