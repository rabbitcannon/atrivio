# F3: Attractions - UI Requirements

## Overview

Attraction management interfaces for creating, configuring, and publishing venues including haunted attractions, escape rooms, and similar experiences.

## Pages & Routes

### Admin Routes (Authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/attractions` | Attractions List | All attractions for current org |
| `/attractions/new` | Create Attraction | New attraction wizard |
| `/attractions/:attractionId` | Attraction Dashboard | Overview & quick stats |
| `/attractions/:attractionId/settings` | Attraction Settings | General configuration |
| `/attractions/:attractionId/seasons` | Seasons | Manage operating seasons |
| `/attractions/:attractionId/hours` | Operating Hours | Set hours per day |
| `/attractions/:attractionId/zones` | Zones | Manage zones/areas |
| `/attractions/:attractionId/media` | Media | Photos, videos, gallery |
| `/attractions/:attractionId/amenities` | Amenities | Available amenities |

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/a/:slug` | Public Attraction Page | Customer-facing attraction info |
| `/a/:slug/tickets` | Buy Tickets | Ticket purchase (→ F8) |
| `/explore` | Explore Attractions | Discover attractions (future) |

---

## Components

### Attraction Management

#### `<AttractionsList />`
- **Display**: Grid/list of attraction cards
- **Actions**: Create new, filter, search
- **Features**:
  - Toggle grid/list view
  - Filter by status (draft, published, archived)
  - Search by name
  - Sort by name, created date, status

#### `<AttractionCard />`
- **Display**: Cover image, name, status badge, quick stats
- **Stats**: Current season, upcoming events, ticket sales
- **Actions**: View dashboard, quick publish/unpublish

#### `<CreateAttractionWizard />`
- **Steps**:
  1. Basic Info (name, slug, type, description)
  2. Location (address, coordinates, parking info)
  3. First Season (dates, name)
  4. Operating Hours (template selection)
  5. Review & Create
- **Features**:
  - Save draft at any step
  - Skip optional steps
  - Progress indicator

#### `<AttractionSettingsForm />`
- **Sections**:
  - Basic Info (name, slug, description)
  - Contact (email, phone, social links)
  - Location (address, map, directions)
  - Branding (logo, colors, cover image)
  - Policies (age restrictions, disclaimers)
- **Actions**: Save, Revert changes

### Seasons

#### `<SeasonsList />`
- **Display**: Timeline/list of seasons
- **Actions**: Create season, duplicate, archive
- **Features**:
  - Visual timeline showing date ranges
  - Active season highlighted
  - Past seasons collapsible

#### `<SeasonForm />`
- **Fields**: Name, start date, end date, description, ticket settings
- **Actions**: Save, Delete (if no tickets sold)
- **Validation**: No overlapping dates, end after start

#### `<SeasonCard />`
- **Display**: Name, date range, status, ticket sales summary
- **Actions**: Edit, duplicate, view tickets
- **Status**: Draft, Active, Completed, Archived

### Operating Hours

#### `<HoursEditor />`
- **Display**: Weekly calendar grid
- **Actions**: Set hours per day, copy to multiple days
- **Features**:
  - Click and drag to set time ranges
  - Quick templates (weekends only, daily, etc.)
  - Exception dates (holidays, special events)
  - Multiple time slots per day support

#### `<HoursTemplate />`
- **Type**: Preset configurations
- **Options**: Weekends Only, Thursday-Sunday, Daily, Custom
- **Features**: Apply template with one click

#### `<ExceptionDates />`
- **Display**: List of date overrides
- **Actions**: Add closed date, add special hours
- **Features**: Recurring exceptions (every Monday closed)

### Zones

#### `<ZonesList />`
- **Display**: Sortable list of zones
- **Actions**: Add zone, reorder, delete
- **Features**: Drag to reorder, capacity per zone

#### `<ZoneForm />`
- **Fields**: Name, description, capacity, type, order
- **Actions**: Save, Delete
- **Types**: Attraction, Queue, Retail, Food, Restroom, Parking

### Media

#### `<MediaGallery />`
- **Display**: Grid of images/videos
- **Actions**: Upload, reorder, delete, set as cover
- **Features**:
  - Drag and drop upload
  - Bulk upload
  - Alt text editing
  - Lightbox preview

#### `<MediaUploader />`
- **Accepts**: Images (jpg, png, webp), Videos (mp4, webm)
- **Features**:
  - Progress indicator
  - Auto-resize/optimize
  - Crop tool for cover images

### Amenities

#### `<AmenitiesList />`
- **Display**: Checkbox grid of amenities
- **Categories**: Accessibility, Parking, Food, Safety, Entertainment
- **Actions**: Toggle amenities, add custom

---

## User Flows

### Create Attraction Flow
```
[Attractions List]
    │
    ▼
