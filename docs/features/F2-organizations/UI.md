# F2: Organizations - UI Requirements

## Overview

Multi-tenant organization management interfaces for creating, managing, and switching between organizations.

## Pages & Routes

### Organization Management

| Route | Page | Description |
|-------|------|-------------|
| `/orgs` | Organization Selector | List user's organizations |
| `/orgs/new` | Create Organization | New org setup wizard |
| `/orgs/join/:code` | Join Organization | Accept invitation |
| `/dashboard` | Dashboard | Current org dashboard (redirects to org selector if none) |
| `/settings/organization` | Org Settings | General org settings |
| `/settings/organization/members` | Members | Member management |
| `/settings/organization/invitations` | Invitations | Pending invitations |
| `/settings/organization/roles` | Roles | Role & permission management |
| `/settings/organization/billing` | Billing | Subscription & billing |

---

## Components

### Organization Selection

#### `<OrgSwitcher />`
- **Location**: Header/sidebar
- **Display**: Current org name + logo, dropdown with other orgs
- **Actions**: Switch org, "Create new org" button
- **Features**:
  - Search orgs (if > 5)
  - Show role badge per org
  - Keyboard navigation (Cmd/Ctrl + K)

#### `<OrgCard />`
- **Display**: Logo, name, role, member count
- **Actions**: Select, settings (if admin+)
- **Features**: Hover state, active indicator

#### `<CreateOrgForm />`
- **Fields**: Name, Slug, Logo, Industry, Timezone
- **Actions**: Create, Cancel
- **Features**:
  - Slug auto-generation from name
  - Slug availability check (debounced)
  - Logo upload with preview

### Member Management

#### `<MembersList />`
- **Display**: Table with avatar, name, email, role, joined date, status
- **Actions**: Change role, remove, resend invite
- **Features**:
  - Search/filter by name, email, role
  - Bulk actions (remove, change role)
  - Sort by name, role, date
  - Pagination

