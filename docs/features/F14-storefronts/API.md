# F14: Storefronts - API

## Overview

API endpoints for managing white-label storefronts and serving public storefront content. Includes both admin endpoints (authenticated) and public endpoints (no auth required).

## Base URLs

```
Admin API:     /api/v1/orgs/:orgId/storefront
Public API:    /api/v1/storefronts/:identifier
```

The `:identifier` can be an org slug or custom domain.

---

## Public Endpoints (No Auth Required)

### Get Storefront

Retrieves the full storefront configuration for public display.

```http
GET /api/v1/storefronts/:identifier
```

**Parameters:**
| Name | Type | In | Description |
|------|------|-----|-------------|
| identifier | string | path | Org slug or custom domain |

**Response:** `200 OK`
```json
{
  "org": {
    "id": "uuid",
    "name": "Nightmare Manor",
    "slug": "nightmare-manor",
    "logo_url": "https://...",
    "website": "https://nightmaremanor.com",
    "address": {
      "line1": "123 Scary Lane",
      "city": "Halloween Town",
      "state": "CA",
      "postal_code": "90210"
    },
    "phone": "(555) 123-4567",
    "email": "info@nightmaremanor.com",
    "timezone": "America/Los_Angeles"
  },
  "storefront": {
    "tagline": "Face Your Fears",
    "description": "Southern California's most terrifying haunted attraction...",
    "hero": {
      "image_url": "https://...",
      "video_url": null,
      "title": "Are You Brave Enough?",
      "subtitle": "Open Friday-Sunday in October"
    },
    "theme": {
      "preset": "dark",
      "primary_color": "#7C3AED",
      "secondary_color": "#1F2937",
      "accent_color": "#F59E0B",
      "background_color": "#0F0F0F",
      "text_color": "#FFFFFF",
      "font_heading": "Creepster",
      "font_body": "Inter"
    },
    "social": {
      "facebook": "https://facebook.com/nightmaremanor",
      "instagram": "https://instagram.com/nightmaremanor",
      "twitter": null,
      "tiktok": "https://tiktok.com/@nightmaremanor",
      "youtube": null
    },
    "seo": {
      "title": "Nightmare Manor | Haunted House in Halloween Town",
      "description": "Experience terror at Nightmare Manor...",
      "og_image_url": "https://..."
    },
    "features": {
      "show_attractions": true,
      "show_calendar": true,
      "show_faq": true,
      "show_reviews": false
    }
  },
  "navigation": {
    "header": [
      { "label": "Home", "type": "home", "url": "/" },
      { "label": "Attractions", "type": "page", "url": "/attractions" },
      { "label": "Tickets", "type": "tickets", "url": "/tickets" },
      { "label": "FAQ", "type": "page", "url": "/faq" },
      { "label": "Contact", "type": "page", "url": "/contact" }
    ],
    "footer": [
      { "label": "Privacy Policy", "type": "page", "url": "/p/privacy" },
      { "label": "Terms", "type": "page", "url": "/p/terms" }
    ]
  },
  "announcements": [
    {
      "id": "uuid",
      "title": "Opening Night - October 1st!",
      "content": "Get 20% off tickets for opening weekend",
      "type": "promo",
      "link_url": "/tickets",
      "link_text": "Buy Tickets",
      "is_dismissible": true
    }
  ],
  "domain": {
    "current": "nightmaremanor.com",
    "canonical": "https://nightmaremanor.com"
  }
}
```

**Errors:**
- `404 Not Found` - Storefront not found or not published

---

### Get Featured Attractions

