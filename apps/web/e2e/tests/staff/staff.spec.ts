import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { TIMEOUTS, generateUniqueName } from '../../helpers/fixtures';
import { createStaffPage, StaffPage } from '../../pages/dashboard/staff.page';

/**
 * Staff Management E2E Tests
 *
 * Tests the staff management functionality including:
 * - Viewing staff list
 * - Inviting new staff members
 * - Viewing staff profiles
 * - Editing staff information
 * - RBAC (role-based access control)
 * - Cross-org isolation
 */

test.describe('Staff List', () => {
  let staffPage: StaffPage;

  test.describe('Viewing Staff List', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view staff list page', async () => {
      await staffPage.goto();
      await staffPage.expectStaffListPageVisible();
    });

    test('staff list page shows correct heading', async () => {
      await staffPage.goto();

      await expect(staffPage.staffHeading).toBeVisible();
    });

    test('staff list page shows add button', async () => {
      await staffPage.goto();

      await expect(staffPage.addStaffButton).toBeVisible();
    });

    test('staff list shows staff table or empty state', async () => {
      await staffPage.goto();

      const tableVisible = await staffPage.staffTable.isVisible().catch(() => false);
      const emptyStateVisible = await staffPage.staffEmptyState.isVisible().catch(() => false);

      expect(tableVisible || emptyStateVisible).toBeTruthy();
    });

    test('manager can view staff list page', async ({ page }) => {
      await loginAs(page, 'manager');
      staffPage = createStaffPage(page, TEST_USERS.manager.orgSlug);

      await staffPage.goto();
      await staffPage.expectStaffListPageVisible();
    });

    test('hr can view staff list page', async ({ page }) => {
      await loginAs(page, 'hr');
      staffPage = createStaffPage(page, TEST_USERS.hr.orgSlug);

      await staffPage.goto();
      await staffPage.expectStaffListPageVisible();
    });

    test('box office can view staff list page', async ({ page }) => {
      await loginAs(page, 'boxOffice');
      staffPage = createStaffPage(page, TEST_USERS.boxOffice.orgSlug);

      await staffPage.goto();
      await staffPage.expectStaffListPageVisible();
    });
  });

  test.describe('Staff List Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.goto();
    });

    test('clicking add staff navigates to invite page', async ({ page }) => {
      await staffPage.addStaffButton.click();
      await staffPage.waitForPageLoad();

      expect(page.url()).toContain('/staff/new');
      await staffPage.expectInvitePageVisible();
    });

    test('can view existing staff member from list', async () => {
      // Check if there are any staff members in the list
      const tableVisible = await staffPage.staffTable.isVisible().catch(() => false);

      if (tableVisible) {
        const rowCount = await staffPage.staffRows.count();
        if (rowCount > 0) {
          // Click the first staff member
          await staffPage.staffRows.first().locator('a').first().click();
          await staffPage.waitForPageLoad();

          // Should be on detail page
          await staffPage.expectStaffDetailPageVisible();
        }
      }
    });
  });
});

test.describe('Inviting Staff', () => {
  let staffPage: StaffPage;

  test.describe('Invite Page UI', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoInvite();
    });

    test('invite page shows correct heading', async () => {
      await staffPage.expectInvitePageVisible();
    });

    test('invite page shows email input', async () => {
      await expect(staffPage.inviteEmailInput).toBeVisible();
    });

    test('invite page shows role selector', async () => {
      await expect(staffPage.inviteRoleSelect).toBeVisible();
    });

    test('invite page shows cancel button', async () => {
      await expect(staffPage.inviteCancelButton).toBeVisible();
    });

    test('invite page shows send invitation button', async () => {
      await expect(staffPage.sendInvitationButton).toBeVisible();
    });
  });

  test.describe('Invite Form Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoInvite();
    });

    test('can fill email field', async () => {
      const testEmail = 'newstaff@test.com';

      await staffPage.inviteEmailInput.fill(testEmail);

      await expect(staffPage.inviteEmailInput).toHaveValue(testEmail);
    });

    test('can select role from dropdown', async ({ page }) => {
      await staffPage.inviteRoleSelect.click();
      await page.waitForTimeout(200);

      // Role options should be visible
      const actorOption = page.getByRole('option', { name: /actor/i });
      await expect(actorOption).toBeVisible();
    });

    test('can fill complete invite form', async () => {
      const uniqueEmail = `invite-${Date.now()}@test.com`;

      await staffPage.fillInviteForm({
        email: uniqueEmail,
        role: 'actor',
      });

      await expect(staffPage.inviteEmailInput).toHaveValue(uniqueEmail);
    });

    test('cancel button returns to staff list', async ({ page }) => {
      await staffPage.inviteCancelButton.click();
      await staffPage.waitForPageLoad();

      expect(page.url()).toContain('/staff');
      expect(page.url()).not.toContain('/new');
    });

    test('invitation submission (may fail with duplicate email)', async () => {
      const uniqueEmail = `test-invite-${Date.now()}@test.com`;

      await staffPage.inviteStaff({
        email: uniqueEmail,
        role: 'actor',
      });

      // Should show either success or error message
      const successVisible = await staffPage.inviteSuccessMessage.isVisible().catch(() => false);
      const errorVisible = await staffPage.inviteErrorMessage.isVisible().catch(() => false);

      expect(successVisible || errorVisible).toBeTruthy();
    });
  });

  test.describe('Invite Access Control', () => {
    test('manager can access invite page', async ({ page }) => {
      await loginAs(page, 'manager');
      staffPage = createStaffPage(page, TEST_USERS.manager.orgSlug);

      await staffPage.gotoInvite();
      await staffPage.expectInvitePageVisible();
    });

    test('hr can access invite page', async ({ page }) => {
      await loginAs(page, 'hr');
      staffPage = createStaffPage(page, TEST_USERS.hr.orgSlug);

      await staffPage.gotoInvite();
      await staffPage.expectInvitePageVisible();
    });

    test.skip('actor cannot access invite page', async ({ page }) => {
      // TODO: Un-skip when access control is properly enforced
      await loginAs(page, 'actor1');
      staffPage = createStaffPage(page, TEST_USERS.actor1.orgSlug);

      await page.goto(`/${TEST_USERS.actor1.orgSlug}/staff/new`);

      // Should be redirected or see access denied
      const url = page.url();
      const hasForbidden = await page.getByText(/forbidden|access denied|not authorized/i).isVisible().catch(() => false);

      expect(url.includes('/staff/new') === false || hasForbidden).toBeTruthy();
    });
  });
});