[Create Attraction Button]
    │
    ▼
[Wizard Step 1: Basic Info]
    │
    ├── Name, Slug, Type, Short Description
    │
    ▼
[Wizard Step 2: Location]
    │
    ├── Address, Map Pin, Parking Info
    │
    ▼
[Wizard Step 3: First Season]
    │
    ├── Season Name, Date Range
    │
    ▼
[Wizard Step 4: Hours]
    │
    ├── Select Template or Custom Hours
    │
    ▼
[Wizard Step 5: Review]
    │
    ▼
[Create → Attraction Dashboard (Draft status)]
```

### Publish Attraction Flow
```
[Attraction Dashboard (Draft)]
    │
    ▼
[Publish Button]
    │
    ▼
[Pre-publish Checklist Modal]
    │
    ├── ✓ Basic info complete
    ├── ✓ Location set
    ├── ✓ At least one season
    ├── ✓ Operating hours set
    ├── ✓ At least one image
    ├── ○ Ticket types configured (warning if missing)
    │
    ▼
[All checks pass → Confirm Publish]
    │
    ▼
[Published → Public URL shown]
```

### Season Setup Flow
```
[Seasons Page]
    │
    ▼
[Create Season]
    │
    ▼
[Season Form]
    │
    ├── Name (e.g., "Halloween 2024")
    ├── Date Range
    ├── Description
    │
    ▼
[Save → Season Created (Draft)]
    │
    ▼
[Configure Tickets (→ F8)]
    │
    ▼
[Activate Season]
```

---

## State Management

### Attraction Store
```typescript
interface AttractionState {
  attractions: Attraction[];
  currentAttraction: Attraction | null;
  seasons: Season[];
  currentSeason: Season | null;
  zones: Zone[];
  hours: OperatingHours[];
  media: Media[];
  isLoading: boolean;

  // Actions
  fetchAttractions: () => Promise<void>;
  fetchAttraction: (attractionId: string) => Promise<void>;
  createAttraction: (data: CreateAttractionData) => Promise<Attraction>;
  updateAttraction: (data: UpdateAttractionData) => Promise<void>;
  publishAttraction: (attractionId: string) => Promise<void>;
  unpublishAttraction: (attractionId: string) => Promise<void>;

  // Seasons
  fetchSeasons: (attractionId: string) => Promise<void>;
  createSeason: (data: CreateSeasonData) => Promise<Season>;
  updateSeason: (data: UpdateSeasonData) => Promise<void>;

  // Zones
  fetchZones: (attractionId: string) => Promise<void>;
  reorderZones: (zoneIds: string[]) => Promise<void>;

