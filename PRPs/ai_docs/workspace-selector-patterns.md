# Workspace Selector Implementation Patterns

## Current Component Structure

The workspace selector uses a command palette pattern (cmdk) with the following structure:

```typescript
<Popover>
  <PopoverTrigger>
    <Button variant="ghost">
      {/* Shows current workspace or placeholder */}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      {/* Search input and workspace list */}
    </Command>
  </PopoverContent>
</Popover>
```

## Key Implementation Details

### 1. Workspace Detection Pattern
```typescript
const currentWorkspace = React.useMemo(() => {
  const workspaceSlugMatch = pathname.match(/^\/w\/([^\/]+)/)
  if (workspaceSlugMatch && workspaceSlugMatch[1] !== "profile" && workspaceSlugMatch[1] !== "settings") {
    const slug = workspaceSlugMatch[1]
    return userWorkspaces.find(item => item.workspace.slug === slug)?.workspace
  }
  return null
}, [pathname, userWorkspaces])
```

### 2. Button Styling Pattern
The current button uses these classes:
- `h-9` - Height
- `w-full` - Full width 
- `px-3` - Horizontal padding
- `text-left` - Left aligned text
- `font-normal` - Normal font weight
- `justify-between` - Space between content and chevron
- `bg-foreground/5` - Subtle background

### 3. Loading State Pattern
```typescript
const [isNavigating, setIsNavigating] = React.useState(false)

// During navigation
setIsNavigating(true)
await router.push(`/w/${workspaceSlug}`)
if (onNavigate) onNavigate() // Mobile callback
setTimeout(() => setIsNavigating(false), 100)
```

### 4. Mobile Integration
The component accepts an optional `onNavigate` callback used by mobile navigation to close the sheet after selection.

## Implementation Tips

1. **Maintain Visual Consistency**: The static display should have the same height (h-9) and padding (px-3) as the interactive button.

2. **Handle All States**: Consider loading, error, and empty states even for single workspace display.

3. **Preserve Mobile Behavior**: Even with static display, mobile users might expect to see workspace info in the sheet.

4. **Type Safety**: The component already has proper TypeScript types - maintain them.

5. **Accessibility**: Ensure the static display has proper ARIA labels for screen readers.