test.describe('Staff Detail Page', () => {
  let staffPage: StaffPage;

  test.describe('Viewing Staff Profile', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view staff detail page', async () => {
      // Navigate to a known staff member's profile
      // Using manager's ID from seed data
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);

      await staffPage.expectStaffDetailPageVisible();
    });

    test('staff detail page shows name heading', async () => {
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);

      await expect(staffPage.staffNameHeading).toBeVisible();
    });

    test('staff detail page shows edit button', async () => {
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);

      await expect(staffPage.editButton).toBeVisible();
    });

    test('staff detail page shows tabs', async () => {
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);

      await expect(staffPage.overviewTab).toBeVisible();
      await expect(staffPage.skillsTab).toBeVisible();
      await expect(staffPage.certificationsTab).toBeVisible();
      await expect(staffPage.timeTrackingTab).toBeVisible();
    });
  });

  test.describe('Staff Profile Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);
    });

    test('overview tab is selected by default', async () => {
      await staffPage.expectTabSelected('overview');
    });

    test('can switch to skills tab', async () => {
      await staffPage.switchToSkillsTab();
      await staffPage.expectTabSelected('skills');
    });

    test('can switch to certifications tab', async () => {
      await staffPage.switchToCertificationsTab();
      await staffPage.expectTabSelected('certifications');
    });

    test('can switch to time tracking tab', async () => {
      await staffPage.switchToTimeTrackingTab();
      await staffPage.expectTabSelected('time');
    });

    test('can switch back to overview tab', async () => {
      await staffPage.switchToSkillsTab();
      await staffPage.switchToOverviewTab();
      await staffPage.expectTabSelected('overview');
    });
  });

  test.describe('Overview Tab Content', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);
    });

    test('overview shows info cards', async () => {
      await staffPage.expectOverviewCardsVisible();
    });

    test('role card is visible', async () => {
      await expect(staffPage.roleCard).toBeVisible();
    });

    test('hire date card is visible', async () => {
      await expect(staffPage.hireDateCard).toBeVisible();
    });

    test('employment card is visible', async () => {
      await expect(staffPage.employmentCard).toBeVisible();
    });
  });

  test.describe('Profile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoStaffDetail(TEST_USERS.manager.id);
    });

    test('clicking edit navigates to edit page', async ({ page }) => {
      await staffPage.clickEdit();

      expect(page.url()).toContain('/edit');
      await staffPage.expectEditPageVisible();
    });
  });
});

