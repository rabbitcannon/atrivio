# F10: Inventory Management - UI Requirements

## Overview

Inventory tracking interfaces for managing props, costumes, equipment, and supplies used in attraction operations.

## Pages & Routes

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/inventory` | Inventory Dashboard | Overview & quick stats |
| `/inventory/items` | Items List | All inventory items |
| `/inventory/items/new` | Add Item | Create new item |
| `/inventory/items/:itemId` | Item Details | View/edit item |
| `/inventory/categories` | Categories | Manage categories |
| `/inventory/checkouts` | Checkouts | Active checkouts |
| `/inventory/checkouts/new` | New Checkout | Check out items |
| `/inventory/transactions` | Transactions | History log |
| `/inventory/low-stock` | Low Stock | Items needing reorder |

---

## Components

### Inventory Dashboard

#### `<InventoryDashboard />`
- **Sections**:
  - Key Metrics (total items, value, checked out)
  - Low Stock Alerts
  - Active Checkouts
  - Recent Activity
  - Category Breakdown
- **Features**: Quick search, quick add button

#### `<InventoryMetrics />`
- **Metrics**:
  - Total Items
  - Total Value
  - Items Checked Out
  - Items Low Stock
  - Items Out of Stock
- **Features**: Click to filter list

#### `<LowStockPanel />`
- **Display**: List of items below threshold
- **Info**: Item name, current qty, min qty
- **Actions**: Reorder, adjust threshold

### Item Management

#### `<ItemsList />`
- **Display**: Table/grid of items
- **Columns**: Image, name, category, qty, location, status
- **Actions**: Add, edit, checkout, delete
- **Features**:
  - Search by name, SKU, barcode
  - Filter by category, location, status
  - Sort by name, qty, value
  - Bulk actions

#### `<ItemCard />`
- **Display**: Image, name, category, quantity
- **Status**: In Stock, Low Stock, Out of Stock
- **Actions**: Quick checkout, edit

#### `<ItemForm />`
- **Fields**:
  - Name, Description
  - Category
  - SKU / Barcode
  - Quantity
  - Unit Cost, Total Value
  - Min Stock Level
  - Location (attraction, zone, storage)
  - Condition
  - Photo(s)
  - Notes
- **Actions**: Save, Delete, Duplicate

#### `<ItemDetails />`
- **Tabs**:
  - Overview (info, photo, current status)
  - History (all transactions)
  - Checkouts (current + past)
  - Maintenance (repairs, notes)
- **Actions**: Edit, Checkout, Adjust Qty, Archive

#### `<QuantityAdjustment />`
- **Purpose**: Adjust qty without checkout
- **Fields**: New qty or +/- adjustment, reason
- **Reasons**: Count correction, damage, donation, found
- **Actions**: Confirm adjustment

### Categories

#### `<CategoriesList />`
- **Display**: List with item counts
- **Actions**: Create, edit, delete, reorder
- **Features**: Nested categories

#### `<CategoryForm />`
- **Fields**: Name, parent category, icon/color, description
- **Actions**: Save, Delete

### Checkouts

#### `<CheckoutsList />`
- **Display**: Table of active checkouts
- **Columns**: Item, checked out by, date, due date, status
- **Actions**: Return, extend, view details
- **Features**: Filter by overdue, staff member

#### `<CheckoutForm />`
- **Flow**:
  1. Search/scan item
  2. Select staff member
  3. Set due date (optional)
  4. Add notes
  5. Confirm
- **Features**: Batch checkout multiple items

#### `<ReturnForm />`
- **Fields**: Condition on return, notes
- **Conditions**: Good, Damaged, Missing parts
- **Actions**: Confirm return
- **Features**: Photo of condition

#### `<OverdueAlerts />`
- **Display**: List of overdue checkouts
- **Info**: Item, staff, days overdue
- **Actions**: Send reminder, mark returned

### Transactions

#### `<TransactionHistory />`
- **Display**: Chronological log
- **Types**: Added, Checkout, Return, Adjustment, Deleted
- **Columns**: Date, item, action, by, notes
- **Features**: Filter by type, date range, item

#### `<TransactionDetails />`
- **Display**: Full transaction info
- **Info**: Before/after values, who, when, why

### Barcode/QR Integration

#### `<BarcodeScanner />`
- **Purpose**: Quick item lookup
- **Features**: Camera scan, manual entry
- **Actions**: View item, quick checkout

#### `<BarcodeGenerator />`
- **Purpose**: Print labels for items
- **Options**: Barcode type (Code128, QR)
- **Features**: Batch print, label templates

---

## User Flows

### Add New Item Flow
```
[Inventory Dashboard]
    │
    ▼
