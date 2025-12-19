---
allowed-tools: [Read, Write, Edit, Glob, Grep, TodoWrite, Task]
description: "Create implementation plans using the standard plan template"
---

# /plan - Implementation Planning Agent

## Purpose
Generate structured implementation plans using the project's standard plan template. Always creates plans in `.claude/plans/` directory with auto-generated filenames.

## Usage
```
/plan [feature-or-task] [--phases 2-8]
```

## Arguments
- `feature-or-task` - Description of what to plan (used to auto-generate filename)
- `--phases` - Number of phases (default: 4, range: 2-8)

## Auto-Generated Filenames
Converts task description to kebab-case filename:
- "implement ticketing module" → `implement-ticketing-module.md`
- "fix auth bug" → `fix-auth-bug.md`
- "F8 Ticketing" → `f8-ticketing.md`

## Execution Steps

1. **Read the plan template**:
   ```
   Read @.claude/templates/plan-template.md
   ```

2. **Analyze the feature/task**:
   - Understand scope and complexity
   - Identify affected modules (from feature-roadmap.md)
   - Determine appropriate phase count

3. **Generate plan** using template structure:
   - Quick Start section for session continuity
   - Progress Overview with realistic phases
   - Project Objectives with measurable criteria
   - Risk tracking table
   - Detailed phases with agent assignments
   - Key Files & Components tracking

4. **Write to `.claude/plans/[auto-generated-name].md`**

## Agent Assignments for Haunt Platform

Based on task type, assign agents:
- **Backend/API tasks**: Use `/sc:implement --type api`
- **Frontend/UI tasks**: Use `/frontend` agent
- **Database tasks**: Manual SQL migrations
- **Testing tasks**: Use `/sc:test`
- **Documentation**: Use `/sc:document`

## Phase Complexity Guide
- **2 phases**: Simple bug fixes, small features
- **3 phases**: Standard features (Discovery → Implementation → Testing)
- **4 phases**: Medium features (Analysis → Design → Implementation → Validation)
- **5-6 phases**: Large features with migrations
- **7-8 phases**: Epic-level work spanning multiple modules

## Template Sections (Always Include)

1. **Quick Start for Next Session** - Critical for session continuity
2. **Progress Overview** - Phase table with status tracking
3. **Project Objectives** - Goals and success criteria
4. **Risk & Blockers** - Track issues proactively
5. **Phase Details** - Tasks with agent assignments
6. **Key Files** - Modified files tracking
7. **Session History** - Document what was done each session

## Examples
```
/plan implement F8 Ticketing module --phases 5
# Creates: .claude/plans/implement-f8-ticketing-module.md

/plan add virtual queue feature
# Creates: .claude/plans/add-virtual-queue-feature.md

/plan fix auth redirect bug --phases 2
# Creates: .claude/plans/fix-auth-redirect-bug.md
```

## Integration
- References `@.claude/plans/feature-roadmap.md` for dependencies
- Uses ERD template for database design phases
- Uses API template for endpoint design phases
- Coordinates with `/sc:workflow` for complex orchestration
