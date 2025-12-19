# F8: Ticketing - API Design

## Overview

Ticket sales APIs for public purchasing and back-office management.

## Base URLs

```
/api/v1/attractions/:attractionSlug/tickets    (Public)
/api/v1/organizations/:orgId/tickets  (Admin)
```

## Public Ticket Endpoints

### GET /api/v1/attractions/:attractionSlug/tickets

Get available ticket types.

**Response (200):**
```json
{
  "attraction": {
    "id": "attraction_uuid",
    "name": "Terror Trail",
    "slug": "terror-trail"
  },
  "ticket_types": [
    {
      "id": "type_uuid",
      "name": "General Admission",
      "description": "Standard entry to Terror Trail",
      "price": 2500,
      "compare_price": 3000,
      "type": "general",
      "includes": ["Trail access", "Photo op"],
      "min_per_order": 1,
      "max_per_order": 10,
      "available": true
    },
    {
      "id": "type_uuid_2",
      "name": "VIP Fast Pass",
      "description": "Skip the line with VIP entry",
      "price": 4500,
      "type": "fast_pass",
      "includes": ["Priority entry", "VIP lounge access", "Free photo"],
      "available": true
    }
  ]
}
```

---

### GET /api/v1/attractions/:attractionSlug/tickets/availability

Get time slot availability.

**Query Parameters:**
- `date` - Date to check (required)
- `ticket_type_id` - Filter by ticket type

**Response (200):**
```json
{
  "date": "2024-10-25",
  "slots": [
    {
      "id": "slot_uuid",
      "start_time": "18:00",
      "end_time": "18:30",
      "available": 45,
      "total": 50,
      "status": "available",
      "price_modifier": 0
    },
    {
      "id": "slot_uuid_2",
      "start_time": "19:00",
      "end_time": "19:30",
      "available": 8,
      "total": 50,
      "status": "limited",
      "price_modifier": 500
    },
    {
      "id": "slot_uuid_3",
      "start_time": "20:00",
      "end_time": "20:30",
      "available": 0,
      "total": 50,
      "status": "sold_out",
      "price_modifier": 500
    }
  ]
}
```

---

### GET /api/v1/attractions/:attractionSlug/tickets/calendar

Get availability calendar.

**Query Parameters:**
- `month` - Month (YYYY-MM)

**Response (200):**
```json
{
  "month": "2024-10",
  "days": [
    {
      "date": "2024-10-25",
      "is_open": true,
      "has_availability": true,
      "min_price": 2500,
      "status": "available"
    },
    {
      "date": "2024-10-26",
      "is_open": true,
      "has_availability": true,
      "min_price": 2500,
      "status": "limited"
    },
    {
      "date": "2024-10-31",
      "is_open": true,
      "has_availability": false,
      "status": "sold_out"
    }
  ]
}
```

---

## Cart Endpoints

### POST /api/v1/attractions/:attractionSlug/cart

Create or update cart.

**Request:**
```json
{
  "session_token": "existing_token_or_null",
  "items": [
    {
      "ticket_type_id": "type_uuid",
      "time_slot_id": "slot_uuid",
      "quantity": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "session_token": "cart_session_token",
  "items": [
    {
      "ticket_type_id": "type_uuid",
      "ticket_type_name": "General Admission",
      "time_slot_id": "slot_uuid",
      "time_slot": "Oct 25, 2024 7:00 PM",
      "quantity": 2,
      "unit_price": 2500,
      "total_price": 5000
    }
  ],
  "subtotal": 5000,
  "discount": 0,
  "tax": 0,
  "total": 5000,
  "expires_at": "2024-10-20T14:15:00Z"
}
```

---

### POST /api/v1/attractions/:attractionSlug/cart/promo

Apply promo code.

**Request:**
```json
{
  "session_token": "cart_session_token",
  "code": "SPOOKY20"
}
```

**Response (200):**
```json
{
  "valid": true,
  "promo_code": {
    "code": "SPOOKY20",
    "description": "20% off your order",
    "discount_type": "percentage",
    "discount_value": 20
  },
  "subtotal": 5000,
  "discount": 1000,
  "total": 4000
}
```

**Errors:**
- `400` - Invalid or expired promo code
- `400` - Minimum order not met

---

