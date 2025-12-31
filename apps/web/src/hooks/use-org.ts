'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrgStore, type Organization } from '@/stores/org-store';
import { useUser } from './use-user';
import { createClient } from '@/lib/supabase/client';
import { createOrgId, type OrgRole } from '@haunt/shared';

interface OrgData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface MembershipData {
  role: string;
  organizations: OrgData | null;
}

/**
 * Hook to manage the current organization context.
 * Fetches user's organizations and syncs with URL params.
 */
export function useOrg() {
  const { user } = useUser();
  const params = useParams();
  const {
    currentOrg,
    organizations,
    isLoading,
    setCurrentOrg,
    setOrganizations,
    setLoading,
  } = useOrgStore();

  const orgIdParam = (params as { orgId?: string } | null)?.orgId;

  // Fetch user's organizations
  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrg(null);
      setLoading(false);
      return;
    }

    async function fetchOrganizations() {
      const supabase = createClient();
      
      // Fetch memberships with org data
      const { data: memberships, error } = await supabase
        .from('org_memberships')
        .select(`
          role,
          organizations (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('user_id', user?.id ?? '')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching organizations:', error);
        setLoading(false);
        return;
      }

      const orgs: Organization[] = ((memberships || []) as unknown as MembershipData[])
        .filter((m): m is MembershipData & { organizations: OrgData } => m.organizations !== null)
        .map((m) => {
          const org: Organization = {
            id: createOrgId(m.organizations.id),
            name: m.organizations.name,
            slug: m.organizations.slug,
            role: m.role as OrgRole,
          };
          if (m.organizations.logo_url) {
            org.logoUrl = m.organizations.logo_url;
          }
          return org;
        });

      setOrganizations(orgs);
      setLoading(false);
    }

    fetchOrganizations();
  }, [user, setOrganizations, setCurrentOrg, setLoading]);

  // Sync current org with URL
  useEffect(() => {
    if (isLoading || organizations.length === 0) return;

    if (orgIdParam) {
      const org = organizations.find((o) => o.id === orgIdParam || o.slug === orgIdParam);
      if (org) {
        setCurrentOrg(org);
      } else if (organizations[0]) {
        // Invalid org in URL, redirect to first org
        window.location.href = `/${organizations[0].slug}`;
      }
    } else if (currentOrg && !organizations.find((o) => o.id === currentOrg.id)) {
      // Current org no longer valid
      setCurrentOrg(organizations[0] ?? null);
    } else if (!currentOrg && organizations.length > 0) {
      // No current org, set to first
      setCurrentOrg(organizations[0] ?? null);
    }
  }, [orgIdParam, organizations, currentOrg, isLoading, setCurrentOrg]);

  const switchOrg = (org: Organization) => {
    setCurrentOrg(org);
    window.location.href = `/${org.slug}`;
  };

  return {
    currentOrg,
    organizations,
    isLoading,
    switchOrg,
  };
}
