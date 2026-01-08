# F4: Staff & Roles - UI Requirements

## Overview

Staff management interfaces for managing attraction employees, their skills, certifications, time tracking, and document management.

## Pages & Routes

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/staff` | Staff Directory | All staff for current org |
| `/staff/new` | Add Staff | Create new staff profile |
| `/staff/:staffId` | Staff Profile | View/edit staff details |
| `/staff/:staffId/schedule` | Staff Schedule | Individual schedule view |
| `/staff/:staffId/time` | Time Entries | Time tracking history |
| `/staff/:staffId/documents` | Documents | Certifications, ID, etc. |
| `/settings/staff/skills` | Skills Management | Configure available skills |
| `/settings/staff/roles` | Staff Roles | Configure role permissions |

### Staff Self-Service Routes

| Route | Page | Description |
|-------|------|-------------|
| `/my/profile` | My Profile | View/edit own profile |
| `/my/schedule` | My Schedule | View own schedule |
| `/my/time` | My Time | Clock in/out, view hours |
| `/my/documents` | My Documents | Upload/view own documents |

---

## Components

### Staff Directory

#### `<StaffDirectory />`
- **Display**: Table/grid of staff members
- **Columns**: Photo, name, role, attractions assigned, status, contact
- **Actions**: Add staff, bulk actions, export
- **Features**:
  - Search by name, email, phone
  - Filter by role, attraction, status, skills
  - Sort by name, role, hire date
  - Toggle table/card view

#### `<StaffCard />`
- **Display**: Photo, name, role, attraction badges, contact icons
- **Actions**: View profile, quick schedule, message
- **Status**: Active, On Leave, Inactive

#### `<StaffFilters />`
- **Filters**:
  - Role (multi-select)
  - Attraction assignment (multi-select)
  - Skills (multi-select)
  - Status (active, inactive, all)
  - Hire date range

### Staff Profile

#### `<StaffProfileForm />`
- **Sections**:
  - Personal Info (name, photo, contact)
  - Employment (role, hire date, pay rate)
  - Emergency Contact
  - Attraction Assignments
  - Notes (admin only)
- **Actions**: Save, Deactivate, Delete

#### `<StaffProfileView />`
- **Tabs**:
  - Overview (info, stats)
  - Schedule (calendar view)
  - Time (hours summary)
  - Skills & Certs
  - Documents
  - Notes (admin only)

#### `<AttractionAssignments />`
- **Display**: List of assigned attractions with roles
- **Actions**: Add assignment, remove, change role
- **Features**: Primary attraction indicator

### Skills & Certifications

#### `<SkillsList />`
- **Display**: Tags/chips of skills
- **Actions**: Add skill, remove skill
- **Features**:
  - Proficiency levels (1-5 stars)
  - Skill categories

#### `<SkillEditor />`
- **Fields**: Skill name, proficiency level, notes
- **Actions**: Save, Remove

#### `<CertificationsList />`
- **Display**: Cards with cert name, issuer, dates
- **Actions**: Add cert, edit, delete
- **Status**: Valid, Expiring Soon, Expired

#### `<CertificationForm />`
- **Fields**: Type, issuer, issue date, expiry date, document upload
- **Actions**: Save, Delete
- **Features**: Expiry notifications

### Time Tracking

#### `<TimeClock />`
- **Display**: Current status (clocked in/out), duration
- **Actions**: Clock In, Clock Out, Start Break, End Break
- **Features**:
  - Attraction/position selector on clock in
  - GPS verification (optional)
  - Photo verification (optional)
  - Notes field

#### `<TimeEntryList />`
- **Display**: Table of time entries
- **Columns**: Date, attraction, clock in, clock out, duration, status
- **Actions**: Edit (admin), approve (manager)
- **Features**:
  - Filter by date range, attraction
  - Summary totals
  - Export

#### `<TimeEntryForm />`
- **Fields**: Date, attraction, clock in time, clock out time, break duration, notes
- **Actions**: Save, Delete
- **Usage**: Manual entry or edit existing

#### `<WeeklyTimesheet />`
- **Display**: Week view with daily hours
- **Features**:
  - Week navigation
  - Daily totals
  - Weekly total
  - Overtime indicator

### Documents

#### `<DocumentsList />`
- **Display**: Grid/list of documents
- **Categories**: ID, Certifications, Contracts, Other
- **Actions**: Upload, download, delete
- **Features**:
  - Preview for images/PDFs
  - Expiry tracking
  - Required documents indicator

#### `<DocumentUploader />`
- **Fields**: File, category, name, expiry date
- **Accepts**: PDF, images, common doc formats
- **Features**: Drag-drop, progress indicator

---

## User Flows

### Add New Staff Flow
```
[Staff Directory]
    │
    ▼
[Add Staff Button]
    │
    ▼