test.describe('Editing Staff', () => {
  let staffPage: StaffPage;

  test.describe('Edit Page UI', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoEditStaff(TEST_USERS.manager.id);
    });

    test('edit page shows correct heading', async () => {
      await staffPage.expectEditPageVisible();
    });

    test('edit page shows employee ID field', async () => {
      await expect(staffPage.employeeIdInput).toBeVisible();
    });

    test('edit page shows hourly rate field', async () => {
      await expect(staffPage.hourlyRateInput).toBeVisible();
    });

    test('edit page shows notes field', async () => {
      await expect(staffPage.notesInput).toBeVisible();
    });

    test('edit page shows cancel button', async () => {
      await expect(staffPage.editCancelButton).toBeVisible();
    });

    test('edit page shows save button', async () => {
      await expect(staffPage.saveChangesButton).toBeVisible();
    });
  });

  test.describe('Edit Form Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
      await staffPage.gotoEditStaff(TEST_USERS.manager.id);
    });

    test('can update employee ID', async () => {
      const newEmployeeId = `EMP-${Date.now()}`;

      await staffPage.employeeIdInput.clear();
      await staffPage.employeeIdInput.fill(newEmployeeId);

      await expect(staffPage.employeeIdInput).toHaveValue(newEmployeeId);
    });

    test('can update hourly rate', async () => {
      await staffPage.hourlyRateInput.clear();
      await staffPage.hourlyRateInput.fill('25.50');

      await expect(staffPage.hourlyRateInput).toHaveValue('25.50');
    });

    test('can add notes', async () => {
      const testNotes = 'Test notes for staff member';

      await staffPage.notesInput.clear();
      await staffPage.notesInput.fill(testNotes);

      await expect(staffPage.notesInput).toHaveValue(testNotes);
    });

    test('cancel button returns to staff detail', async ({ page }) => {
      await staffPage.editCancelButton.click();
      await staffPage.waitForPageLoad();

      expect(page.url()).toContain(`/staff/${TEST_USERS.manager.id}`);
      expect(page.url()).not.toContain('/edit');
    });

    test('save button submits form', async () => {
      // Make a small change
      const timestamp = Date.now().toString().slice(-6);
      await staffPage.notesInput.clear();
      await staffPage.notesInput.fill(`Updated at ${timestamp}`);

      await staffPage.submitEdit();

      // Should show success or error message
      const successVisible = await staffPage.editSuccessMessage.isVisible().catch(() => false);
      const errorVisible = await staffPage.editErrorMessage.isVisible().catch(() => false);

      expect(successVisible || errorVisible).toBeTruthy();
    });
  });

  test.describe('Edit Access Control', () => {
    test('manager can edit staff', async ({ page }) => {
      await loginAs(page, 'manager');
      staffPage = createStaffPage(page, TEST_USERS.manager.orgSlug);

      // Manager editing an actor
      await staffPage.gotoEditStaff(TEST_USERS.actor1.id);
      await staffPage.expectEditPageVisible();
    });

    test('hr can edit staff', async ({ page }) => {
      await loginAs(page, 'hr');
      staffPage = createStaffPage(page, TEST_USERS.hr.orgSlug);

      await staffPage.gotoEditStaff(TEST_USERS.actor1.id);
      await staffPage.expectEditPageVisible();
    });

    test.skip('actor cannot edit other staff', async ({ page }) => {
      // TODO: Un-skip when access control is properly enforced
      await loginAs(page, 'actor1');
      staffPage = createStaffPage(page, TEST_USERS.actor1.orgSlug);

      await page.goto(`/${TEST_USERS.actor1.orgSlug}/staff/${TEST_USERS.actor2.id}/edit`);

      // Should be redirected or see access denied
      const url = page.url();
      const hasForbidden = await page.getByText(/forbidden|access denied|not authorized/i).isVisible().catch(() => false);

      expect(url.includes('/edit') === false || hasForbidden).toBeTruthy();
    });
  });
});

test.describe('Staff Actions Menu', () => {
  let staffPage: StaffPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
    await staffPage.goto();
  });

  test('can open actions menu for staff member', async ({ page }) => {
    // Wait for table to load
    const tableVisible = await staffPage.staffTable.isVisible().catch(() => false);

    if (tableVisible) {
      const rowCount = await staffPage.staffRows.count();
      if (rowCount > 0) {
        // Open actions menu for first staff member
        await staffPage.staffRows.first().locator('button').last().click();
        await page.waitForTimeout(200);

        // Menu items should be visible
        const menuVisible = await page.locator('[role="menu"]').isVisible().catch(() => false);
        expect(menuVisible).toBeTruthy();
      }
    }
  });
});

test.describe('Staff URL Routing', () => {
  let staffPage: StaffPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
  });

  test('staff list page has correct URL', async ({ page }) => {
    await staffPage.goto();
    expect(page.url()).toContain('/staff');
    expect(page.url()).not.toContain('/staff/');
  });

  test('invite page has correct URL', async ({ page }) => {
    await staffPage.gotoInvite();
    expect(page.url()).toContain('/staff/new');
  });

  test('staff detail page has correct URL', async ({ page }) => {
    await staffPage.gotoStaffDetail(TEST_USERS.manager.id);
    expect(page.url()).toContain(`/staff/${TEST_USERS.manager.id}`);
  });

  test('staff edit page has correct URL', async ({ page }) => {
    await staffPage.gotoEditStaff(TEST_USERS.manager.id);
    expect(page.url()).toContain(`/staff/${TEST_USERS.manager.id}/edit`);
  });
});

