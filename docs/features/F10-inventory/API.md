# F10: Inventory Management - API Design

## Base URL

```
/api/v1/organizations/:orgId/inventory
```

## Inventory Endpoints

### GET /inventory/items

List inventory items.

**Query Parameters:**
- `category_id`, `type`, `attraction_id`, `low_stock`, `search`

**Response (200):**
```json
{
  "data": [
    {
      "id": "item_uuid",
      "sku": "COST-001",
      "name": "Zombie Costume - Large",
      "type": "costume",
      "quantity": 5,
      "min_quantity": 2,
      "condition": "good",
      "location": "Costume Room A",
      "checked_out": 2
    }
  ],
  "summary": {
    "total_items": 450,
    "low_stock_count": 12,
    "total_value": 45000
  }
}
```

### POST /inventory/items

Create item.

**Request:**
```json
{
  "name": "Blood Makeup Kit",
  "type": "makeup",
  "sku": "MKP-BLOOD-001",
  "quantity": 20,
  "min_quantity": 5,
  "unit_cost": 1500,
  "category_id": "category_uuid"
}
```

### POST /inventory/items/:itemId/adjust

Adjust quantity.

**Request:**
```json
{
  "quantity": 5,
  "type": "purchase",
  "reason": "Restocked for Halloween weekend"
}
```

### POST /inventory/checkouts

Check out item to staff.

**Request:**
```json
{
  "item_id": "item_uuid",
  "staff_id": "staff_uuid",
  "quantity": 1,
  "due_date": "2024-11-01"
}
```

### POST /inventory/checkouts/:checkoutId/return

Return checked out item.

**Request:**
```json
{
  "condition": "good",
  "notes": "Minor wear, still usable"
}
```

### GET /inventory/report

Get inventory report.

**Response (200):**
```json
{
  "summary": {
    "total_items": 450,
    "total_value": 125000,
    "items_checked_out": 45,
    "low_stock_alerts": 12
  },
  "by_category": [...],
  "by_condition": {...},
  "recent_transactions": [...]
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ITEM_NOT_FOUND | 404 | Item doesn't exist |
| INSUFFICIENT_QUANTITY | 400 | Not enough in stock |
| ALREADY_CHECKED_OUT | 400 | Item already checked out |
| SKU_EXISTS | 409 | SKU already in use |
