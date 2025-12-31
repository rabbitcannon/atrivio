import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, Award, Clock, FileText } from 'lucide-react';
import { SkillBadges } from '@/components/features/staff/skill-badges';
import { CertificationList } from '@/components/features/staff/certification-list';

export const metadata: Metadata = {
  title: 'Staff Profile',
};

interface StaffDetailPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { orgId, staffId } = await params;

  // TODO: Fetch staff data
  const staff = {
    id: staffId,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-0123',
    role: 'actor',
    status: 'active',
    hireDate: '2024-01-15',
    skills: ['Improvisation', 'Makeup', 'Stunts'],
    certifications: [
      { name: 'First Aid', expiresAt: '2025-06-01' },
      { name: 'CPR', expiresAt: '2025-03-15' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {staff.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{staff.name}</h1>
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{staff.email}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href={`/${orgId}/staff/${staffId}/edit`}>
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </a>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{staff.role}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hire Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(staff.hireDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{staff.phone}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillBadges skills={staff.skills} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CertificationList certifications={staff.certifications} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills & Abilities</CardTitle>
                  <CardDescription>Manage skills for this staff member.</CardDescription>
                </div>
                <Button asChild>
                  <a href={`/${orgId}/staff/${staffId}/skills`}>
                    <Award className="mr-2 h-4 w-4" />
                    Manage Skills
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SkillBadges skills={staff.skills} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Certifications</CardTitle>
                  <CardDescription>Track certifications and expiry dates.</CardDescription>
                </div>
                <Button asChild>
                  <a href={`/${orgId}/staff/${staffId}/certifications`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Certifications
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CertificationList certifications={staff.certifications} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Time Tracking</CardTitle>
                  <CardDescription>View and manage time entries.</CardDescription>
                </div>
                <Button asChild>
                  <a href={`/${orgId}/staff/${staffId}/time`}>
                    <Clock className="mr-2 h-4 w-4" />
                    View All Time
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No recent time entries.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