#### `<MemberRoleSelect />`
- **Type**: Dropdown
- **Options**: Roles available to current user (can't assign higher than own)
- **Features**: Role descriptions on hover

#### `<InviteMemberModal />`
- **Fields**: Email(s), Role, Custom message
- **Actions**: Send invite, Cancel
- **Features**:
  - Multi-email input (comma/newline separated)
  - Email validation
  - Role selector with descriptions

#### `<InvitationsList />`
- **Display**: Table with email, role, sent date, expires, status
- **Actions**: Resend, revoke
- **Features**: Filter by status (pending, expired)

#### `<AcceptInvitationPage />`
- **Display**: Org info, inviter name, role offered
- **Actions**: Accept, Decline
- **Features**:
  - Show if user needs to register first
  - Expired invitation handling

### Organization Settings

#### `<OrgSettingsForm />`
- **Fields**: Name, Logo, Timezone, Address, Contact info
- **Actions**: Save, Cancel
- **Features**: Logo upload, address autocomplete

#### `<OrgDangerZone />`
- **Actions**: Transfer ownership, Delete organization
- **Features**:
  - Confirmation modals with org name typing
  - Owner-only visibility

---

## User Flows

### Create Organization Flow
```
[Orgs List / Dashboard]
    │
    ▼
[Create Org Button]
    │
    ▼
[Create Org Form]
    │
    ├── Step 1: Basic Info (Name, Slug)
    │       │
    │       ▼
    ├── Step 2: Branding (Logo, Colors) [Optional]
    │       │
    │       ▼
    └── Step 3: Settings (Timezone, Industry)
            │
            ▼
        [Create → Redirect to new org dashboard]
```

### Invite Member Flow
```
[Members Page]
    │
    ▼
[Invite Button → Modal]
    │
    ▼
[Enter email(s), select role]
    │
    ▼
[Send Invitations]
    │
    ├── Success → Toast + invitations appear in list
    │
    └── Partial failure → Show which emails failed
```

### Accept Invitation Flow
```
[Email with invitation link]
    │
    ▼
[/orgs/join/:code]
    │
    ├── Logged in → [Accept/Decline page]
    │       │
    │       ├── Accept → [Add to org → Redirect to org dashboard]
    │       │
    │       └── Decline → [Confirm → Redirect to orgs list]
    │
    └── Not logged in → [Login/Register with redirect back]
```

### Switch Organization Flow
```
[Any page with OrgSwitcher]
    │
    ▼
[Click switcher → Dropdown opens]
    │
    ▼
[Select different org]
    │
    ▼
[Update context → Redirect to /dashboard]
    │
    ▼
[All data refetches for new org context]
```

---

## State Management

### Organization Store
```typescript
interface OrgState {
  currentOrg: Organization | null;
  organizations: Organization[];
  members: Member[];
  invitations: Invitation[];
  isLoading: boolean;

  // Actions
  setCurrentOrg: (orgId: string) => void;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (data: CreateOrgData) => Promise<Organization>;
  updateOrganization: (data: UpdateOrgData) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;

  // Members
  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: Role) => Promise<void>;
  updateMemberRole: (memberId: string, role: Role) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;

  // Invitations
  fetchInvitations: () => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
}
```

### Context Persistence
- Current org ID stored in localStorage
- Org context included in all API requests
- URL structure: `/dashboard` (org from context) vs `/orgs/:orgId/...` (explicit)

---

## Validation Rules

### Organization Name
- Required
- 2-100 characters
- No special characters except spaces, hyphens, ampersand

### Organization Slug
- Required
- 3-50 characters
- Lowercase letters, numbers, hyphens only
- Must start with letter
- Must be unique

### Invitation Email
- Valid email format
- Not already a member
- Not already invited (pending)

---

## Responsive Design

### Mobile (< 640px)
- Org switcher as full-screen modal
- Members list as cards instead of table
- Bottom sheet for member actions
- Stacked form fields

### Tablet (640px - 1024px)
- Sidebar org switcher
- Responsive table with horizontal scroll
- Modal for invite/edit forms

### Desktop (> 1024px)
- Dropdown org switcher in header
- Full table view with all columns
- Slide-over panels for edit forms
- Keyboard shortcuts

---

## Accessibility

### Organization Switcher
- Keyboard navigable dropdown
- Current org announced on focus
- Arrow keys to navigate options
- Enter to select, Escape to close

### Member Management
- Table has proper headers and row labels
- Actions have descriptive aria-labels
- Bulk selection announced
- Sort state announced

### Forms
- Required fields marked
- Errors linked to fields
- Focus trapped in modals
- Escape closes modals

---

## UI Components (shadcn/ui)

### Required Components
- `DropdownMenu` - Org switcher
- `Dialog` - Modals (invite, confirm)
- `Table` - Members, invitations lists
- `Badge` - Role indicators
- `Avatar` - Member/org images
- `Tabs` - Settings sections
- `AlertDialog` - Destructive confirmations
- `Command` - Org search (Cmd+K)

### Custom Components
- `OrgSwitcher` - Header org selector
- `RoleBadge` - Colored role indicator
- `InviteInput` - Multi-email input
- `SlugInput` - Auto-slug with availability check

---

## Role-Based UI

### Visibility by Role

| Component | Owner | Admin | Manager | Others |
|-----------|-------|-------|---------|--------|
| Org Settings | ✅ | ✅ | ❌ | ❌ |
| Members List | ✅ | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Change Roles | ✅ | ✅* | ❌ | ❌ |
| Remove Members | ✅ | ✅* | ❌ | ❌ |
| Delete Org | ✅ | ❌ | ❌ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ | ❌ |

*Admin can only modify roles lower than their own

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Org not found | 404 page with "return to orgs" |
| No permission | 403 page with explanation |
| Slug taken | Inline error with suggestions |
| Invite to existing member | Inline error with member name |
| Last admin leaving | Block with explanation |
| Delete org with data | Confirmation with data summary |
