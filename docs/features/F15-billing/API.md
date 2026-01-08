# F15: Platform Billing - API Design

## Overview

Platform billing APIs for managing module subscriptions, viewing billing information, and processing usage-based charges.

## Base URLs

```
# Organization billing (authenticated)
/api/v1/organizations/:orgId/billing

# Admin billing management (super admin)
/api/v1/admin/billing

# Public pricing (unauthenticated)
/api/v1/public/pricing
```

---

## Public Endpoints

### GET /api/v1/public/pricing

Get public pricing information.

**Response (200):**
```json
{
  "platform_fee": {
    "default_percent": 2.5,
    "description": "Platform fee on ticket sales"
  },
  "volume_discounts": [
    {
      "tier": "standard",
      "name": "Standard",
      "min_annual_sales": 0,
      "max_annual_sales": 49999,
      "platform_fee_percent": 2.5
    },
    {
      "tier": "bronze",
      "name": "Starter",
      "min_annual_sales": 50000,
      "max_annual_sales": 149999,
      "platform_fee_percent": 2.0,
      "benefits": ["Priority support"]
    },
    {
      "tier": "silver",
      "name": "Growth",
      "min_annual_sales": 150000,
      "max_annual_sales": 499999,
      "platform_fee_percent": 1.5,
      "benefits": ["Priority support", "Dedicated Slack channel"]
    },
    {
      "tier": "gold",
      "name": "Enterprise",
      "min_annual_sales": 500000,
      "max_annual_sales": null,
      "platform_fee_percent": 1.0,
      "benefits": ["Priority support", "Dedicated Slack", "Account manager", "Custom integrations"]
    }
  ],
  "modules": [
    {
      "key": "scheduling",
      "name": "Staff Scheduling",
      "description": "Staff scheduling with availability, shift templates, and swap requests",
      "pricing": {
        "monthly": 29,
        "seasonal": 99,
        "annual": 290
      },
      "features": [
        "Shift templates",
        "Staff availability",
        "Shift swap requests",
        "Schedule publishing"
      ]
    },
    {
      "key": "inventory",
      "name": "Inventory Management",
      "description": "Track costumes, props, and equipment",
      "pricing": {
        "monthly": 19,
        "seasonal": 69,
        "annual": 190
      }
    },
    {
      "key": "virtual_queue",
      "name": "Virtual Queue",
      "description": "Real-time virtual queue with guest notifications",
      "pricing": {
        "monthly": 49,
        "seasonal": 149,
        "annual": 490
      }
    },
    {
      "key": "analytics_pro",
      "name": "Analytics Pro",
      "description": "Advanced analytics with custom reports and exports",
      "pricing": {
        "monthly": 29,
        "seasonal": 99,
        "annual": 290
      }
    },
    {
      "key": "custom_domains",
      "name": "Custom Domains",
      "description": "Use your own domain for your storefront",
      "pricing": {
        "monthly": 9,
        "annual": 99
      }
    },
    {
      "key": "sms_notifications",
      "name": "SMS Notifications",
      "description": "SMS delivery for queue alerts and reminders",
      "pricing": {
        "per_message": 0.02
      },
      "usage_based": true
    }
  ],
  "included_free": [
    "Ticketing & ticket sales",
    "Guest check-in",
    "Basic analytics",
    "Public storefront",
    "Unlimited staff",
    "Unlimited attractions"
  ]
}
```

---

## Organization Billing Endpoints

### GET /api/v1/organizations/:orgId/billing

Get organization billing summary.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "billing_tier": "free",
  "volume_tier": "standard",
  "platform_fee_percent": 2.5,
  "annual_sales": 32500,
  "next_tier": {
    "name": "Starter",
    "threshold": 50000,
    "remaining": 17500,
    "platform_fee_percent": 2.0
  },
  "active_modules": [
    {
      "key": "scheduling",
      "name": "Staff Scheduling",
      "status": "active",
      "billing_cycle": "monthly",
      "price": 29,
      "current_period_end": "2025-02-15T00:00:00Z"
    }
  ],
  "billing_contact": {
    "email": "billing@terrortrail.com",
    "name": "Terror Trail LLC"
  },
  "stripe_customer_id": "cus_xxx",
  "has_payment_method": true,
  "mtd_summary": {
    "platform_fees": 125.50,
    "module_charges": 29.00,
    "usage_charges": 12.40,
    "total": 166.90
  }
}
```

---

### GET /api/v1/organizations/:orgId/billing/transactions

List billing transactions.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Query Parameters:**
- `page`, `limit` - Pagination
- `type` - Filter by type (platform_fee, module_subscription, usage_charge)
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "data": [
    {
      "id": "pt_uuid",
      "type": "platform_fee",
      "amount": 12.50,
      "description": "Platform fee on order #1234",
      "reference": {
        "type": "order",
        "id": "order_uuid"
      },
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "pt_uuid_2",
      "type": "module_subscription",
      "amount": 29.00,
      "description": "Staff Scheduling - Monthly",
      "reference": {
        "type": "subscription",
        "id": "sub_uuid"
      },
      "stripe_invoice_id": "in_xxx",
      "created_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "pt_uuid_3",
      "type": "usage_charge",
      "amount": 4.20,
      "description": "SMS Notifications - 210 messages",
      "reference": {
        "type": "usage",
        "id": "usage_uuid"
      },
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "total_amount": 1250.00
  }
}
```

