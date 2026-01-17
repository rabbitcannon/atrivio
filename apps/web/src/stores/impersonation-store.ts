import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ImpersonatedUser {
  id: string;
  email: string;
  name: string;
}

interface ImpersonationState {
  // Whether we're currently impersonating someone
  isImpersonating: boolean;
  // The impersonated user's info
  impersonatedUser: ImpersonatedUser | null;
  // The original admin session (to restore when ending impersonation)
  originalAdminSession: Session | null;
  // The original admin user
  originalAdminUser: User | null;
  // When the impersonation expires
  expiresAt: string | null;

  // Actions
  startImpersonation: (
    impersonatedUser: ImpersonatedUser,
    adminSession: Session,
    adminUser: User,
    expiresAt: string
  ) => void;
  endImpersonation: () => {
    adminSession: Session | null;
    adminUser: User | null;
  };
  clearImpersonation: () => void;
}

export const useImpersonationStore = create<ImpersonationState>()(
  persist(
    (set, get) => ({
      isImpersonating: false,
      impersonatedUser: null,
      originalAdminSession: null,
      originalAdminUser: null,
      expiresAt: null,

      startImpersonation: (impersonatedUser, adminSession, adminUser, expiresAt) => {
        set({
          isImpersonating: true,
          impersonatedUser,
          originalAdminSession: adminSession,
          originalAdminUser: adminUser,
          expiresAt,
        });
      },

      endImpersonation: () => {
        const { originalAdminSession, originalAdminUser } = get();
        set({
          isImpersonating: false,
          impersonatedUser: null,
          originalAdminSession: null,
          originalAdminUser: null,
          expiresAt: null,
        });
        return {
          adminSession: originalAdminSession,
          adminUser: originalAdminUser,
        };
      },

      clearImpersonation: () => {
        set({
          isImpersonating: false,
          impersonatedUser: null,
          originalAdminSession: null,
          originalAdminUser: null,
          expiresAt: null,
        });
      },
    }),
    {
      name: 'impersonation-storage',
      // Only persist essential fields
      partialize: (state) => ({
        isImpersonating: state.isImpersonating,
        impersonatedUser: state.impersonatedUser,
        originalAdminSession: state.originalAdminSession,
        originalAdminUser: state.originalAdminUser,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