[Add Staff Form]
    │
    ├── Basic Info (name, email, phone)
    ├── Role Selection
    ├── Attraction Assignment(s)
    │
    ▼
[Save]
    │
    ├── Send Invite Email? [Yes/No]
    │       │
    │       ▼
    │   [Email sent with login credentials]
    │
    ▼
[Staff Profile Created]
```

### Clock In/Out Flow
```
[My Time Page]
    │
    ▼
[Not Clocked In State]
    │
    ▼
[Clock In Button]
    │
    ▼
[Select Attraction & Position]
    │
    ├── (Optional) GPS Verification
    │
    ▼
[Clock In Confirmed]
    │
    ▼
[Clocked In State - Timer Running]
    │
    ├── [Start Break] → [On Break State] → [End Break]
    │
    ▼
[Clock Out Button]
    │
    ▼
[Add Notes (optional)]
    │
    ▼
[Clock Out Confirmed - Duration Shown]
```

### Add Certification Flow
```
[Staff Profile → Certifications Tab]
    │
    ▼
[Add Certification Button]
    │
    ▼
[Certification Form Modal]
    │
    ├── Select Type (CPR, First Aid, Custom)
    ├── Enter Issuer
    ├── Issue Date
    ├── Expiry Date
    ├── Upload Document
    │
    ▼
[Save → Certification Added]
    │
    ▼
[Expiry reminders scheduled]
```

---

## State Management

### Staff Store
```typescript
interface StaffState {
  staff: StaffProfile[];
  currentStaff: StaffProfile | null;
  skills: Skill[];
  certifications: Certification[];
  timeEntries: TimeEntry[];
  documents: Document[];
  isLoading: boolean;

  // Directory
  fetchStaff: (filters?: StaffFilters) => Promise<void>;
  fetchStaffProfile: (staffId: string) => Promise<void>;
  createStaff: (data: CreateStaffData) => Promise<StaffProfile>;
  updateStaff: (data: UpdateStaffData) => Promise<void>;
  deactivateStaff: (staffId: string) => Promise<void>;

  // Skills
  addSkill: (staffId: string, skill: SkillData) => Promise<void>;
  removeSkill: (staffId: string, skillId: string) => Promise<void>;

  // Certifications
  addCertification: (staffId: string, cert: CertData) => Promise<void>;
  updateCertification: (certId: string, data: CertData) => Promise<void>;

  // Time
  clockIn: (attractionId: string, position?: string) => Promise<void>;
  clockOut: (notes?: string) => Promise<void>;
  fetchTimeEntries: (staffId: string, range: DateRange) => Promise<void>;

  // Documents
  uploadDocument: (staffId: string, file: File, meta: DocMeta) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
}
```

### Time Clock State
```typescript
interface TimeClockState {
  isClocked: boolean;
  currentEntry: TimeEntry | null;
  clockedInAt: Date | null;
  currentAttraction: Attraction | null;
  isOnBreak: boolean;
  breakStartedAt: Date | null;
}
```

---

## Validation Rules

### Staff Profile
- **Name**: Required, 2-100 characters
- **Email**: Required, valid format, unique per org
- **Phone**: Optional, valid format
- **Role**: Required, valid org role
- **Hire Date**: Optional, not in future

### Time Entry
- **Clock In**: Required
- **Clock Out**: Must be after clock in
- **Duration**: Max 24 hours
- **Attraction**: Required for clock in

### Certification
- **Type**: Required
- **Issue Date**: Required, not in future
- **Expiry Date**: Optional, must be after issue date
- **Document**: Optional, max 10MB

---

## Responsive Design

### Mobile (< 640px)
- Staff directory as cards
- Time clock prominent at top
- Swipe actions on list items
- Bottom sheet for filters
- Full-screen document preview

### Tablet (640px - 1024px)
- Split view (list + details)
- Collapsible filters sidebar
- Table with essential columns

### Desktop (> 1024px)
- Full table with all columns
- Slide-over panel for details
- Inline editing where appropriate
- Keyboard shortcuts for time clock

---

## Accessibility

### Time Clock
- Large touch targets for buttons
- Clear visual state indicators
- Audio feedback option
- Keyboard accessible

### Staff Directory
- Proper table semantics
- Sortable columns announced
- Filter changes announced
- Focus management on updates

### Document Upload
- Drag-drop with keyboard alternative
- Upload progress announced
- Error states clearly communicated

---

## UI Components (shadcn/ui)

### Required Components
- `DataTable` - Staff directory
- `Card` - Staff cards
- `Avatar` - Staff photos
- `Badge` - Role/status indicators
- `Tabs` - Profile sections
- `Calendar` - Date pickers
- `Dialog` - Modals
- `DropdownMenu` - Actions menu
- `Progress` - Upload progress

### Custom Components
- `TimeClock` - Clock in/out widget
- `SkillBadge` - Skill with proficiency
- `CertCard` - Certification display
- `DocumentCard` - Document preview
- `TimeEntryRow` - Editable time row

---

## Role-Based UI

### Visibility Matrix

| Feature | Owner/Admin | Manager | HR | Staff |
|---------|-------------|---------|-----|-------|
| View all staff | ✅ | ✅ (assigned attractions) | ✅ | ❌ |
| Add/edit staff | ✅ | ❌ | ✅ | ❌ |
| View pay rates | ✅ | ❌ | ✅ | Own only |
| Approve time | ✅ | ✅ | ✅ | ❌ |
| Edit time entries | ✅ | ✅ (team) | ✅ | Own only |
| View documents | ✅ | ✅ (team) | ✅ | Own only |
| Clock in/out | ❌ | ❌ | ❌ | ✅ |

---

## Notifications

### Staff Notifications
- Certification expiring (30, 14, 7 days)
- Schedule published
- Time entry approved/rejected
- Document required

### Admin Notifications
- Certification expired
- Overtime threshold reached
- Missing clock out

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Staff not found | 404 with return to directory |
| No permission | 403 with explanation |
| Duplicate email | Inline error on email field |
| Clock in without attraction | Error prompting attraction selection |
| Clock out without clock in | Button disabled, message shown |
| Document upload failed | Toast with retry option |
| Time overlap | Inline error showing conflict |

---

## Settings & Configuration

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/staff/skills` | Skill Types | Manage skill options |
| `/settings/staff/certifications` | Certification Types | Manage certification types |
| `/settings/staff/documents` | Document Types | Manage document categories |