```http
GET /api/v1/storefronts/:identifier/attractions
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| featured | boolean | false | Only featured attractions |
| limit | integer | 10 | Max results |

**Response:** `200 OK`
```json
{
  "attractions": [
    {
      "id": "uuid",
      "name": "The Haunted Mansion",
      "slug": "haunted-mansion",
      "description": "A classic walkthrough haunt...",
      "type": {
        "key": "haunted_house",
        "name": "Haunted House"
      },
      "image_url": "https://...",
      "duration_minutes": 20,
      "intensity_level": 4,
      "min_age": 12,
      "amenities": ["wheelchair_accessible", "photo_ops"],
      "status": "active",
      "ticket_price_from": 2999
    }
  ],
  "total": 3
}
```

---

### Get Single Attraction

```http
GET /api/v1/storefronts/:identifier/attractions/:slug
```

**Response:** `200 OK`
```json
{
  "attraction": {
    "id": "uuid",
    "name": "The Haunted Mansion",
    "slug": "haunted-mansion",
    "description": "Full description...",
    "long_description": "Extended content...",
    "type": {
      "key": "haunted_house",
      "name": "Haunted House"
    },
    "images": [
      { "url": "https://...", "alt": "Entrance", "is_primary": true }
    ],
    "video_url": "https://youtube.com/...",
    "duration_minutes": 20,
    "intensity_level": 4,
    "min_age": 12,
    "amenities": [
      { "key": "wheelchair_accessible", "name": "Wheelchair Accessible" }
    ],
    "warnings": ["strobe_lights", "loud_noises", "actors_may_touch"],
    "ticket_types": [
      {
        "id": "uuid",
        "name": "General Admission",
        "price": 2999,
        "compare_price": 3999,
        "category": { "key": "general", "name": "General Admission" },
        "description": "Standard entry",
        "includes": ["One entry", "Photo opportunity"],
        "available": true
      },
      {
        "id": "uuid",
        "name": "VIP Fast Pass",
        "price": 4999,
        "category": { "key": "vip", "name": "VIP" },
        "description": "Skip the line",
        "includes": ["Priority entry", "Exclusive merch"],
        "available": true
      }
    ],
    "faqs": [
      {
        "question": "Is it scary?",
        "answer": "Yes! This is an intense experience..."
      }
    ]
  }
}
```

---

### Get Available Time Slots

```http
GET /api/v1/storefronts/:identifier/attractions/:slug/availability
```

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| date | string | yes | Date (YYYY-MM-DD) |
| ticket_type_id | string | no | Filter by ticket type |

**Response:** `200 OK`
```json
{
  "date": "2024-10-15",
  "slots": [
    {
      "id": "uuid",
      "start_time": "18:00",
      "end_time": "18:30",
      "capacity": 50,
      "available": 23,
      "status": "available",
      "price_modifier": 0
    },
    {
      "id": "uuid",
      "start_time": "19:00",
      "end_time": "19:30",
      "capacity": 50,
      "available": 5,
      "status": "limited",
      "price_modifier": 500
    },
    {
      "id": "uuid",
      "start_time": "20:00",
      "end_time": "20:30",
      "capacity": 50,
      "available": 0,
      "status": "sold_out",
      "price_modifier": 1000
    }
  ]
}
```

---

### Get Operating Calendar

```http
GET /api/v1/storefronts/:identifier/calendar
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| month | string | current | Month (YYYY-MM) |
| attraction_id | string | all | Filter by attraction |

**Response:** `200 OK`
```json
{
  "month": "2024-10",
  "days": [
    {
      "date": "2024-10-01",
      "status": "open",
      "hours": { "open": "18:00", "close": "23:00" },
      "availability": "available"
    },
    {
      "date": "2024-10-02",
      "status": "closed",
      "hours": null,
      "availability": null
    },
    {
      "date": "2024-10-04",
      "status": "open",
      "hours": { "open": "18:00", "close": "00:00" },
      "availability": "limited",
      "special_event": "Opening Night"
    }
  ]
}
```

---

### Get Page Content

```http
GET /api/v1/storefronts/:identifier/pages/:slug
```

**Response:** `200 OK`
```json
{
  "page": {
    "id": "uuid",
    "slug": "about",
    "title": "About Us",
    "content": "# Our Story\n\nNightmare Manor opened in 1995...",
    "content_format": "markdown",
    "seo": {
      "title": "About Nightmare Manor",
      "description": "Learn about the history..."
    }
  }
}
```

---

### Get FAQs

