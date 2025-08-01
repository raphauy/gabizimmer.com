# Single Workspace Optimization PRP

## Feature Overview
Transform the workspace selector to display differently when a user has only one workspace, showing it as a static display (name + avatar) instead of an interactive selector. Additionally, automatically redirect users with a single workspace from `/w` to `/w/[slug]`.

## Context & Research

### Current Implementation Analysis
The workspace selector (`/src/components/workspace-command-selector.tsx`) currently:
- Always renders as an interactive dropdown using shadcn/ui Command component
- Shows the same UI whether user has 1 or 100 workspaces
- No special handling for single workspace scenarios
- Used in both desktop and mobile layouts

### Key Files to Modify
1. `/src/components/workspace-command-selector.tsx` - Main selector component
2. `/src/app/w/page.tsx` - Workspace list page (needs redirect logic)
3. `/src/app/w/workspace-list.tsx` - Server component that fetches workspaces
4. `/src/components/workspace-avatar.tsx` - Already exists for displaying workspace image

### Data Flow
```
layout.tsx (fetches getUserWorkspaces)
  → passes to WorkspaceLayoutClient
    → passes to WorkspaceSidebar
      → renders WorkspaceSelector
```

### User Types & Edge Cases
1. **Regular users**: Can have 0, 1, or many workspaces
2. **Superadmins**: Always see ALL workspaces (never single workspace)
3. **New users**: Start with 0 workspaces
4. **After deletion**: User might go from 2 → 1 workspace

## Technical Implementation Blueprint

### Part 1: Single Workspace Display

```typescript
// Pseudocode for WorkspaceCommandSelector modification
if (userWorkspaces.length === 1 && !currentWorkspace) {
  // On /w or /w/settings - show as static display
  return <WorkspaceDisplay workspace={userWorkspaces[0].workspace} />
} else if (userWorkspaces.length === 1 && currentWorkspace) {
  // Inside a workspace - show as static display
  return <WorkspaceDisplay workspace={currentWorkspace} />
} else {
  // Multiple workspaces - show selector as normal
  return <CurrentSelectorImplementation />
}
```

### Part 2: Auto-redirect Logic

```typescript
// In /src/app/w/workspace-list.tsx
export async function WorkspaceList() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const userWorkspaces = await getUserWorkspaces(session.user.id)
  
  // NEW: Auto-redirect for single workspace
  if (userWorkspaces.length === 1) {
    redirect(`/w/${userWorkspaces[0].workspace.slug}`)
  }
  
  // Existing logic for 0 or multiple workspaces
  // ...
}
```

### Part 3: WorkspaceDisplay Component

Create a new display-only component:
```typescript
// New component for static display
interface WorkspaceDisplayProps {
  workspace: Workspace
  className?: string
}

export function WorkspaceDisplay({ workspace, className }: WorkspaceDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2 h-9 px-3", className)}>
      <WorkspaceAvatar workspace={workspace} size="sm" />
      <span className="font-medium truncate max-w-[150px]">
        {workspace.name}
      </span>
    </div>
  )
}
```

## Implementation Tasks

### Task 1: Create WorkspaceDisplay component
- Create new display-only component in workspace-command-selector.tsx
- Use existing WorkspaceAvatar component
- Match visual styling of current selector button
- Ensure responsive design works

### Task 2: Modify WorkspaceCommandSelector logic
- Add conditional rendering based on workspace count
- Maintain all existing props and callbacks
- Ensure mobile navigation still works
- Handle loading states appropriately

### Task 3: Implement auto-redirect in workspace list
- Add redirect logic to WorkspaceList component
- Use Next.js redirect() function for server-side redirect
- Ensure proper 307 status code for temporary redirect
- Handle edge cases (no workspaces, errors)

### Task 4: Update mobile navigation
- Ensure single workspace displays correctly in mobile sheet
- Test that navigation callbacks still work
- Verify visual consistency across breakpoints

### Task 5: Handle edge cases
- Test workspace deletion (2→1 workspaces)
- Test invitation acceptance (0→1 workspaces)
- Verify superadmin behavior unchanged
- Test navigation between pages

## Validation Gates

```bash
# 1. Type checking - MUST PASS
pnpm run typecheck

# 2. Linting - MUST PASS
pnpm run lint

# 3. Build validation - MUST PASS
pnpm run build

# 4. Manual testing checklist:
# - [ ] Single workspace shows as static display
# - [ ] Multiple workspaces show selector
# - [ ] Auto-redirect works from /w to /w/[slug]
# - [ ] Mobile navigation works correctly
# - [ ] Superadmins see selector (never single)
# - [ ] No console errors
# - [ ] Smooth transitions

# 5. Component visual regression
# - [ ] Desktop: Single workspace display matches selector height
# - [ ] Mobile: Display fits properly in sheet
# - [ ] Dark mode: Colors work correctly
```

## Error Handling Strategy

1. **Redirect failures**: If redirect fails, show workspace list as fallback
2. **Missing workspace data**: Show loading skeleton, then error state
3. **Invalid workspace slug**: Let existing 404 handling work
4. **Network errors**: Existing error boundaries will catch

## Implementation Order

1. Create WorkspaceDisplay component (non-breaking)
2. Update WorkspaceCommandSelector with conditional logic
3. Test thoroughly on staging
4. Add auto-redirect to workspace list
5. Final validation across all flows

## Success Criteria

- Users with single workspace see clean, non-interactive display
- Auto-redirect happens seamlessly (no flash of workspace list)
- No regression for multi-workspace users
- Performance remains the same or improves
- Code follows existing patterns and conventions

## References

- Current workspace selector: `/src/components/workspace-command-selector.tsx`
- Workspace data fetching: `/src/services/workspace-service.ts` 
- Next.js redirect docs: https://nextjs.org/docs/app/api-reference/functions/redirect
- Existing avatar component: `/src/components/workspace-avatar.tsx`
- Layout data flow: `/src/app/w/layout.tsx` → `/src/app/w/components/workspace-layout-client.tsx`

## Confidence Score: 9/10

High confidence due to:
- Clear, isolated changes
- Existing patterns to follow
- Comprehensive research completed
- Simple logic with few edge cases
- Non-breaking implementation approach

Minor uncertainty around:
- Exact redirect timing (may need fine-tuning)
- Mobile sheet behavior with static display