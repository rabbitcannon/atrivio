import { getPublicStorefront } from '@/lib/api';
import { notFound } from 'next/navigation';
import { CheckoutForm } from './_components/checkout-form';

interface CheckoutPageProps {
  params: Promise<{ identifier: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { identifier } = await params;

  const response = await getPublicStorefront(identifier);
  if (response.error || !response.data) {
    notFound();
  }

  const storefront = response.data;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {storefront.attraction.logoUrl && (
              <img
                src={storefront.attraction.logoUrl}
                alt={storefront.attraction.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <h1 className="text-xl font-bold">{storefront.attraction.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Checkout</h2>
          <p className="mt-2 text-muted-foreground">
            Complete your purchase for {storefront.attraction.name}
          </p>
        </div>

        <CheckoutForm
          identifier={identifier}
          attractionName={storefront.attraction.name}
        />
      </main>
    </div>
  );
}
