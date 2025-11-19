# Badminton Tournament Management - Design Guidelines

## Design Approach
**System-Based Approach** with sports-oriented customization. This is a utility-focused productivity tool where clarity, efficiency, and quick decision-making are paramount. Drawing from Linear's clean typography and Notion's organized layouts, with a sporty, energetic twist.

---

## Typography System

**Primary Font**: Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight  
- UI elements: 500-600 weight

**Scale**:
- Session titles/page headers: text-2xl to text-3xl
- Section headers: text-lg to text-xl
- Body text/labels: text-sm to text-base
- Small metadata: text-xs

---

## Layout & Spacing

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, and 8** consistently
- Card padding: p-6
- Section margins: mb-8, mt-6
- Button padding: px-6 py-3
- Grid gaps: gap-4 or gap-6
- Container max-width: max-w-7xl with px-4

**Border Radius**: Rounded design system
- Buttons: rounded-full (pill-shaped)
- Cards: rounded-2xl
- Input fields: rounded-xl
- Badges/chips: rounded-full
- Modals: rounded-3xl

---

## Core Components

### Buttons
**Primary Action Buttons**:
- Pill-shaped (rounded-full) with px-6 py-3
- Medium weight text (font-medium)
- Adequate padding for touch targets
- Shadow: shadow-sm on default, shadow-md on hover

**Secondary Buttons**:
- Outlined style with same rounded-full shape
- Border width: border-2

**Icon Buttons**:
- Circular (aspect-square with rounded-full)
- Size variants: w-10 h-10 (default), w-8 h-8 (small)

### Cards
**Session Cards**:
- Large rounded corners (rounded-2xl)
- Padding: p-6
- Shadow: shadow-md with subtle hover lift (shadow-lg)
- Grid layout for session list: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Player Cards**:
- Compact design with rounded-xl
- Padding: p-4
- Skill badge integrated in top-right corner
- Draggable indication with subtle border

**Match Cards**:
- Court identifier header
- Team sections clearly divided
- Status badge (pending/in-progress/completed)
- Rounded-2xl with p-6

### Form Elements
**Input Fields**:
- Rounded-xl borders
- Padding: px-4 py-3
- Border: border-2 for focus states
- Label: text-sm font-medium mb-2

**Dropdowns/Selects**:
- Match input styling (rounded-xl)
- Custom arrow indicators

### Badges & Status Indicators
**Skill Category Badges**:
- Pill-shaped (rounded-full)
- Small padding: px-3 py-1
- Text: text-xs font-semibold
- Distinct visual treatment for Starter/Intermediate/Pro

**Status Pills** (Queue/Playing/Break):
- Rounded-full
- Slightly larger: px-4 py-2

### Navigation
**Top Navigation**:
- Session name prominently displayed (text-xl font-semibold)
- Back button (icon + text) on left
- Actions/settings on right
- Padding: py-4 px-6

**Dashboard Layout**:
- Sidebar-free, single column focus
- Section-based organization
- Sticky header for context retention

---

## Page Layouts

### Sessions List Page
- Hero section with "Create New Session" CTA (large, prominent, rounded-full button)
- Grid of session cards below
- Empty state: centered illustration placeholder with create button

### Session Dashboard
- Three-column flexible layout:
  - Left: Player management panel
  - Center: Match generation & active matches
  - Right: Court configuration & quick stats
- Responsive: stacks to single column on mobile

### Player Management Section
- Three distinct zones with visual separation:
  - Queue (primary area)
  - Playing (highlighted section)
  - Break (subdued section)
- Drag targets clearly indicated with dashed borders on hover

### Match Generation Panel
- Mode selector: Large radio button group or segmented control
- Court count: Number stepper with +/- buttons
- Generate button: Full-width, prominent, pill-shaped
- Court name editor: Inline editable fields with pencil icon

---

## Interaction Patterns

**Drag & Drop**:
- Hover states: scale(1.02) transform
- Drop zones: dashed border with background tint when drag active
- Smooth transitions: transition-all duration-200

**Modals/Dialogs**:
- Centered overlay with backdrop blur
- Max-width: max-w-lg to max-w-2xl depending on content
- Rounded-3xl corners
- Close button in top-right

**Loading States**:
- Skeleton screens for card grids
- Spinner for button actions
- Subtle pulse animation

**Confirmations**:
- Reset session: Modal with warning icon, explanation text, two-button choice (Cancel + Confirm destructive action)

---

## Accessibility
- All interactive elements meet 44x44px minimum touch target
- Focus rings: ring-2 with offset (ring-offset-2)
- High contrast for text (WCAG AA minimum)
- Keyboard navigation support with visible focus states
- Screen reader labels for icon-only buttons

---

## Visual Enhancements
**Shadows**: Use sparingly for elevation hierarchy
- Cards: shadow-md default, shadow-lg on hover
- Modals: shadow-2xl
- Floating action buttons: shadow-lg

**Micro-interactions**:
- Button press: slight scale reduction (scale-95) on active
- Card hover: subtle lift with shadow change
- Success feedback: brief green border flash on save actions

---

## Images
No hero images required for this application. This is a utility-focused tool where efficiency and data visibility are paramount. All visual interest comes from the rounded design system, clean typography, and organized layouts.