---

### GET /api/v1/organizations/:orgId/billing/usage

Get usage summary for usage-based modules.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Query Parameters:**
- `module` - Filter by module (e.g., sms_notifications)
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "usage": [
    {
      "module": "sms_notifications",
      "usage_type": "sms_message",
      "quantity": 523,
      "unit_price": 0.02,
      "total": 10.46,
      "breakdown": [
        {
          "type": "queue_notification",
          "quantity": 412,
          "total": 8.24
        },
        {
          "type": "shift_reminder",
          "quantity": 111,
          "total": 2.22
        }
      ]
    }
  ],
  "unbilled_total": 10.46
}
```

---

## Module Subscription Endpoints

### GET /api/v1/organizations/:orgId/billing/modules

List available modules and current subscriptions.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "available_modules": [
    {
      "key": "scheduling",
      "name": "Staff Scheduling",
      "description": "Staff scheduling with availability and shift management",
      "pricing": {
        "monthly": 29,
        "seasonal": 99,
        "annual": 290
      },
      "current_subscription": {
        "id": "sub_uuid",
        "status": "active",
        "billing_cycle": "monthly",
        "price": 29,
        "current_period_start": "2025-01-15T00:00:00Z",
        "current_period_end": "2025-02-15T00:00:00Z",
        "cancel_at_period_end": false
      }
    },
    {
      "key": "inventory",
      "name": "Inventory Management",
      "description": "Track costumes, props, and equipment",
      "pricing": {
        "monthly": 19,
        "seasonal": 69,
        "annual": 190
      },
      "current_subscription": null
    },
    {
      "key": "virtual_queue",
      "name": "Virtual Queue",
      "description": "Real-time virtual queue with notifications",
      "pricing": {
        "monthly": 49,
        "seasonal": 149,
        "annual": 490
      },
      "current_subscription": null
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/billing/modules/:moduleKey/subscribe

Subscribe to a module.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Request:**
```json
{
  "billing_cycle": "monthly",
  "payment_method_id": "pm_xxx"
}
```

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_uuid",
    "module_key": "inventory",
    "status": "active",
    "billing_cycle": "monthly",
    "price": 19,
    "current_period_start": "2025-01-15T00:00:00Z",
    "current_period_end": "2025-02-15T00:00:00Z",
    "stripe_subscription_id": "sub_xxx"
  },
  "invoice": {
    "id": "in_xxx",
    "amount": 19,
    "status": "paid",
    "pdf_url": "https://..."
  },
  "message": "Successfully subscribed to Inventory Management"
}
```

**Response (402 - Payment Required):**
```json
{
  "error": "PAYMENT_FAILED",
  "message": "Payment method declined",
  "requires_action": false
}
```

---

### PUT /api/v1/organizations/:orgId/billing/modules/:moduleKey/subscription

Update module subscription (change billing cycle).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Request:**
```json
{
  "billing_cycle": "annual",
  "prorate": true
}
```

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_uuid",
    "module_key": "scheduling",
    "status": "active",
    "billing_cycle": "annual",
    "price": 290,
    "current_period_start": "2025-01-15T00:00:00Z",
    "current_period_end": "2026-01-15T00:00:00Z"
  },
  "proration": {
    "credit": 14.50,
    "charge": 290.00,
    "net": 275.50
  },
  "message": "Subscription updated to annual billing"
}
```

---

### DELETE /api/v1/organizations/:orgId/billing/modules/:moduleKey/subscription

Cancel module subscription.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Query Parameters:**
- `immediate` - Cancel immediately (default: false, cancels at period end)

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_uuid",
    "module_key": "scheduling",
    "status": "cancelled",
    "cancel_at_period_end": true,
    "current_period_end": "2025-02-15T00:00:00Z",
    "access_until": "2025-02-15T00:00:00Z"
  },
  "message": "Subscription will cancel on Feb 15, 2025. You'll have access until then."
}
```

---

### POST /api/v1/organizations/:orgId/billing/modules/:moduleKey/reactivate