```http
GET /api/v1/storefronts/:identifier/faqs
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| attraction_id | string | Filter by attraction |
| category | string | Filter by category |

**Response:** `200 OK`
```json
{
  "faqs": [
    {
      "id": "uuid",
      "question": "What should I wear?",
      "answer": "Comfortable shoes are recommended...",
      "category": "General"
    },
    {
      "id": "uuid",
      "question": "Can I bring my phone?",
      "answer": "Yes, but no flash photography...",
      "category": "Rules"
    }
  ],
  "categories": ["General", "Rules", "Tickets", "Safety"]
}
```

---

## Admin Endpoints (Auth Required)

### Get Storefront Settings

```http
GET /api/v1/orgs/:orgId/storefront
```

**Required Role:** `manager+`

**Response:** `200 OK`
```json
{
  "settings": {
    "id": "uuid",
    "tagline": "Face Your Fears",
    "description": "...",
    "hero": { ... },
    "theme": { ... },
    "social": { ... },
    "seo": { ... },
    "analytics": {
      "google_analytics_id": "G-XXXXXXX",
      "facebook_pixel_id": null
    },
    "features": { ... },
    "is_published": true,
    "published_at": "2024-09-15T00:00:00Z"
  }
}
```

---

### Update Storefront Settings

```http
PATCH /api/v1/orgs/:orgId/storefront
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "tagline": "Updated tagline",
  "theme": {
    "primary_color": "#FF0000"
  },
  "seo": {
    "title": "New SEO Title"
  }
}
```

**Response:** `200 OK` - Updated settings object

---

### Publish/Unpublish Storefront

```http
POST /api/v1/orgs/:orgId/storefront/publish
POST /api/v1/orgs/:orgId/storefront/unpublish
```

**Required Role:** `admin+`

**Response:** `200 OK`
```json
{
  "is_published": true,
  "published_at": "2024-10-01T12:00:00Z",
  "url": "https://nightmare-manor.atrivio.io"
}
```

---

### Preview Storefront

```http
GET /api/v1/orgs/:orgId/storefront/preview
```

**Required Role:** `manager+`

**Response:** `200 OK`
```json
{
  "preview_url": "https://nightmare-manor.atrivio.io?preview=abc123",
  "expires_at": "2024-10-01T13:00:00Z"
}
```

Generates a temporary preview link for unpublished storefronts.

---

## Pages Management

### List Pages

```http
GET /api/v1/orgs/:orgId/storefront/pages
```

**Required Role:** `manager+`

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | string | all | Filter by status |

**Response:** `200 OK`
```json
{
  "pages": [
    {
      "id": "uuid",
      "slug": "about",
      "title": "About Us",
      "page_type": "about",
      "status": "published",
      "show_in_nav": true,
      "nav_order": 1,
      "updated_at": "2024-09-20T10:00:00Z"
    }
  ]
}
```

---

### Create Page

```http
POST /api/v1/orgs/:orgId/storefront/pages
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "slug": "rules",
  "title": "Rules & Guidelines",
  "content": "# Haunt Rules\n\n1. No running...",
  "content_format": "markdown",
  "page_type": "custom",
  "show_in_nav": true,
  "seo": {
    "title": "Rules - Nightmare Manor",
    "description": "Safety rules and guidelines..."
  }
}
```

**Response:** `201 Created`

---

### Update Page

```http
PATCH /api/v1/orgs/:orgId/storefront/pages/:pageId
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

**Response:** `200 OK`

---

### Delete Page

```http
DELETE /api/v1/orgs/:orgId/storefront/pages/:pageId
```

**Required Role:** `manager+`

**Response:** `204 No Content`

---

## Domain Management

### List Domains

```http
GET /api/v1/orgs/:orgId/storefront/domains
```

**Required Role:** `admin+`

**Response:** `200 OK`
```json
{
  "domains": [
    {
      "id": "uuid",
      "domain": "nightmare-manor.atrivio.io",
      "domain_type": "subdomain",
      "is_primary": false,
      "status": "active",
      "ssl_status": "active"
    },
    {
      "id": "uuid",
      "domain": "nightmaremanor.com",
      "domain_type": "custom",
      "is_primary": true,
      "status": "active",
      "ssl_status": "active",
      "verified_at": "2024-09-01T00:00:00Z"
    }
  ]
}
```

---

### Add Custom Domain

```http
POST /api/v1/orgs/:orgId/storefront/domains
```

**Required Role:** `admin+`

**Request Body:**
```json
{
  "domain": "nightmaremanor.com"
}
```

**Response:** `201 Created`
```json
{
  "domain": {
    "id": "uuid",
    "domain": "nightmaremanor.com",
    "domain_type": "custom",
    "status": "pending",
    "verification": {
      "method": "dns_txt",
      "record_name": "_haunt-verify.nightmaremanor.com",
      "record_value": "haunt-verification=abc123xyz",
      "instructions": "Add a TXT record to your DNS..."
    }
  }
}
```

---

### Verify Domain

```http
POST /api/v1/orgs/:orgId/storefront/domains/:domainId/verify
```

**Required Role:** `admin+`

Triggers DNS verification check.

**Response:** `200 OK`
```json
{
  "domain": {
    "id": "uuid",
    "domain": "nightmaremanor.com",
    "status": "active",
    "verified_at": "2024-10-01T12:00:00Z",
    "ssl_status": "provisioning"
  }
}
```

**Errors:**
- `400 Bad Request` - Verification failed (DNS record not found)

---

### Set Primary Domain

```http
POST /api/v1/orgs/:orgId/storefront/domains/:domainId/set-primary
```

