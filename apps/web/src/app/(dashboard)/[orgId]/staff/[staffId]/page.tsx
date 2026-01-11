import { Award, Clock, FileText, Settings } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { CertificationList } from '@/components/features/staff/certification-list';
import { SkillBadges } from '@/components/features/staff/skill-badges';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStaffMember, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Staff Profile',
};

interface StaffDetailPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { orgId: orgIdentifier, staffId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Fetch staff data from API
  const { data: staffData, error } = await getStaffMember(orgId, staffId);

  // Fallback data if API fails
  const staff = staffData ?? {
    id: staffId,
    user: { first_name: 'Unknown', last_name: 'User', email: 'unknown@example.com' },
    role: 'actor' as const,
    status: 'active' as const,
    employment_type: null,
    hire_date: null,
    skills: [],
    certifications: [],
  };

  const staffName = staff.user
    ? `${staff.user.first_name || ''} ${staff.user.last_name || ''}`.trim() || 'Unknown'
    : 'Unknown';
  const staffEmail = staff.user?.email || 'No email';
  const skills = staff.skills?.map((s: any) => s.name || s.skill) || [];
  const certifications =
    staff.certifications?.map((c: any) => ({
      name: c.type || c.name,
      expiresAt: c.expires_at || c.expiresAt,
    })) || [];

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {staffName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{staffName}</h1>
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{staffEmail}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href={`/${orgIdentifier}/staff/${staffId}/edit`}>
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </a>
        </Button>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <StaggerContainer className="grid gap-4 md:grid-cols-3" staggerDelay={0.06} delayChildren={0.1}>
              <StaggerItem>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{staff.role}</div>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hire Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : 'Not set'}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Employment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold capitalize">
                      {staff.employment_type?.replace('_', ' ') || 'Not set'}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            {/* Quick Info */}
            <StaggerContainer className="grid gap-4 md:grid-cols-2" staggerDelay={0.08} delayChildren={0.2}>
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkillBadges skills={skills} />
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CertificationList certifications={certifications} />
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="skills">
            <FadeIn delay={0.05}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Skills & Abilities</CardTitle>
                      <CardDescription>Manage skills for this staff member.</CardDescription>
                    </div>
                    <Button asChild>
                      <a href={`/${orgIdentifier}/staff/${staffId}/skills`}>
                        <Award className="mr-2 h-4 w-4" />
                        Manage Skills
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <SkillBadges skills={skills} />
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          <TabsContent value="certifications">
            <FadeIn delay={0.05}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Certifications</CardTitle>
                      <CardDescription>Track certifications and expiry dates.</CardDescription>
                    </div>
                    <Button asChild>
                      <a href={`/${orgIdentifier}/staff/${staffId}/certifications`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Manage Certifications
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CertificationList certifications={certifications} />
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          <TabsContent value="time">
            <FadeIn delay={0.05}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Time Tracking</CardTitle>
                      <CardDescription>View and manage time entries.</CardDescription>
                    </div>
                    <Button asChild>
                      <a href={`/${orgIdentifier}/staff/${staffId}/time`}>
                        <Clock className="mr-2 h-4 w-4" />
                        View All Time
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent time entries.</p>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