### DELETE /api/v1/attractions/:attractionSlug/cart/promo

Remove promo code.

**Request:**
```json
{
  "session_token": "cart_session_token"
}
```

---

## Checkout Endpoints

### POST /api/v1/attractions/:attractionSlug/checkout

Create order and get payment intent.

**Request:**
```json
{
  "session_token": "cart_session_token",
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "guests": [
    {"name": "John Doe"},
    {"name": "Jane Doe"}
  ]
}
```

**Response (200):**
```json
{
  "order_id": "order_uuid",
  "order_number": "TER-00001234",
  "payment_intent": {
    "client_secret": "pi_xxx_secret_xxx"
  },
  "amount": 4000,
  "expires_at": "2024-10-20T14:45:00Z"
}
```

---

### POST /api/v1/orders/:orderId/confirm

Confirm order after payment.

**Request:**
```json
{
  "payment_intent_id": "pi_xxx"
}
```

**Response (200):**
```json
{
  "order_id": "order_uuid",
  "order_number": "TER-00001234",
  "status": "completed",
  "tickets": [
    {
      "id": "ticket_uuid",
      "ticket_number": "TER-T-12345678",
      "ticket_type": "General Admission",
      "time_slot": "Oct 25, 2024 7:00 PM",
      "guest_name": "John Doe",
      "barcode": "ABC123DEF456",
      "qr_code_url": "https://..."
    }
  ],
  "receipt_url": "https://..."
}
```

---

## Order Management (Public)

### GET /api/v1/orders/:orderNumber

Get order by order number.

**Query Parameters:**
- `email` - Customer email (for verification)

**Response (200):**
```json
{
  "id": "order_uuid",
  "order_number": "TER-00001234",
  "attraction": {
    "name": "Terror Trail",
    "address": "456 Creepy Road, Salem, MA"
  },
  "status": "completed",
  "tickets": [
    {
      "id": "ticket_uuid",
      "ticket_number": "TER-T-12345678",
      "ticket_type": "General Admission",
      "time_slot": "Oct 25, 2024 7:00 PM",
      "guest_name": "John Doe",
      "status": "valid",
      "qr_code_url": "https://..."
    }
  ],
  "total": 4000,
  "promo_code": "SPOOKY20",
  "discount": 1000,
  "created_at": "2024-10-20T14:00:00Z"
}
```

---

### POST /api/v1/orders/:orderNumber/resend

Resend order confirmation email.

**Request:**
```json
{
  "email": "customer@example.com"
}
```

---

### POST /api/v1/tickets/:ticketId/transfer

Transfer ticket to another person.

**Request:**
```json
{
  "email": "customer@example.com",
  "new_guest_name": "New Guest Name",
  "new_guest_email": "newguest@example.com"
}
```

**Response (200):**
```json
{
  "new_ticket_id": "new_ticket_uuid",
  "new_ticket_number": "TER-T-87654321",
  "message": "Ticket transferred successfully"
}
```

---

## Admin Ticket Endpoints

### GET /api/v1/organizations/:orgId/attractions/:attractionId/orders

List orders (admin).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `box_office`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `start_date`, `end_date` - Date range
- `search` - Search by order number or email

**Response (200):**
```json
{
  "data": [
    {
      "id": "order_uuid",
      "order_number": "TER-00001234",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "ticket_count": 2,
      "total": 4000,
      "status": "completed",
      "source": "online",
      "created_at": "2024-10-20T14:00:00Z"
    }
  ],
  "meta": {
    "total": 1250,
    "total_revenue": 312500
  }
}
```

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/orders

Create order (box office).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `box_office`

**Request:**
```json
{
  "items": [
    {
      "ticket_type_id": "type_uuid",
      "time_slot_id": "slot_uuid",
      "quantity": 2
    }
  ],
  "customer_email": "customer@example.com",
  "customer_name": "Walk-in Customer",
  "payment_method": "cash",
  "source": "box_office",
  "notes": "Walk-in sale"
}
```

---

### POST /api/v1/organizations/:orgId/orders/:orderId/refund

Refund order.

**Required Role:** `owner`, `admin`, or `finance`

**Request:**
```json
{
  "amount": 2500,
  "reason": "requested_by_customer",
  "ticket_ids": ["ticket_uuid"],
  "notes": "Refunding 1 ticket"
}
```