### Skill Types

**Route:** `/settings/staff/skills`

**Purpose:** Manage skill type options that can be assigned to staff.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ SKILL TYPES                                        [ + Add Skill ]      │
│                                                                         │
│ Define skills that staff can be rated on.                              │
│                                                                         │
│ PERFORMANCE                                                             │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  🎭  Acting             acting          System Default   ●   │    │
│ │ ⋮⋮  😱  Scaring            scaring         System Default   ●   │    │
│ │ ⋮⋮  🗣️  Improv             improv          System Default   ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ TECHNICAL                                                               │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  💄  Makeup             makeup          System Default   ●   │    │
│ │ ⋮⋮  🎨  Costume Design     costume         Custom           ●   │    │
│ │ ⋮⋮  🔧  Technical          technical       System Default   ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Active  ○ Hidden                        [Drag to reorder]            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Group skills by category (performance, technical, operations)
- Set proficiency scale (1-5 stars)
- Add custom skills specific to your organization

### Certification Types

**Route:** `/settings/staff/certifications`

**Purpose:** Manage certification types that staff can hold.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ CERTIFICATION TYPES                            [ + Add Certification ]  │
│                                                                         │
│ Define certifications that staff can earn or provide.                  │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │      Name                  Validity    Required    Status       │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │ ❤️  CPR/First Aid          2 years        ●        Active       │    │
│ │ 🍺  Alcohol Service        3 years        ○        Active       │    │
│ │ 🍔  Food Handler           2 years        ○        Active       │    │
│ │ 🔒  Security               1 year         ○        Active       │    │
│ │ 🎭  Actor Training         Never          ○        Active       │    │
│ │ 💄  SFX Makeup             Never          ○        Active       │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Required for all staff  ○ Optional                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Fields:**
- Name and description
- Validity period (1yr, 2yr, 3yr, never expires)
- Required for all staff (toggle)
- Reminder settings (days before expiry)

### Document Types

**Route:** `/settings/staff/documents`

**Purpose:** Manage document categories for staff files.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ DOCUMENT TYPES                                  [ + Add Document Type ] │
│                                                                         │
│ Define types of documents staff can upload.                            │
│                                                                         │
│ TAX & PAYROLL                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ 📄  W-4 Tax Withholding     w4             Required    Active   │    │
│ │ 💳  Direct Deposit Form     direct_deposit  Optional    Active   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ IDENTITY                                                                │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ 🪪  I-9 Employment          i9             Required    Active   │    │
│ │ 🆔  ID Copy                 id_copy        Optional    Active   │    │
│ │ 📸  Staff Photo             photo          Optional    Active   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ COMPLIANCE                                                              │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ✍️  Signed Waiver           signed_waiver  Optional    Active   │    │
│ │ 📋  Background Check        background     Optional    Active   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Fields:**
- Name and description
- Category (tax, identity, compliance, other)
- Required (toggle) - shows as missing on staff profile
- Expiry tracking (toggle) - if document expires

**Features:**
- Staff profiles show checklist of required documents
- Notifications when required documents are missing
- Expiry alerts for time-limited documents