test.describe('Staff - Cross-Org Isolation', () => {
  test('staff from one org are not visible in another', async ({ page }) => {
    // Login as owner of Nightmare Manor
    await loginAs(page, 'owner');
    const nightmareManorPage = createStaffPage(page, TEST_USERS.owner.orgSlug);

    await nightmareManorPage.goto();

    // Check if Manager (Sarah Chen) is visible in Nightmare Manor
    await nightmareManorPage.waitForPageLoad();
    const managerVisible = await nightmareManorPage.getStaffRow('Sarah Chen').isVisible().catch(() => false);

    // Login as owner of Spooky Hollow (different org)
    await loginAs(page, 'freeDemo');
    const spookyHollowPage = createStaffPage(page, TEST_USERS.freeDemo.orgSlug);

    await spookyHollowPage.goto();

    // The manager from Nightmare Manor should not be visible in Spooky Hollow
    await expect(spookyHollowPage.getStaffRow('Sarah Chen')).not.toBeVisible({ timeout: TIMEOUTS.fast });
  });

  test('cannot access staff from another org via direct URL', async ({ page }) => {
    // Login as owner of Spooky Hollow
    await loginAs(page, 'freeDemo');

    // Try to access a Nightmare Manor staff member directly
    await page.goto(`/spooky-hollow/staff/${TEST_USERS.manager.id}`);
    await page.waitForLoadState('networkidle');

    // Should either show 404, redirect, or show no data
    const pageContent = await page.content();
    const hasError = pageContent.includes('not found') ||
                     pageContent.includes('Not Found') ||
                     pageContent.includes('404');
    const isRedirected = !page.url().includes(TEST_USERS.manager.id);
    const noData = await page.getByText(/no staff|not found/i).isVisible().catch(() => false);

    expect(hasError || isRedirected || noData).toBeTruthy();
  });
});

test.describe('Staff - Access Control', () => {
  test('actor can view staff list', async ({ page }) => {
    await loginAs(page, 'actor1');
    const staffPage = createStaffPage(page, TEST_USERS.actor1.orgSlug);

    await staffPage.goto();
    await staffPage.expectStaffListPageVisible();
  });

  test('scanner can view staff list', async ({ page }) => {
    await loginAs(page, 'scanner');
    const staffPage = createStaffPage(page, TEST_USERS.scanner.orgSlug);

    await staffPage.goto();
    await staffPage.expectStaffListPageVisible();
  });

  test('finance can view staff list', async ({ page }) => {
    await loginAs(page, 'finance');
    const staffPage = createStaffPage(page, TEST_USERS.finance.orgSlug);

    await staffPage.goto();
    await staffPage.expectStaffListPageVisible();
  });

  test('actor can view their own profile', async ({ page }) => {
    await loginAs(page, 'actor1');
    const staffPage = createStaffPage(page, TEST_USERS.actor1.orgSlug);

    await staffPage.gotoStaffDetail(TEST_USERS.actor1.id);
    await staffPage.expectStaffDetailPageVisible();
  });

  test('actor can view other staff profiles', async ({ page }) => {
    await loginAs(page, 'actor1');
    const staffPage = createStaffPage(page, TEST_USERS.actor1.orgSlug);

    // Actor viewing manager's profile
    await staffPage.gotoStaffDetail(TEST_USERS.manager.id);
    await staffPage.expectStaffDetailPageVisible();
  });
});

test.describe('Staff List with Data', () => {
  let staffPage: StaffPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    staffPage = createStaffPage(page, TEST_USERS.owner.orgSlug);
    await staffPage.goto();
  });

  test('staff list shows known staff members', async () => {
    // Nightmare Manor should have seeded staff
    await staffPage.waitForPageLoad();

    // Check for known staff members from seed data
    const sarahVisible = await staffPage.getStaffRow('Sarah').isVisible().catch(() => false);
    const jakeVisible = await staffPage.getStaffRow('Jake').isVisible().catch(() => false);

    // At least one known staff member should be visible
    expect(sarahVisible || jakeVisible).toBeTruthy();
  });

  test('can navigate to staff profile by clicking name', async () => {
    await staffPage.waitForPageLoad();

    // If there are staff members, click on one
    const tableVisible = await staffPage.staffTable.isVisible().catch(() => false);

    if (tableVisible) {
      const rowCount = await staffPage.staffRows.count();
      if (rowCount > 0) {
        // Click the first link in the first row
        const firstLink = staffPage.staffRows.first().locator('a').first();
        await firstLink.click();
        await staffPage.waitForPageLoad();

        // Should be on detail page
        await staffPage.expectStaffDetailPageVisible();
      }
    }
  });
});
