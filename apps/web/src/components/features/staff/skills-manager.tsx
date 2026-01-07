'use client';

import { AlertCircle, Plus, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { addStaffSkill, getStaffSkills, removeStaffSkill, type StaffSkill } from '@/lib/api/client';

interface SkillsManagerProps {
  orgId: string;
  staffId: string;
}

// Common skills for haunted attractions
const SUGGESTED_SKILLS = [
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
  'Crowd Control',
  'Set Construction',
  'Prop Making',
  'Voice Acting',
  'Special Effects',
];

function SkillsManagerSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SkillLevelStars({ level }: { level: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= level ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export function SkillsManager({ orgId, staffId }: SkillsManagerProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<StaffSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add skill dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<string>('3');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Remove skill dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [skillToRemove, setSkillToRemove] = useState<StaffSkill | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  async function fetchSkills() {
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await getStaffSkills(orgId, staffId);

    if (apiError) {
      setError(apiError.message || 'Failed to load skills');
    } else if (data) {
      setSkills(data.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchSkills();
  }, []);

  function openAddDialog(skillName?: string) {
    setNewSkillName(skillName || '');
    setNewSkillLevel('3');
    setAddError(null);
    setAddDialogOpen(true);
  }

  async function handleAddSkill() {
    if (!newSkillName.trim()) {
      setAddError('Skill name is required');
      return;
    }

    const level = parseInt(newSkillLevel, 10);
    if (Number.isNaN(level) || level < 1 || level > 5) {
      setAddError('Level must be between 1 and 5');
      return;
    }

    setAddLoading(true);
    setAddError(null);

    const { data, error: apiError } = await addStaffSkill(orgId, staffId, {
      skill: newSkillName.trim(),
      level,
    });

    if (apiError) {
      setAddError(apiError.message || 'Failed to add skill');
      setAddLoading(false);
      return;
    }

    // Update local state with new skill
    if (data) {
      setSkills((prev) => [...prev, data]);
    }

    setAddLoading(false);
    setAddDialogOpen(false);
    setNewSkillName('');
    setNewSkillLevel('3');
    router.refresh();
  }

  function openRemoveDialog(skill: StaffSkill) {
    setSkillToRemove(skill);
    setRemoveError(null);
    setRemoveDialogOpen(true);
  }

  async function handleRemoveSkill() {
    if (!skillToRemove?.id) {
      return;
    }

    setRemoveLoading(true);
    setRemoveError(null);

    const { error: apiError } = await removeStaffSkill(orgId, staffId, skillToRemove.id);

    if (apiError) {
      setRemoveError(apiError.message || 'Failed to remove skill');
      setRemoveLoading(false);
      return;
    }

    // Update local state
    setSkills((prev) => prev.filter((s) => s.id !== skillToRemove.id));

    setRemoveLoading(false);
    setRemoveDialogOpen(false);
    setSkillToRemove(null);
    router.refresh();
  }

  // Get skills that haven't been added yet
  const currentSkillNames = skills.map((s) => s.skill.toLowerCase());
  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (skill) => !currentSkillNames.includes(skill.toLowerCase())
  );

  if (loading) {
    return <SkillsManagerSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading skills</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Current Skills ({skills.length})</CardTitle>
            <CardDescription>
              Skills assigned to this staff member. Click to remove.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id || skill.skill}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{skill.skill}</span>
                      <SkillLevelStars level={skill.level} />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => openRemoveDialog(skill)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove {skill.skill}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Add Skill</CardTitle>
            <CardDescription>Select a suggested skill or add a custom one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick add suggestions */}
            {availableSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => openAddDialog(skill)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Custom skill button */}
            <Button variant="outline" className="w-full" onClick={() => openAddDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Skill
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Skill Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>
              Add a new skill with a proficiency level (1-5 stars).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {addError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {addError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., Improvisation, Acting, Makeup"
                disabled={addLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-level">Proficiency Level</Label>
              <Select value={newSkillLevel} onValueChange={setNewSkillLevel} disabled={addLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Basic</SelectItem>
                  <SelectItem value="3">3 - Intermediate</SelectItem>
                  <SelectItem value="4">4 - Advanced</SelectItem>
                  <SelectItem value="5">5 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={addLoading || !newSkillName.trim()}>
              {addLoading ? 'Adding...' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Skill Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">{skillToRemove?.skill}</span> from this staff member?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {removeError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {removeError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={removeLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveSkill} disabled={removeLoading}>
              {removeLoading ? 'Removing...' : 'Remove Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