---

### POST /api/v1/organizations/:orgId/tickets/:ticketId/void

Void a ticket.

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "reason": "Duplicate purchase"
}
```

---

## Ticket Type Management

### GET /api/v1/organizations/:orgId/attractions/:attractionId/ticket-types

List ticket types (admin).

**Response (200):**
```json
{
  "data": [
    {
      "id": "type_uuid",
      "name": "General Admission",
      "price": 2500,
      "type": "general",
      "is_active": true,
      "capacity": 5000,
      "sold_count": 1250,
      "revenue": 3125000
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/ticket-types

Create ticket type.

**Request:**
```json
{
  "name": "Season Pass",
  "description": "Unlimited visits all season",
  "price": 9999,
  "type": "season_pass",
  "max_per_order": 4,
  "capacity": 500,
  "includes": ["Unlimited entry", "10% merchandise discount"],
  "available_from": "2024-09-01T00:00:00Z",
  "available_until": "2024-11-01T00:00:00Z"
}
```

---

## Time Slot Management

### POST /api/v1/organizations/:orgId/attractions/:attractionId/time-slots/generate

Generate time slots.

**Request:**
```json
{
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "slot_duration_minutes": 30,
  "capacity_per_slot": 50,
  "use_operating_hours": true
}
```

**Response (200):**
```json
{
  "created": 450,
  "message": "Generated 450 time slots"
}
```

---

### PATCH /api/v1/organizations/:orgId/attractions/:attractionId/time-slots/:slotId

Update time slot.

**Request:**
```json
{
  "capacity": 75,
  "price_modifier": 500,
  "status": "available"
}
```

---

## Promo Code Management

### POST /api/v1/organizations/:orgId/promo-codes

Create promo code.

**Request:**
```json
{
  "code": "HALLOWEEN20",
  "name": "Halloween Sale",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_amount": 5000,
  "max_discount": 2000,
  "usage_limit": 500,
  "valid_from": "2024-10-01T00:00:00Z",
  "valid_until": "2024-10-31T23:59:59Z",
  "attraction_id": "attraction_uuid"
}
```

---

### GET /api/v1/organizations/:orgId/promo-codes

List promo codes.

**Response (200):**
```json
{
  "data": [
    {
      "id": "promo_uuid",
      "code": "HALLOWEEN20",
      "discount_type": "percentage",
      "discount_value": 20,
      "usage_count": 125,
      "usage_limit": 500,
      "revenue_generated": 125000,
      "discount_given": 25000,
      "is_active": true,
      "valid_until": "2024-10-31T23:59:59Z"
    }
  ]
}
```

---

## Reports

### GET /api/v1/organizations/:orgId/attractions/:attractionId/tickets/report

Get ticket sales report.

**Query Parameters:**
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "period": {
    "start": "2024-10-01",
    "end": "2024-10-31"
  },
  "summary": {
    "total_orders": 1250,
    "total_tickets": 3500,
    "gross_revenue": 875000,
    "discounts": 50000,
    "refunds": 25000,
    "net_revenue": 800000,
    "avg_order_value": 700
  },
  "by_ticket_type": [
    {
      "type": "General Admission",
      "sold": 2500,
      "revenue": 625000
    }
  ],
  "by_date": [
    {
      "date": "2024-10-25",
      "orders": 150,
      "tickets": 420,
      "revenue": 105000
    }
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| TICKET_TYPE_NOT_FOUND | 404 | Ticket type doesn't exist |
| SLOT_NOT_FOUND | 404 | Time slot doesn't exist |
| SLOT_SOLD_OUT | 400 | No availability in slot |
| CART_EXPIRED | 400 | Cart session expired |
| ORDER_NOT_FOUND | 404 | Order doesn't exist |
| ORDER_ALREADY_COMPLETED | 400 | Cannot modify completed order |
| PROMO_INVALID | 400 | Invalid promo code |
| PROMO_EXPIRED | 400 | Promo code expired |
| PROMO_USAGE_EXCEEDED | 400 | Promo code limit reached |
| TICKET_ALREADY_USED | 400 | Ticket already checked in |
| TICKET_VOIDED | 400 | Ticket has been voided |
| REFUND_WINDOW_EXPIRED | 400 | Past refund deadline |
