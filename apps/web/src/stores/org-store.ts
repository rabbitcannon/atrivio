import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrgId, OrgRole } from '@haunt/shared';

export interface Organization {
  id: OrgId;
  name: string;
  slug: string;
  logoUrl?: string;
  role: OrgRole;
}

interface OrgState {
  currentOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrg: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      currentOrg: null,
      organizations: [],
      isLoading: true,
      setCurrentOrg: (currentOrg) => set({ currentOrg }),
      setOrganizations: (organizations) => set({ organizations }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ currentOrg: null, organizations: [], isLoading: false }),
    }),
    {
      name: 'org-storage',
      partialize: (state) => ({ currentOrg: state.currentOrg }),
    }
  )
);