  // Media
  uploadMedia: (files: File[]) => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  reorderMedia: (mediaIds: string[]) => Promise<void>;
}
```

---

## Validation Rules

### Attraction Name
- Required
- 2-100 characters

### Attraction Slug
- Required
- 3-50 characters
- Lowercase, numbers, hyphens
- Unique across platform

### Season Dates
- Start date required
- End date required
- End must be after start
- No overlapping seasons

### Operating Hours
- At least one day with hours for active season
- Open time before close time
- Valid time format (HH:MM)

### Media
- Images: max 10MB, jpg/png/webp
- Videos: max 100MB, mp4/webm
- At least 1 image required to publish

---

## Responsive Design

### Mobile (< 640px)
- Attractions as full-width cards
- Wizard steps as full pages
- Hours editor as list instead of grid
- Bottom sheet for quick actions

### Tablet (640px - 1024px)
- 2-column attraction grid
- Side panel for attraction details
- Hours grid with scroll

### Desktop (> 1024px)
- 3-4 column attraction grid
- Full hours grid visible
- Drag-and-drop everywhere
- Keyboard shortcuts

---

## Accessibility

### Media Gallery
- All images have alt text
- Keyboard navigable grid
- Focus visible on items
- Screen reader announces position

### Hours Editor
- Time inputs are accessible
- Keyboard time selection
- Clear labels for days/times
- Changes announced

### Forms
- Logical tab order
- Field descriptions available
- Error summary at top
- Required fields marked

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Attraction cards
- `Tabs` - Settings sections
- `Calendar` - Season dates
- `Dialog` - Modals
- `Form` - All forms
- `Select` - Dropdowns
- `Checkbox` - Amenities
- `Switch` - Toggle settings
- `Badge` - Status indicators

### Custom Components
- `HoursGrid` - Weekly hours editor
- `MediaUploader` - Drag-drop uploader
- `AddressAutocomplete` - Location picker
- `SlugInput` - Auto-slug generator
- `StatusBadge` - Draft/Published/Archived

---

## Public Attraction Page

### `<PublicAttractionPage />`
- **Sections**:
  - Hero with cover image
  - Name, type, short description
  - Current season info
  - Operating hours (this week)
  - Photo gallery
  - Location map & directions
  - Amenities
  - Policies & disclaimers
  - Buy tickets CTA

### SEO Requirements
- Dynamic meta tags (title, description, image)
- Structured data (LocalBusiness, Event)
- Open Graph tags for social sharing
- Canonical URL

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Attraction not found | 404 with return link |
| No permission | 403 with explanation |
| Slug taken | Inline error with suggestions |
| Overlapping seasons | Inline error showing conflict |
| Publish incomplete | Checklist with missing items |
| Upload failed | Toast with retry option |
| No active season | Banner prompting season creation |

---

## Settings & Configuration

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/attractions/types` | Attraction Types | Manage attraction type options |
| `/settings/attractions/amenities` | Amenity Types | Manage amenity options |

### Lookup Table Management

#### `<LookupTableManager />`
Reusable component for managing lookup table entries (types, categories, etc.)

- **Display**: Sortable table/list of entries
- **Columns**: Icon, Name, Key, Description, Status, Sort Order
- **Actions**: Add, Edit, Reorder, Deactivate
- **Features**:
  - Drag to reorder
  - Search/filter
  - Show system defaults vs org custom
  - Cannot delete system defaults (can only hide)

#### `<LookupEntryForm />`
- **Fields**:
  - Key (auto-generated from name, editable)
  - Name (display name)
  - Description
  - Icon (icon picker)
  - Color (color picker)
  - Is Active (toggle)
- **Actions**: Save, Delete (org entries only)
- **Validation**: Key unique within org

### Attraction Types

**Route:** `/settings/attractions/types`

**Purpose:** Manage attraction type options (haunted_house, escape_room, etc.)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ ATTRACTION TYPES                                    [ + Add Type ]      │
│                                                                         │
│ Customize the types of attractions your organization offers.           │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  🏚️  Haunted House      haunted_house     System Default  ●  │    │
│ │ ⋮⋮  🚪  Escape Room        escape_room       System Default  ●  │    │
│ │ ⋮⋮  🌲  Trail              trail             System Default  ●  │    │
│ │ ⋮⋮  🌀  Maze               maze              System Default  ●  │    │
│ │ ⋮⋮  🎪  Carnival           carnival          Custom          ●  │    │
│ │ ⋮⋮  👻  Ghost Tour         ghost_tour        Custom          ○  │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Active  ○ Hidden                        [Drag to reorder]            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Amenity Types

**Route:** `/settings/attractions/amenities`

**Purpose:** Manage amenity options (parking, wheelchair access, etc.)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ AMENITY TYPES                                      [ + Add Amenity ]    │
│                                                                         │
│ Filter: [All Categories ▼]                                              │
│                                                                         │
│ ACCESSIBILITY                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ♿  Wheelchair Accessible   wheelchair      System Default   ●   │    │
│ │ 👂  Hearing Assistance      hearing         System Default   ●   │    │
│ │ 👁️  Visual Assistance       visual          System Default   ○   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ FACILITIES                                                              │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ 🅿️  Free Parking            parking_free    System Default   ●   │    │
│ │ 🚻  Restrooms               restrooms       System Default   ●   │    │
│ │ 🍔  Food Available          food            System Default   ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Grouped by category
- Filter by category
- Add custom amenities
- Hide unused system defaults
