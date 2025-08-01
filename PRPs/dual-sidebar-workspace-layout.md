# PRP: Dual-Sidebar Workspace Layout Implementation

## Overview
Transform the current workspace layout from a top navigation pattern to an Easypanel-style dual-sidebar layout with a primary minimal sidebar (icon-only) and a secondary sidebar containing a workspace selector and workspace-specific navigation.

## Context and Research

### Current Implementation Analysis
- **Current Pattern**: Top header with horizontal navigation tabs
- **Existing Components**: 
  - `WorkspaceHeader` at `/src/app/w/workspace-header.tsx`
  - `WorkspaceSelector` at `/src/components/workspace-selector.tsx`
  - `WorkspaceNav` at `/src/app/w/[slug]/workspace-nav.tsx`
- **Layout Structure**: Two-level layout system with persistent header
- **Sidebar Component**: Already exists at `/src/components/ui/sidebar.tsx` (shadcn/ui implementation)

### Target UI Reference
The Easypanel example (`docs/esasypanel-example.png`) shows:
1. **Primary Sidebar** (left, ~64px): Icon-only with home, deployments, analytics, settings
2. **Secondary Sidebar** (~240px): Workspace selector at top, navigation items below
3. **Main Content Area**: Full remaining width

### Key Technologies
- **shadcn/ui Sidebar**: Existing component with collapsible modes, animations, and mobile support
- **cmdk**: Command palette library for advanced workspace selector
- **Next.js 15 App Router**: For layout composition
- **Tailwind CSS**: For responsive styling

## Implementation Blueprint

### Phase 1: Create Dual-Sidebar Layout Structure

#### 1.1 Create Primary Icon Sidebar Component
```typescript
// src/app/w/components/primary-sidebar.tsx
// Minimal icon-only sidebar with:
// - Home/Dashboard icon
// - Deployments/Projects icon  
// - Analytics icon
// - Settings icon (bottom)
// - User avatar (bottom)
// Width: 64px expanded, 48px collapsed
// Persistent across all /w routes
```

#### 1.2 Create Secondary Workspace Sidebar
```typescript
// src/app/w/components/workspace-sidebar.tsx
// Contains:
// - WorkspaceSelector (enhanced with cmdk)
// - Dynamic navigation based on selected workspace
// - Add new item button
// Width: 240px expanded, collapsible
```

#### 1.3 Update Main Layout
```typescript
// src/app/w/layout.tsx
// Replace current header-based layout with:
// <SidebarProvider>
//   <PrimarySidebar />
//   <WorkspaceSidebar />
//   <SidebarInset>{children}</SidebarInset>
// </SidebarProvider>
```

### Phase 2: Enhance Workspace Selector

#### 2.1 Create Command-Based Selector
```typescript
// src/components/workspace-command-selector.tsx
// Using cmdk + shadcn Command component:
// - Search functionality with fuzzy matching
// - Workspace avatars and metadata
// - Recent workspaces section
// - Create new workspace option
// - Keyboard navigation (arrows, enter, esc)
```

#### 2.2 Integration Pattern
```typescript
// Detect current workspace from URL
// Show selected workspace with dropdown trigger
// On selection: router.push(`/w/${workspace.slug}`)
// Persist last selected workspace in localStorage
```

### Phase 3: Migrate Navigation System

#### 3.1 Convert Horizontal to Vertical Navigation
```typescript
// Update workspace-specific navigation:
// - Move from tabs to vertical sidebar items
// - Maintain role-based visibility
// - Update active state detection
// - Add icons to navigation items
```

#### 3.2 Update Route Structure
```typescript
// Maintain existing routes:
// /w - Workspace listing
// /w/[slug] - Workspace dashboard
// /w/[slug]/members - Members management
// /w/[slug]/settings - Workspace settings
```

### Phase 4: State Management

#### 4.1 Sidebar State Persistence
```typescript
// Use existing sidebar cookie pattern:
// - Primary sidebar: collapsed/expanded state
// - Secondary sidebar: collapsed/expanded state
// - Selected workspace: localStorage
// - Mobile state: automatic handling
```

#### 4.2 Workspace Context Updates
```typescript
// Pass workspace through layouts:
// - Fetch in layout based on slug
// - Pass to sidebar components
// - Handle no-workspace state
```