[Add Item Button]
    │
    ▼
[Item Form]
    │
    ├── Basic Info (name, description)
    ├── Category Selection
    ├── Quantity & Value
    ├── Location Assignment
    ├── Photo Upload
    │
    ▼
[Save → Item Created]
    │
    ▼
[Print Label? (optional)]
    │
    ├── Yes → [Generate & Print Barcode]
    └── No → [Done]
```

### Checkout Item Flow
```
[Inventory List or Dashboard]
    │
    ▼
[Select Item(s) to Checkout]
    │
    ├── Click checkout button
    └── Scan barcode
    │
    ▼
[Checkout Form]
    │
    ├── Confirm item(s)
    ├── Select staff member
    ├── Set due date (optional)
    ├── Add notes
    │
    ▼
[Confirm Checkout]
    │
    ▼
[Item Status Updated → Checked Out]
    │
    ▼
[Notification to staff (optional)]
```

### Return Item Flow
```
[Active Checkouts List]
    │
    ▼
[Select Checkout to Return]
    │
    ▼
[Return Form]
    │
    ├── Verify item
    ├── Check condition
    │       │
    │       ├── Good → [Mark returned]
    │       ├── Damaged → [Log damage + notes]
    │       └── Missing parts → [Log + adjust inventory]
    │
    ▼
[Confirm Return]
    │
    ▼
[Item Available Again]
    │
    ▼
[Transaction Logged]
```

### Inventory Count Flow
```
[Inventory Settings or Scheduled]
    │
    ▼
[Start Inventory Count]
    │
    ▼
[Count Mode Enabled]
    │
    ├── Scan/search each item
    ├── Enter actual count
    ├── System flags discrepancies
    │
    ▼
[Review Discrepancies]
    │
    ├── Accept all
    ├── Review one by one
    │       │
    │       ▼
    │   [Explain variance]
    │
    ▼
[Finalize Count]
    │
    ▼
[Quantities Adjusted → Log Created]
```

---

## State Management

### Inventory Store
```typescript
interface InventoryState {
  items: InventoryItem[];
  categories: Category[];
  checkouts: Checkout[];
  transactions: Transaction[];

  // Filters
  filters: InventoryFilters;
  searchQuery: string;

  // Computed
  lowStockItems: InventoryItem[];
  overdueCheckouts: Checkout[];
  totalValue: number;

  isLoading: boolean;

  // Actions
  fetchItems: (filters?: InventoryFilters) => Promise<void>;
  createItem: (data: CreateItemData) => Promise<InventoryItem>;
  updateItem: (id: string, data: UpdateItemData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  adjustQuantity: (id: string, adjustment: QuantityAdjustment) => Promise<void>;

  // Checkouts
  checkoutItem: (data: CheckoutData) => Promise<void>;
  returnItem: (checkoutId: string, data: ReturnData) => Promise<void>;
  extendCheckout: (checkoutId: string, newDueDate: Date) => Promise<void>;

  // Categories
  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryData) => Promise<void>;

