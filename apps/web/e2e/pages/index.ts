/**
 * Page Objects Index
 *
 * Re-exports all page objects for convenient imports.
 */

// Base
export { BasePage } from './base.page';

// Auth
export { LoginPage, createLoginPage } from './auth/login.page';

// Storefront
export { StorefrontPage, createStorefrontPage } from './storefront/storefront.page';

// Payments
export { CheckoutPage, createCheckoutPage } from './payments/checkout.page';
export { CheckoutSuccessPage, createCheckoutSuccessPage } from './payments/checkout-success.page';
