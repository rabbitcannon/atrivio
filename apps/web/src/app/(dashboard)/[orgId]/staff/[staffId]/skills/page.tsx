import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Skills',
};

interface SkillsPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

const allSkills = [
  'Improvisation',
  'Makeup',
  'Stunts',
  'Costume Design',
  'Sound Effects',
  'Lighting',
  'Acting',
  'Scaring',
  'First Aid',
  'Customer Service',
];

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { orgId: orgIdentifier, staffId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // TODO: Fetch actual skills
  const currentSkills = ['Improvisation', 'Makeup', 'Stunts'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgIdentifier}/staff/${staffId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to staff profile</span>
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Manage skills for this staff member.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Skills</CardTitle>
            <CardDescription>Skills assigned to this staff member.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Skill</CardTitle>
            <CardDescription>Select skills to add.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allSkills
                .filter((skill) => !currentSkills.includes(skill))
                .map((skill) => (
                  <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {skill}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