**Required Role:** `admin+`

**Response:** `200 OK`

---

### Delete Domain

```http
DELETE /api/v1/orgs/:orgId/storefront/domains/:domainId
```

**Required Role:** `admin+`

**Response:** `204 No Content`

**Errors:**
- `400 Bad Request` - Cannot delete subdomain (auto-generated)
- `400 Bad Request` - Cannot delete primary domain while other domains exist

---

## FAQ Management

### List FAQs

```http
GET /api/v1/orgs/:orgId/storefront/faqs
```

**Required Role:** `manager+`

**Response:** `200 OK`
```json
{
  "faqs": [
    {
      "id": "uuid",
      "question": "What should I wear?",
      "answer": "Comfortable shoes...",
      "category": "General",
      "attraction_id": null,
      "sort_order": 0,
      "is_published": true
    }
  ]
}
```

---

### Create FAQ

```http
POST /api/v1/orgs/:orgId/storefront/faqs
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "question": "New question?",
  "answer": "Answer here...",
  "category": "General",
  "attraction_id": null
}
```

**Response:** `201 Created`

---

### Update FAQ

```http
PATCH /api/v1/orgs/:orgId/storefront/faqs/:faqId
```

**Required Role:** `manager+`

---

### Delete FAQ

```http
DELETE /api/v1/orgs/:orgId/storefront/faqs/:faqId
```

**Required Role:** `manager+`

---

### Reorder FAQs

```http
POST /api/v1/orgs/:orgId/storefront/faqs/reorder
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`

---

## Announcement Management

### List Announcements

```http
GET /api/v1/orgs/:orgId/storefront/announcements
```

**Required Role:** `manager+`

---

### Create Announcement

```http
POST /api/v1/orgs/:orgId/storefront/announcements
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "title": "Opening Night Special!",
  "content": "Get 20% off with code OPENING",
  "type": "promo",
  "position": "banner",
  "link_url": "/tickets",
  "link_text": "Buy Now",
  "starts_at": "2024-10-01T00:00:00Z",
  "ends_at": "2024-10-07T23:59:59Z"
}
```

---

### Update Announcement

```http
PATCH /api/v1/orgs/:orgId/storefront/announcements/:announcementId
```

---

### Delete Announcement

```http
DELETE /api/v1/orgs/:orgId/storefront/announcements/:announcementId
```

---

## Navigation Management

### Get Navigation

```http
GET /api/v1/orgs/:orgId/storefront/navigation
```

**Required Role:** `manager+`

---

### Update Navigation

```http
PUT /api/v1/orgs/:orgId/storefront/navigation
```

**Required Role:** `manager+`

**Request Body:**
```json
{
  "header": [
    { "label": "Home", "link_type": "home" },
    { "label": "Attractions", "link_type": "page", "page_id": "uuid" },
    { "label": "Tickets", "link_type": "tickets" },
    { "label": "Instagram", "link_type": "external", "external_url": "https://instagram.com/...", "open_in_new_tab": true }
  ],
  "footer": [
    { "label": "Privacy", "link_type": "page", "page_id": "uuid" },
    { "label": "Terms", "link_type": "page", "page_id": "uuid" }
  ]
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "DOMAIN_VERIFICATION_FAILED",
    "message": "DNS TXT record not found",
    "details": {
      "expected_record": "_haunt-verify.example.com",
      "expected_value": "haunt-verification=abc123"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| STOREFRONT_NOT_FOUND | 404 | Storefront doesn't exist or not published |
| STOREFRONT_NOT_PUBLISHED | 403 | Storefront exists but not published |
| PAGE_NOT_FOUND | 404 | Page doesn't exist |
| DOMAIN_ALREADY_EXISTS | 409 | Domain registered to another org |
| DOMAIN_VERIFICATION_FAILED | 400 | DNS verification failed |
| INVALID_DOMAIN_FORMAT | 400 | Domain format invalid |
| RESERVED_SLUG | 400 | Page slug is reserved |
| SUBDOMAIN_CANNOT_DELETE | 400 | Cannot delete auto-generated subdomain |

---

## Webhooks (Future)

Events that could trigger webhooks:

- `storefront.published` - Storefront went live
- `storefront.unpublished` - Storefront taken offline
- `domain.verified` - Custom domain verified
- `domain.ssl_provisioned` - SSL certificate ready

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Public GET | 100 req/min per IP |
| Admin GET | 60 req/min per user |
| Admin POST/PATCH | 30 req/min per user |
| Domain verification | 10 req/hour per domain |
