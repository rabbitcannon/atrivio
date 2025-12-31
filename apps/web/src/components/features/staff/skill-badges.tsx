import { Badge } from '@/components/ui/badge';

interface SkillBadgesProps {
  skills: string[];
  max?: number;
}

export function SkillBadges({ skills, max }: SkillBadgesProps) {
  const displaySkills = max ? skills.slice(0, max) : skills;
  const remaining = max ? skills.length - max : 0;

  if (skills.length === 0) {
    return <p className="text-sm text-muted-foreground">No skills assigned.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displaySkills.map((skill) => (
        <Badge key={skill} variant="secondary">
          {skill}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline">+{remaining} more</Badge>
      )}
    </div>
  );
}