Reactivate a cancelled subscription (before period end).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_uuid",
    "module_key": "scheduling",
    "status": "active",
    "cancel_at_period_end": false,
    "current_period_end": "2025-02-15T00:00:00Z"
  },
  "message": "Subscription reactivated"
}
```

---

## Payment Method Endpoints

### GET /api/v1/organizations/:orgId/billing/payment-methods

List payment methods.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "default_payment_method": "pm_xxx",
  "payment_methods": [
    {
      "id": "pm_xxx",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2026
      },
      "is_default": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/billing/payment-methods

Add a payment method.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Request:**
```json
{
  "payment_method_id": "pm_xxx",
  "set_default": true
}
```

**Response (200):**
```json
{
  "payment_method": {
    "id": "pm_xxx",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2026
    },
    "is_default": true
  },
  "message": "Payment method added"
}
```

---

### DELETE /api/v1/organizations/:orgId/billing/payment-methods/:paymentMethodId

Remove a payment method.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Response (200):**
```json
{
  "message": "Payment method removed"
}
```

**Response (400):**
```json
{
  "error": "CANNOT_REMOVE_DEFAULT",
  "message": "Cannot remove default payment method while subscriptions are active"
}
```

---

### PUT /api/v1/organizations/:orgId/billing/payment-methods/:paymentMethodId/default

Set default payment method.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Response (200):**
```json
{
  "message": "Default payment method updated"
}
```

---

## Billing Settings Endpoints

### GET /api/v1/organizations/:orgId/billing/settings

Get billing settings.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "billing_email": "billing@terrortrail.com",
  "billing_address": {
    "line1": "123 Scary Lane",
    "city": "Halloween Town",
    "state": "CA",
    "postal_code": "90210",
    "country": "US"
  },
  "tax_exempt": false,
  "invoice_settings": {
    "footer": "Terror Trail LLC - Thank you for your business!"
  }
}
```

---

### PUT /api/v1/organizations/:orgId/billing/settings

Update billing settings.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Request:**
```json
{
  "billing_email": "accounts@terrortrail.com",
  "billing_address": {
    "line1": "456 Haunted Ave",
    "city": "Spooky City",
    "state": "CA",
    "postal_code": "90211",
    "country": "US"
  }
}
```

**Response (200):**
```json
{
  "message": "Billing settings updated",
  "settings": { ... }
}
```

---

## Invoice Endpoints

### GET /api/v1/organizations/:orgId/billing/invoices