### Phase 5: Responsive Design

#### 5.1 Breakpoint Behavior
```typescript
// Desktop (>1024px): Both sidebars visible
// Tablet (768-1024px): Secondary collapsible, primary remains
// Mobile (<768px): Both as sheet overlays
```

#### 5.2 Mobile Interactions
```typescript
// Use shadcn Sheet component for mobile
// Swipe gestures for sidebar toggle
// Hamburger menu in mobile header
```

## Detailed Implementation Tasks

### Task 1: Setup Dual-Sidebar Structure
1. Create `primary-sidebar.tsx` with icon navigation
2. Create `workspace-sidebar.tsx` with selector and nav
3. Update `/w/layout.tsx` to use dual-sidebar pattern
4. Remove `workspace-header.tsx` usage

### Task 2: Implement Enhanced Workspace Selector
1. Install cmdk: `pnpm add cmdk`
2. Create `workspace-command-selector.tsx`
3. Integrate with existing `workspace-selector.tsx` logic
4. Add search, avatars, and keyboard navigation

### Task 3: Convert Navigation Pattern
1. Update `workspace-nav.tsx` to vertical layout
2. Add icons to navigation items
3. Update active state logic for vertical nav
4. Maintain role-based access control

### Task 4: Handle State Management
1. Implement sidebar state persistence
2. Add workspace selection memory
3. Handle responsive state changes
4. Test with multiple workspaces

### Task 5: Polish and Edge Cases
1. Add loading states for workspace switching
2. Handle users with no workspaces
3. Implement smooth animations
4. Add tooltips for icon sidebar

## Validation Gates

```bash
# Type checking - Must pass without errors
pnpm run typecheck

# Linting - Must pass without warnings
pnpm run lint

# Build validation - Must build successfully
pnpm run build

# Manual Testing Checklist
# 1. Desktop: Both sidebars visible and functional
# 2. Tablet: Secondary sidebar collapses properly
# 3. Mobile: Both sidebars work as overlays
# 4. Workspace switching updates navigation
# 5. Persistence: Sidebar states preserved on refresh
# 6. Keyboard: All shortcuts work (Cmd+B for sidebar)
# 7. Role-based: Admin-only items hidden for members
# 8. Edge cases: No workspaces, single workspace
```

## External References

### Documentation
- shadcn/ui Sidebar: https://ui.shadcn.com/docs/components/sidebar
- cmdk Documentation: https://cmdk.paco.me/
- shadcn Command: https://ui.shadcn.com/docs/components/command
- Next.js Layouts: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts

### Examples and Patterns
- Discord Dual Sidebar: Classic icon + detailed sidebar pattern
- Command Palette Tutorial: https://corner.buka.sh/boost-your-react-app-with-a-sleek-command-palette-using-cmdk/
- React Compound Pattern: https://www.freecodecamp.org/news/build-a-dynamic-dropdown-component/

## Key Considerations

### Performance
- Use React.memo for sidebar components
- Lazy load workspace data
- Virtualize long workspace lists (if >50 items)
- Minimize re-renders on navigation changes

### Accessibility
- Maintain keyboard navigation throughout
- Proper ARIA labels for screen readers
- Focus management on sidebar toggle
- High contrast mode support

### User Experience
- Smooth animations (200ms transitions)
- Clear active states
- Intuitive icons with tooltips
- Consistent with existing admin sidebar pattern

## Risk Mitigation

1. **Backwards Compatibility**: Keep existing routes functional during migration
2. **Fallback Navigation**: Provide header navigation as fallback if needed
3. **Progressive Enhancement**: Roll out to subset of users first
4. **Data Integrity**: Ensure workspace context is always available
5. **Mobile Testing**: Extensive testing on various devices

## Success Metrics

- All validation gates pass
- Smooth workspace switching (<100ms)
- Responsive behavior works on all devices
- No regression in existing functionality
- Improved navigation efficiency

## Quality Score: 9/10

High confidence in one-pass implementation due to:
- Existing sidebar components to build upon
- Clear reference implementation (Easypanel)
- Well-defined workspace data model
- Established RSC patterns in codebase
- Comprehensive validation gates

The 1-point deduction is for potential edge cases in complex workspace scenarios and the need for thorough responsive testing.