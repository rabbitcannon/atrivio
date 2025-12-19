# F1: Auth & Users - UI Requirements

## Overview

Authentication and user profile management interfaces using Supabase Auth with PKCE flow.

## Pages & Routes

### Public Routes (Unauthenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/auth/login` | Login | Email/password and magic link login |
| `/auth/register` | Register | New user registration |
| `/auth/forgot-password` | Forgot Password | Password reset request |
| `/auth/reset-password` | Reset Password | Set new password (from email link) |
| `/auth/verify` | Email Verification | Confirm email address |
| `/auth/callback` | Auth Callback | OAuth/magic link redirect handler |

### Protected Routes (Authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/profile` | Profile | View/edit user profile |
| `/profile/security` | Security Settings | Password change, sessions |
| `/profile/preferences` | Preferences | UI preferences, notifications |

---

## Components

### Auth Components

#### `<LoginForm />`
- **Fields**: Email, Password
- **Actions**: Submit, "Forgot Password" link, "Sign up" link
- **Features**:
  - Show/hide password toggle
  - "Remember me" checkbox
  - Loading state on submit
  - Error message display
- **Validation**: Email format, required fields

#### `<RegisterForm />`
- **Fields**: Full Name, Email, Password, Confirm Password
- **Actions**: Submit, "Already have account" link
- **Features**:
  - Password strength indicator
  - Terms of service checkbox
  - Loading state on submit
- **Validation**:
  - Email format and uniqueness (async)
  - Password minimum 8 chars, 1 uppercase, 1 number
  - Passwords must match

#### `<MagicLinkForm />`
- **Fields**: Email
- **Actions**: Send magic link
- **Features**: Success message with email sent confirmation
- **Validation**: Email format

#### `<ForgotPasswordForm />`
- **Fields**: Email
- **Actions**: Send reset link
- **Features**: Success message regardless of email existence (security)

#### `<ResetPasswordForm />`
- **Fields**: New Password, Confirm Password
- **Actions**: Reset password
- **Features**: Password strength indicator
- **Validation**: Password requirements, must match

#### `<ProfileForm />`
- **Fields**: Avatar, Full Name, Phone, Timezone
- **Actions**: Save, Cancel
- **Features**:
  - Avatar upload with crop/resize
  - Phone number formatting
  - Timezone selector with search

#### `<ChangePasswordForm />`
- **Fields**: Current Password, New Password, Confirm New Password
- **Actions**: Update password
- **Validation**: Current password correct, new password requirements

#### `<SessionsList />`
- **Display**: Active sessions with device info, location, last active
- **Actions**: Revoke individual sessions, "Log out all devices"

---

## User Flows

### Registration Flow
```
[Register Page]
    │
    ├── Fill form → Validate → Submit
    │       │
    │       ▼
    │   [Loading State]
    │       │
    │       ├── Success → [Verification Email Sent Page]
    │       │                    │
    │       │                    ▼
    │       │              [User clicks email link]
    │       │                    │
    │       │                    ▼
    │       │              [Email Verified → Login Page]
    │       │
    │       └── Error → Show inline error message
    │
    └── "Already have account" → [Login Page]
```

### Login Flow
```
[Login Page]
    │
    ├── Email/Password
    │       │
    │       ▼
    │   [Validate & Submit]
    │       │
    │       ├── Success → [Dashboard or Original Destination]
    │       │
    │       ├── Invalid Credentials → Show error
    │       │
    │       └── Email Not Verified → Show verification prompt
    │
    ├── Magic Link
    │       │
    │       ▼
    │   [Enter Email → Send Link]
    │       │
    │       ▼
    │   [Check Email Message]
    │       │
    │       ▼
    │   [Click Link → Auth Callback → Dashboard]
    │
    └── Forgot Password → [Forgot Password Page]
```

### Password Reset Flow
```
[Forgot Password Page]
    │
    ▼
[Enter Email → Submit]
    │
    ▼
[Success Message: "If email exists, reset link sent"]
    │
    ▼
[User clicks email link]
    │
    ▼
[Reset Password Page]
    │
    ▼
[Enter New Password → Submit]
    │
    ├── Success → [Login Page with success message]
    │
    └── Token Expired → [Request new reset link]
```

---

## State Management

### Auth Store (Zustand/Context)
```typescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
}
```

### Session Persistence
- Store tokens in secure httpOnly cookies (handled by Supabase)
- Refresh token automatically before expiry
- Clear all state on logout

---

## Validation Rules

### Email
- Required
- Valid email format
- Max 255 characters

### Password
- Required
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Max 128 characters

### Full Name
- Required
- 2-100 characters
- Letters, spaces, hyphens, apostrophes only

### Phone
- Optional
- Valid international format (E.164)
- Display formatted for locale

---

## Responsive Design

### Mobile (< 640px)
- Full-width forms
- Stacked layout
- Large touch targets (44px minimum)
- Bottom-sheet modals for actions

### Tablet (640px - 1024px)
- Centered card layout (max-width: 450px)
- Side-by-side form fields where appropriate

### Desktop (> 1024px)
- Centered card with background illustration
- Keyboard shortcuts for form submission
- Tab navigation between fields

---

## Accessibility

### Forms
- All inputs have associated labels
- Error messages linked with `aria-describedby`
- Focus management after form submission
- Clear focus indicators (2px outline)

### Password Fields
- Show/hide toggle is keyboard accessible
- Password requirements announced to screen readers
- Strength indicator has text alternative

### Loading States
- `aria-busy="true"` on forms during submission
- Disabled submit button with loading spinner
- Screen reader announcement on completion

### Error Handling
- Errors announced via `aria-live="polite"`
- Error summary at top of form with links to fields
- Invalid fields marked with `aria-invalid="true"`

---

## UI Components (shadcn/ui)

### Required Components
- `Button` - Submit, secondary actions
- `Input` - Text, email, password fields
- `Label` - Form field labels
- `Card` - Auth form container
- `Alert` - Error/success messages
- `Avatar` - Profile image
- `Separator` - Section dividers
- `Skeleton` - Loading states
- `Toast` - Transient notifications

### Custom Components
- `PasswordInput` - Input with show/hide toggle
- `PasswordStrength` - Visual strength indicator
- `PhoneInput` - International phone formatting
- `TimezoneSelect` - Searchable timezone picker
- `AvatarUpload` - Image upload with crop

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Invalid credentials | Inline error below form |
| Email already exists | Inline error on email field |
| Weak password | Inline error with requirements |
| Network error | Toast with retry option |
| Session expired | Redirect to login with message |
| Rate limited | Inline error with wait time |
| Email not verified | Banner with resend option |
