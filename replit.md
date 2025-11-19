# Badminton Tournament Manager

## Overview

A React + TypeScript web application for managing badminton tournaments and social games. The system enables organizers to create sessions, manage players, configure courts, and generate matches based on various algorithms (balanced, gender-based, random). Built as a full-stack application with PostgreSQL database persistence, it replaces the original localStorage-based approach with a robust client-server architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 19 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System:**
- shadcn/ui components built on Radix UI primitives
- TailwindCSS for styling with custom design tokens
- Design philosophy follows a "system-based approach" with sports-oriented customization prioritizing clarity and efficiency (inspired by Linear's design)
- Custom theme system supporting light/dark modes with CSS variables
- Responsive design with mobile-first breakpoints

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Query client configured with infinite stale time and disabled refetching for predictable behavior
- Custom API request wrapper handling authentication and error states
- Local component state using React hooks (useState, useReducer)

**Design System Specifications:**
- Typography: Inter font family from Google Fonts
- Spacing primitives: Consistent use of Tailwind units (2, 4, 6, 8)
- Border radius system: rounded-full for buttons, rounded-2xl for cards, rounded-3xl for modals
- Component padding: Cards (p-6), sections (mb-8), buttons (px-6 py-3)

### Backend Architecture

**Server Framework:**
- Express.js REST API server
- TypeScript throughout for type consistency with frontend
- WebSocket support via Neon's serverless WebSocket constructor

**API Design:**
- RESTful endpoints organized by resource type (sessions, players, courts, matches)
- Route structure in `/server/routes.ts` with modular endpoint definitions
- Request validation using Zod schemas derived from Drizzle schema definitions
- Consistent error handling with HTTP status codes and JSON error responses

**Business Logic:**
- Match generation algorithm in `/server/match-generator.ts`
- Supports multiple match modes: balanced (skill-based pairing), non-balanced, gender-based, gender-specific, and random
- Player rotation system ensuring fair play distribution based on games played
- Court allocation algorithm maximizing court utilization

**Storage Layer:**
- Storage interface pattern (`IStorage`) abstracting database operations
- `DatabaseStorage` implementation using Drizzle ORM
- CRUD operations for all entities (sessions, players, courts, matches)
- Cascade deletion ensuring referential integrity

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless database
- Connection pooling with `@neondatabase/serverless` package
- WebSocket-based connections for serverless compatibility

**ORM & Schema Management:**
- Drizzle ORM for type-safe database queries
- Schema definitions in `/shared/schema.ts` shared between client and server
- Drizzle-Zod integration for automatic validation schema generation
- Migration system using Drizzle Kit (configured in `drizzle.config.ts`)

**Data Model:**
- **Sessions**: Tournament/game session container with metadata (name, location, default settings)
- **Players**: Participant records with skill categorization (Starter/Intermediate/Pro), gender, status (Queue/Playing/Break), and game statistics
- **Courts**: Physical court configuration with active/inactive states and positioning
- **Matches**: Game records linking players, courts, and teams with status tracking (pending/in-progress/completed)

**Schema Relationships:**
- One-to-many: Session → Players, Session → Courts, Session → Matches
- Cascade delete on session removal to maintain data integrity
- Foreign key constraints enforced at database level

### Authentication and Authorization

Currently, the application does not implement authentication or user accounts. All sessions and data are publicly accessible. This is suitable for single-organizer or trusted-group scenarios.

**Future Considerations:**
- Session-based authentication could be added using `connect-pg-simple` (already included in dependencies)
- Express session middleware would enable user accounts and session ownership
- Authorization layer would restrict access to sessions based on user ownership

### Development & Deployment

**Development Environment:**
- Hot module replacement via Vite for rapid frontend iteration
- tsx for running TypeScript server code without compilation
- Replit-specific plugins for development banner and cartographer integration
- Custom error overlay modal for runtime error handling

**Build Process:**
- Frontend: Vite builds to `dist/public` directory
- Backend: esbuild bundles server code to `dist/index.js` with ESM format
- Node platform targeting with external package bundling
- Type checking via TypeScript compiler (tsc) without emission

**Production Server:**
- Serves built static assets from `dist/public`
- Express handles API routes and SPA fallback routing
- Environment-based configuration (NODE_ENV)

## External Dependencies

### Database & ORM
- **Neon Database** (@neondatabase/serverless): Serverless PostgreSQL hosting
- **Drizzle ORM** (drizzle-orm): Type-safe database toolkit
- **Drizzle Kit** (drizzle-kit): Schema migrations and database management
- **Drizzle Zod** (drizzle-zod): Automatic validation schema generation

### UI Component Libraries
- **Radix UI**: Comprehensive collection of accessible, unstyled UI primitives (@radix-ui/react-*)
  - Dialog, Dropdown Menu, Select, Checkbox, Switch, Tabs, Toast, Tooltip, and 20+ other components
- **shadcn/ui**: Pre-styled component patterns built on Radix UI (configured in components.json)
- **cmdk**: Command menu component for keyboard-driven interfaces
- **embla-carousel-react**: Touch-friendly carousel component

### Styling & Theming
- **TailwindCSS**: Utility-first CSS framework (v3)
- **class-variance-authority**: Type-safe variant styling system
- **clsx** & **tailwind-merge**: Class name management utilities
- **Google Fonts**: Inter font family loaded via CDN

### State Management & Data Fetching
- **TanStack Query** (@tanstack/react-query): Server state management with caching
- **React Hook Form** (@hookform/resolvers): Form state and validation (included but not heavily used)
- **date-fns**: Date manipulation and formatting library

### Routing & Navigation
- **Wouter**: Lightweight routing library for React applications (simpler alternative to React Router)

### Utilities
- **nanoid**: Secure URL-friendly unique ID generation (used in toast system)
- **Zod**: TypeScript-first schema validation library

### Development Tools
- **Vite Plugins**: 
  - @vitejs/plugin-react: React fast refresh and JSX transformation
  - @replit/vite-plugin-runtime-error-modal: Error overlay for development
  - @replit/vite-plugin-cartographer: Replit IDE integration
  - @replit/vite-plugin-dev-banner: Development environment indicator

### Build Tools
- **esbuild**: Fast JavaScript bundler for server code
- **TypeScript**: Type system and compiler
- **PostCSS**: CSS processing with Autoprefixer

### Session Storage (Ready but Unused)
- **connect-pg-simple**: PostgreSQL session store for Express (included in dependencies but not currently configured)

## Recent Changes (November 2025)

### Database Integration
- Migrated from localStorage to PostgreSQL database for production-ready persistence
- Implemented proper enum validation for SkillCategory, Gender, PlayerStatus, and MatchMode
- Fixed player state update bugs to use fresh database data during match generation
- Session lastPlayedAt now updates when matches are generated

### UI/UX Enhancements
- Added ThemeProvider for dark mode support with theme toggle
- Implemented proper design system following design_guidelines.md (rounded buttons, Inter font, consistent spacing)
- Fixed session creation navigation (apiRequest now returns parsed JSON)
- Updated default courts from 2 to 3 (Court 1, 2, 3 auto-created)

### Testing & Quality
- All E2E tests passing with comprehensive coverage:
  - Session creation and navigation
  - Player management (add, status changes)
  - Court configuration (add, toggle active/inactive)
  - Match generation with multiple algorithms (Balanced, Gender-Based, etc.)
  - Match completion and player rotation
  - Dark mode toggle
  - Session reset and delete functionality

### Production Status
- ✅ All critical bugs resolved
- ✅ Database schema properly validated
- ✅ Theme system fully functional
- ✅ Match generation algorithms working correctly with fair player rotation
- ✅ Component-based architecture for easy modifications
- ✅ Ready for deployment

## Known Limitations
- No authentication system (suitable for single-organizer or trusted-group scenarios)
- All sessions are publicly accessible
- No user account management

## Future Enhancements
- Session-based authentication with user accounts
- Authorization layer for session ownership
- Real-time updates via WebSockets
- Mobile app version
- Advanced analytics and player statistics