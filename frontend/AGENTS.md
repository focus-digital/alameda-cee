# React + TypeScript + Vite

## Stack, libraries, and tooling

Use the following libraries and tools for each category of frontend concept:

- UI Components: We USWDS components from `@trussworks/react-uswds`
- Forms: React Hook Form
- Global store: tanstack/query
- Global state: zustand
- Validation: Zod
- Vitest: testing

## Development patterns

- Pages: use hooks and global state
- Tests: keep tests to page level only
- Components: pass all data needed for render as much as possible, do not retrieve global state. Can maintain local state around interactivity.
- UI Components: Import directly from design system libraries, never through an abstraction layer

## Mobile Responsiveness

All frontend changes must be mobile responsive. Follow these guidelines:

### Layout
- Use USWDS Grid components with explicit mobile breakpoints: `col={12}` for mobile, `tablet={{ col: X }}` for tablet, `desktop={{ col: X }}` for desktop
- Wrap tables in `<div className="table-responsive">` for horizontal scrolling on mobile
- Ensure forms use `max-width: 100%` on mobile viewports

### Navigation
- Mobile navigation uses `NavMenuButton` for the hamburger menu toggle
- User menu uses `NavDropDownButton` and `Menu` components in the primary nav area
- Test that mobile nav opens/closes correctly

### Touch Targets
- Ensure buttons have minimum 44px touch target height on mobile
- Use USWDS button components which handle this by default

### Testing
- Test all changes at these viewport widths: 320px, 375px, 768px, 1024px
- Verify no horizontal overflow occurs
- Confirm touch targets are accessible

### CSS Guidelines
- Use USWDS utility classes (e.g., `display-flex`, `padding-2`, `margin-top-1`) instead of custom CSS or Tailwind
- Custom responsive styles go in `src/app/index.css` using mobile-first media queries
- Mobile breakpoint: `@media (max-width: 639px)`
- Tablet breakpoint: `@media (min-width: 640px)`
- Desktop breakpoint: `@media (min-width: 64em)`