  // Transactions
  fetchTransactions: (itemId?: string) => Promise<void>;
}
```

---

## Validation Rules

### Item
- **Name**: Required, 2-200 characters
- **Quantity**: Required, ≥ 0
- **Unit Cost**: Optional, ≥ 0
- **Min Stock**: Optional, ≥ 0
- **SKU**: Optional, unique if provided

### Checkout
- **Item**: Required, must be available
- **Staff**: Required
- **Due Date**: Optional, must be future

### Quantity Adjustment
- **New Quantity**: Required, ≥ 0
- **Reason**: Required for decreases

---

## Responsive Design

### Mobile (< 640px)
- Card-based item list
- Full-screen scanner
- Bottom sheet for actions
- Swipe to checkout/return

### Tablet (640px - 1024px)
- Grid view for items
- Side panel for details
- Split view for checkout

### Desktop (> 1024px)
- Full table view
- Inline editing
- Drag-drop for categories
- Keyboard shortcuts

---

## Accessibility

### Item Management
- Image alt text required
- Keyboard navigable lists
- Clear status announcements
- Quantity inputs labeled

### Barcode Scanner
- Manual entry alternative
- Audio feedback
- Clear error messages

### Forms
- Logical tab order
- Required fields marked
- Error summary

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Item cards
- `DataTable` - Item list
- `Badge` - Status, category
- `Dialog` - Forms, confirmations
- `Form` - All forms
- `Input` - Fields
- `Select` - Dropdowns
- `Tabs` - Item details sections
- `Avatar` - Item photos

### Custom Components
- `QuantityBadge` - Stock level indicator
- `BarcodeScanner` - Camera scanner
- `BarcodeLabel` - Printable label
- `CheckoutCard` - Active checkout display
- `TransactionRow` - History entry
- `CategoryTree` - Nested categories

### Third-Party
- `@zxing/library` - Barcode scanning
- `JsBarcode` - Barcode generation
- `react-to-print` - Label printing

---

## Role-Based UI

### Visibility Matrix

| Feature | Owner/Admin | Manager | Box Office | Staff |
|---------|-------------|---------|------------|-------|
| View inventory | ✅ | ✅ | ✅ | Limited |
| Add items | ✅ | ✅ | ❌ | ❌ |
| Edit items | ✅ | ✅ | ❌ | ❌ |
| Delete items | ✅ | ❌ | ❌ | ❌ |
| Checkout items | ✅ | ✅ | ✅ | ❌ |
| Return items | ✅ | ✅ | ✅ | ❌ |
| View transactions | ✅ | ✅ | ✅ | Own only |
| Adjust quantities | ✅ | ✅ | ❌ | ❌ |

---

## Notifications

### System Notifications
- Low stock alert
- Item out of stock
- Checkout overdue
- Checkout due soon

### Staff Notifications
- Item checked out to you
- Checkout due reminder
- Overdue notice

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Item not found | 404 with search suggestion |
| Item already checked out | Show who has it |
| Insufficient quantity | Error with available count |
| Barcode not found | Prompt to add new item |
| Duplicate SKU | Error with existing item link |
| Delete with checkouts | Block with active checkouts list |

---

## Settings & Configuration

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/inventory/types` | Inventory Types | Manage inventory type options |

### Inventory Types

**Route:** `/settings/inventory/types`

**Purpose:** Manage inventory type options for categorizing items.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ INVENTORY TYPES                                   [ + Add Type ]        │
│                                                                         │
│ Define types of inventory items for categorization and tracking.       │
│                                                                         │
│ PERFORMANCE                                                             │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  🎭  Props              props           System Default   ●   │    │
│ │ ⋮⋮  👗  Costumes           costumes        System Default   ●   │    │
│ │ ⋮⋮  💄  Makeup             makeup          System Default   ●   │    │
│ │ ⋮⋮  🩸  Special Effects    sfx             Custom           ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ TECHNICAL                                                               │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  💡  Lighting           lighting        System Default   ●   │    │
│ │ ⋮⋮  🔊  Audio              audio           System Default   ●   │    │
│ │ ⋮⋮  🔧  Equipment          equipment       System Default   ●   │    │
│ │ ⋮⋮  🖥️  Electronics        electronics     Custom           ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ OPERATIONS                                                              │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  📦  Supplies           supplies        System Default   ●   │    │
│ │ ⋮⋮  🛠️  Tools              tools           System Default   ●   │    │
│ │ ⋮⋮  🛡️  Safety             safety          System Default   ●   │    │
│ │ ⋮⋮  🚿  Sanitation         sanitation      Custom           ○   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ RETAIL                                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  🛍️  Merchandise        merchandise     System Default   ●   │    │
│ │ ⋮⋮  🍿  Concessions        concessions     System Default   ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Active  ○ Hidden                        [Drag to reorder]            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Fields:**
- Name and description
- Category (performance, technical, operations, retail)
- Icon and color for display
- Trackable (requires checkout tracking)
- Consumable (quantity depletes without checkout)
- Default min stock level

**Features:**
- Type-specific default fields on item form
- Type-based filtering and reporting
- Consumable vs. trackable item behavior
- Custom types for specialized inventory
