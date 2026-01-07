import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { adminClient, closeTestApp, createTestApp, TEST_ORGS } from '../helpers/index.js';
import { getTestApp } from '../helpers/test-app.js';

// Test Stripe account ID
const TEST_STRIPE_ACCOUNT = 'acct_test_webhook_123';

describe('Stripe Webhooks (E2E)', () => {
  beforeAll(async () => {
    // Ensure STRIPE_WEBHOOK_SECRET is NOT set so webhook skips signature verification
    delete process.env['STRIPE_WEBHOOK_SECRET'];
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // Helper to send a webhook event
  async function sendWebhook(event: {
    id: string;
    type: string;
    data: { object: unknown };
    account?: string;
  }) {
    const app = getTestApp();
    return app.inject({
      method: 'POST',
      url: '/api/v1/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'test_signature', // Not validated in test mode
      },
      payload: {
        id: event.id,
        object: 'event',
        type: event.type,
        api_version: '2024-12-18.acacia',
        data: event.data,
        account: event.account,
      },
    });
  }

  describe('account.updated webhook', () => {
    beforeEach(async () => {
      // Ensure test account exists in database
      await adminClient.from('stripe_accounts').upsert(
        {
          org_id: TEST_ORGS.nightmareManor,
          stripe_account_id: TEST_STRIPE_ACCOUNT,
          status: 'onboarding',
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
        },
        { onConflict: 'org_id' }
      );
    });

    afterAll(async () => {
      // Cleanup webhook records
      await adminClient.from('stripe_webhooks').delete().like('stripe_event_id', 'evt_test_%');
    });

    it('should update account status to active when fully onboarded', async () => {
      const response = await sendWebhook({
        id: `evt_test_${Date.now()}_active`,
        type: 'account.updated',
        data: {
          object: {
            id: TEST_STRIPE_ACCOUNT,
            object: 'account',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
            country: 'US',
            default_currency: 'usd',
            business_type: 'company',
            business_profile: { name: 'Test Business' },
            capabilities: { card_payments: 'active', transfers: 'active' },
            requirements: { currently_due: [], eventually_due: [], past_due: [] },
          },
        },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({ received: true });

      // Verify database was updated
      const { data: account } = await adminClient
        .from('stripe_accounts')
        .select('*')
        .eq('stripe_account_id', TEST_STRIPE_ACCOUNT)
        .single();

      expect(account).toBeDefined();
      expect(account?.status).toBe('active');
      expect(account?.charges_enabled).toBe(true);
      expect(account?.payouts_enabled).toBe(true);
      expect(account?.details_submitted).toBe(true);
      expect(account?.business_name).toBe('Test Business');
    });

    it('should update account status to restricted when charges not enabled', async () => {
      const response = await sendWebhook({
        id: `evt_test_${Date.now()}_restricted`,
        type: 'account.updated',
        data: {
          object: {
            id: TEST_STRIPE_ACCOUNT,
            object: 'account',
            charges_enabled: false,
            payouts_enabled: false,
            details_submitted: true,
            country: 'US',
            default_currency: 'usd',
            requirements: {
              currently_due: ['individual.verification.document'],
              eventually_due: [],
              past_due: [],
            },
          },
        },
      });

      expect(response.statusCode).toBe(201);

      const { data: account } = await adminClient
        .from('stripe_accounts')
        .select('status, charges_enabled')
        .eq('stripe_account_id', TEST_STRIPE_ACCOUNT)
        .single();

      expect(account?.status).toBe('restricted');
      expect(account?.charges_enabled).toBe(false);
    });

    it('should handle idempotency - same event processed twice', async () => {
      const eventId = `evt_test_${Date.now()}_idempotent`;

      // Send first time
      const response1 = await sendWebhook({
        id: eventId,
        type: 'account.updated',
        data: {
          object: {
            id: TEST_STRIPE_ACCOUNT,
            object: 'account',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
          },
        },
      });
      expect(response1.statusCode).toBe(201);

      // Send second time - should succeed but not reprocess
      const response2 = await sendWebhook({
        id: eventId,
        type: 'account.updated',
        data: {
          object: {
            id: TEST_STRIPE_ACCOUNT,
            object: 'account',
            charges_enabled: false, // Different data
            payouts_enabled: false,
            details_submitted: true,
          },
        },
      });
      expect(response2.statusCode).toBe(201);

      // Verify account still has original data (charges_enabled: true)
      const { data: account } = await adminClient
        .from('stripe_accounts')
        .select('charges_enabled')
        .eq('stripe_account_id', TEST_STRIPE_ACCOUNT)
        .single();

      // Should still be true from first processing
      expect(account?.charges_enabled).toBe(true);
    });
  });

  describe('charge.succeeded webhook', () => {
    beforeEach(async () => {
      // Ensure test account exists
      await adminClient.from('stripe_accounts').upsert(
        {
          org_id: TEST_ORGS.nightmareManor,
          stripe_account_id: TEST_STRIPE_ACCOUNT,
          status: 'active',
          charges_enabled: true,
          payouts_enabled: true,
          details_submitted: true,
        },
        { onConflict: 'org_id' }
      );
    });

    afterAll(async () => {
      // Cleanup
      await adminClient.from('stripe_transactions').delete().like('stripe_charge_id', 'ch_test_%');
      await adminClient.from('stripe_webhooks').delete().like('stripe_event_id', 'evt_test_%');
    });

    it('should record a successful charge with platform fee', async () => {
      const chargeId = `ch_test_${Date.now()}`;
      const eventId = `evt_test_${Date.now()}_charge`;

      const response = await sendWebhook({
        id: eventId,
        type: 'charge.succeeded',
        account: TEST_STRIPE_ACCOUNT,
        data: {
          object: {
            id: chargeId,
            object: 'charge',
            amount: 5000, // $50.00
            amount_captured: 5000,
            currency: 'usd',
            application_fee_amount: 500, // $5.00 platform fee
            description: 'Test ticket purchase',
            receipt_email: 'customer@example.com',
            billing_details: { email: 'customer@example.com' },
            metadata: { order_id: 'test-123' },
          },
        },
      });

      expect(response.statusCode).toBe(201);

      // Verify transaction was recorded
      const { data: transaction } = await adminClient
        .from('stripe_transactions')
        .select('*')
        .eq('stripe_charge_id', chargeId)
        .single();

      expect(transaction).toBeDefined();
      expect(transaction?.type).toBe('charge');
      expect(transaction?.status).toBe('succeeded');
      expect(transaction?.amount).toBe(5000);
      expect(transaction?.platform_fee).toBe(500);
      expect(transaction?.customer_email).toBe('customer@example.com');
    });
  });

  describe('charge.refunded webhook', () => {
    const chargeId = `ch_test_refund_${Date.now()}`;

    beforeAll(async () => {
      // Ensure test account exists
      await adminClient.from('stripe_accounts').upsert(
        {
          org_id: TEST_ORGS.nightmareManor,
          stripe_account_id: TEST_STRIPE_ACCOUNT,
          status: 'active',
          charges_enabled: true,
          payouts_enabled: true,
          details_submitted: true,
        },
        { onConflict: 'org_id' }
      );

      // Get the account ID for the transaction
      const { data: account } = await adminClient
        .from('stripe_accounts')
        .select('id')
        .eq('stripe_account_id', TEST_STRIPE_ACCOUNT)
        .single();

      // Create a transaction to refund
      await adminClient.from('stripe_transactions').insert({
        stripe_account_id: account?.id,
        stripe_charge_id: chargeId,
        type: 'charge',
        status: 'succeeded',
        amount: 5000,
        currency: 'usd',
        platform_fee: 500,
        stripe_fee: 175,
        net_amount: 4325,
      });
    });

    afterAll(async () => {
      await adminClient.from('stripe_transactions').delete().eq('stripe_charge_id', chargeId);
      await adminClient.from('stripe_webhooks').delete().like('stripe_event_id', 'evt_test_%');
    });

    it('should update transaction status to refunded', async () => {
      const response = await sendWebhook({
        id: `evt_test_${Date.now()}_refund`,
        type: 'charge.refunded',
        data: {
          object: {
            id: chargeId,
            object: 'charge',
            amount: 5000,
            amount_refunded: 5000, // Full refund
          },
        },
      });

      expect(response.statusCode).toBe(201);

      // Verify transaction status was updated
      const { data: transaction } = await adminClient
        .from('stripe_transactions')
        .select('status')
        .eq('stripe_charge_id', chargeId)
        .single();

      expect(transaction?.status).toBe('refunded');
    });
  });

  describe('Webhook validation', () => {
    it('should reject invalid JSON payload', async () => {
      const app = getTestApp();
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/webhooks/stripe',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'test',
        },
        payload: 'not valid json',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
