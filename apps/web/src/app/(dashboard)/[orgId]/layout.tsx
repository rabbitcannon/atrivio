import type { Metadata } from 'next';

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export async function generateMetadata(_props: OrgLayoutProps): Promise<Metadata> {
  // In a real app, fetch org name from database using:
  // const { orgId } = await _props.params;
  return {
    title: {
      default: 'Dashboard',
      template: '%s | Haunt Platform',
    },
  };
}

export default async function OrgLayout({ children }: Omit<OrgLayoutProps, 'params'>) {
  // The org context is managed client-side via useOrg hook
  // This layout just provides the structure
  return <>{children}</>;
}
