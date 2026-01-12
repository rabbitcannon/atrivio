/**
 * E2E Test Helpers
 *
 * Re-exports all helper modules for convenient imports.
 *
 * @example
 * ```ts
 * import { loginAs, TEST_USERS, TEST_ORGS, expectToast } from '../helpers';
 * ```
 */

// Authentication
export {
  loginAs,
  loginWithCredentials,
  logout,
  ensureLoggedOut,
  isLoggedIn,
  TEST_USERS,
  TEST_PASSWORD,
  type TestUserKey,
} from './auth';

// Fixtures
export {
  TEST_ORGS,
  TEST_ATTRACTIONS,
  TEST_SEASONS,
  ROUTES,
  STRIPE_TEST_CARDS,
  FEATURE_FLAGS,
  TIMEOUTS,
} from './fixtures';

// Selectors
export {
  byTestId,
  forms,
  nav,
  table,
  modal,
  toast,
  card,
  dropdown,
  loading,
  auth,
} from './selectors';

// Assertions
export {
  expectToast,
  expectRedirect,
  expectFormError,
  expectPageLoaded,
  expectVisible,
  expectNotVisible,
  expectUrl,
  expectHeading,
  expectButton,
  expectLink,
  expectTableRows,
  expectModalOpen,
  expectModalClosed,
  expectInputValue,
} from './assertions';