List invoices.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - paid, open, void, uncollectible
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "data": [
    {
      "id": "in_xxx",
      "number": "INV-2025-001",
      "status": "paid",
      "amount": 48.00,
      "amount_paid": 48.00,
      "amount_remaining": 0,
      "currency": "usd",
      "period": {
        "start": "2025-01-01T00:00:00Z",
        "end": "2025-01-31T23:59:59Z"
      },
      "line_items": [
        {
          "description": "Staff Scheduling - Monthly",
          "amount": 29.00
        },
        {
          "description": "Inventory Management - Monthly",
          "amount": 19.00
        }
      ],
      "pdf_url": "https://...",
      "created_at": "2025-01-01T00:00:00Z",
      "paid_at": "2025-01-01T00:05:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/v1/organizations/:orgId/billing/invoices/:invoiceId

Get invoice details.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "id": "in_xxx",
  "number": "INV-2025-001",
  "status": "paid",
  "amount": 48.00,
  "subtotal": 48.00,
  "tax": 0,
  "total": 48.00,
  "amount_paid": 48.00,
  "currency": "usd",
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-31T23:59:59Z"
  },
  "line_items": [
    {
      "description": "Staff Scheduling - Monthly",
      "quantity": 1,
      "unit_amount": 29.00,
      "amount": 29.00
    },
    {
      "description": "Inventory Management - Monthly",
      "quantity": 1,
      "unit_amount": 19.00,
      "amount": 19.00
    }
  ],
  "payment_method": {
    "type": "card",
    "last4": "4242",
    "brand": "visa"
  },
  "pdf_url": "https://...",
  "hosted_invoice_url": "https://...",
  "created_at": "2025-01-01T00:00:00Z",
  "paid_at": "2025-01-01T00:05:00Z"
}
```

---

### POST /api/v1/organizations/:orgId/billing/invoices/:invoiceId/pay

Pay an open invoice.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Request:**
```json
{
  "payment_method_id": "pm_xxx"
}
```

**Response (200):**
```json
{
  "invoice": {
    "id": "in_xxx",
    "status": "paid",
    "amount_paid": 48.00
  },
  "message": "Invoice paid successfully"
}
```

---

## Admin Billing Endpoints

### GET /api/v1/admin/billing/overview

Get platform billing overview.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `super_admin`

**Response (200):**
```json
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "revenue": {
    "platform_fees": 12500.00,
    "module_subscriptions": 3200.00,
    "usage_charges": 450.00,
    "total": 16150.00
  },
  "organizations": {
    "total": 156,
    "with_subscriptions": 42,
    "by_tier": {
      "standard": 120,
      "bronze": 25,
      "silver": 8,
      "gold": 3
    }
  },
  "modules": {
    "scheduling": 28,
    "inventory": 15,
    "virtual_queue": 8,
    "analytics_pro": 12,
    "custom_domains": 5,
    "sms_notifications": 18
  }
}
```

---

### GET /api/v1/admin/billing/organizations

List organizations with billing info.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `super_admin`

**Query Parameters:**
- `page`, `limit` - Pagination
- `tier` - Filter by volume tier
- `has_subscriptions` - Filter by subscription status
- `search` - Search by org name

**Response (200):**
```json
{
  "data": [
    {
      "org_id": "org_uuid",
      "org_name": "Terror Trail",
      "volume_tier": "bronze",
      "platform_fee_percent": 2.0,
      "annual_sales": 75000,
      "active_modules": ["scheduling", "inventory"],
      "monthly_revenue": 48.00,
      "mtd_platform_fees": 125.50,
      "has_payment_method": true,
      "created_at": "2024-06-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20
  }
}
```

---

### PUT /api/v1/admin/billing/organizations/:orgId

Update organization billing (admin override).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `super_admin`

**Request:**
```json
{
  "platform_fee_percent": 1.5,
  "volume_tier": "silver",
  "notes": "Custom rate negotiated - enterprise contract"
}
```

**Response (200):**
```json
{
  "message": "Billing settings updated",
  "org_id": "org_uuid",
  "platform_fee_percent": 1.5,
  "volume_tier": "silver"
}
```

---

### POST /api/v1/admin/billing/organizations/:orgId/credit

Apply credit to organization.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `super_admin`

**Request:**
```json
{
  "amount": 50.00,
  "reason": "Compensation for service disruption",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Response (200):**
```json
{
  "credit": {
    "id": "credit_uuid",
    "amount": 50.00,
    "remaining": 50.00,
    "reason": "Compensation for service disruption",
    "expires_at": "2025-12-31T23:59:59Z"
  },
  "message": "Credit applied"
}
```

---

## Webhook Endpoints

### POST /api/v1/webhooks/stripe-billing

Stripe Billing webhook handler (internal).

**Headers:** `Stripe-Signature: ...`

**Events Handled:**
| Event | Action |
|-------|--------|
| `customer.subscription.created` | Create subscription record |
| `customer.subscription.updated` | Update subscription status/period |
| `customer.subscription.deleted` | Mark subscription expired |
| `invoice.paid` | Record payment, activate subscription |
| `invoice.payment_failed` | Mark subscription past_due |
| `invoice.finalized` | Send invoice notification |
| `customer.updated` | Sync billing details |

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| BILLING_NOT_SETUP | 400 | Org hasn't setup billing |
| NO_PAYMENT_METHOD | 400 | No payment method on file |
| PAYMENT_FAILED | 402 | Payment was declined |
| SUBSCRIPTION_NOT_FOUND | 404 | Subscription doesn't exist |
| ALREADY_SUBSCRIBED | 400 | Already subscribed to module |
| CANNOT_DOWNGRADE | 400 | Cannot downgrade during period |
| INVOICE_NOT_PAYABLE | 400 | Invoice already paid or void |
| RATE_LIMITED | 429 | Too many billing requests |

---

## Stripe Integration

### Stripe Products/Prices

Each module has corresponding Stripe entities:
- **Product**: One per module (e.g., `prod_scheduling`)
- **Prices**: Multiple per product (monthly, annual, seasonal)

### Subscription Flow

```
1. User clicks "Subscribe" on module
2. Frontend calls POST /billing/modules/:key/subscribe
3. Backend creates Stripe Subscription
4. If payment succeeds:
   - Subscription created in database
   - Feature flag updated (org_ids array)
   - Module access granted
5. If payment fails:
   - Return error to frontend
   - User can retry with different payment method
```

### Usage-Based Billing (SMS)

```
1. SMS sent via Notifications module (F12)
2. Usage record created in usage_records table
3. Nightly job syncs usage to Stripe (metered billing)
4. End of month: Stripe invoices for usage
5. Invoice paid: Record transaction
```

---

## Security

1. **Role-Based Access**: Only owners can modify billing; admins can view
2. **PCI Compliance**: All card data handled by Stripe
3. **Webhook Verification**: Stripe signature verified on all webhooks
4. **Audit Trail**: All billing changes logged
5. **Rate Limiting**: Prevent abuse of billing endpoints
