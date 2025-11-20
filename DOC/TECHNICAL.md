# Technical Documentation - Badminton Tournament Manager

Comprehensive technical documentation for developers working on or deploying the Badminton Tournament Manager.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Match Generation Algorithms](#match-generation-algorithms)
- [State Management](#state-management)
- [Design System](#design-system)
- [Development Workflow](#development-workflow)

## Architecture Overview

The application follows a modern full-stack architecture:

```
┌─────────────────────────────────────────┐
│           Client (React SPA)            │
│  - React 19 + TypeScript                │
│  - TanStack Query for state             │
│  - Wouter for routing                   │
│  - shadcn/ui + TailwindCSS              │
└──────────────┬──────────────────────────┘
               │ REST API (JSON)
               │
┌──────────────▼──────────────────────────┐
│         Express.js Server               │
│  - REST API endpoints                   │
│  - Request validation (Zod)             │
│  - Business logic layer                 │
└──────────────┬──────────────────────────┘
               │ SQL Queries
               │
┌──────────────▼──────────────────────────┐
│      PostgreSQL Database (Neon)         │
│  - Drizzle ORM                          │
│  - Cascade delete constraints           │
│  - Type-safe queries                    │
└─────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Shared Types**: `/shared/schema.ts` contains Drizzle schema definitions used by both frontend and backend for type consistency

2. **Storage Abstraction**: `IStorage` interface allows swapping database implementations without changing business logic

3. **Validation Layer**: Zod schemas auto-generated from Drizzle schemas ensure request validation matches database constraints

4. **Component-Based UI**: Reusable shadcn components with consistent styling and behavior

5. **Server-Side Business Logic**: Match generation and player rotation algorithms run on the server to ensure consistency

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| TailwindCSS | 3.x | Utility-first CSS |
| shadcn/ui | Latest | Component library |
| Wouter | 3.x | Lightweight routing |
| TanStack Query | 5.x | Server state management |
| Radix UI | Latest | Accessible primitives |
| Lucide React | Latest | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Drizzle ORM | Latest | Database toolkit |
| Zod | 3.x | Schema validation |
| tsx | Latest | TS execution |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database |
| Neon | Serverless hosting |
| Drizzle Kit | Migrations |

## Project Structure

```
badminton-tournament-manager/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn base components
│   │   │   ├── player-card.tsx
│   │   │   ├── player-management.tsx
│   │   │   ├── match-generation.tsx
│   │   │   ├── court-configuration.tsx
│   │   │   ├── active-matches.tsx
│   │   │   └── ...
│   │   ├── pages/           # Route components
│   │   │   ├── home.tsx
│   │   │   ├── create-session.tsx
│   │   │   ├── session-dashboard.tsx
│   │   │   └── not-found.tsx
│   │   ├── lib/             # Utilities
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── hooks/           # Custom hooks
│   │   │   └── use-toast.ts
│   │   ├── App.tsx          # App entry point
│   │   └── main.tsx         # React render
│   └── index.html           # HTML template
├── server/                   # Backend Express application
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Storage interface & implementation
│   ├── routes.ts            # API route definitions
│   ├── match-generator.ts   # Match generation logic
│   ├── index.ts             # Server entry point
│   └── vite.ts              # Vite integration
├── shared/                   # Shared between client & server
│   └── schema.ts            # Database schema & types
├── DOC/                      # Documentation
│   ├── README.md
│   ├── USER_GUIDE.md
│   ├── TECHNICAL.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── drizzle.config.ts        # Drizzle configuration
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies & scripts
```

## Database Schema

### Tables Overview

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_played_at TIMESTAMP,
  default_courts INTEGER NOT NULL DEFAULT 3,
  default_match_mode VARCHAR(20) NOT NULL DEFAULT 'balanced'
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  skill_category VARCHAR(20) NOT NULL, -- 'Starter', 'Intermediate', 'Pro'
  gender VARCHAR(10) NOT NULL,          -- 'Male', 'Female'
  status VARCHAR(20) NOT NULL DEFAULT 'Queue', -- 'Queue', 'Playing', 'Break'
  games_played INTEGER NOT NULL DEFAULT 0
);

-- Courts table
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id),
  court_name TEXT NOT NULL,
  team1_player1_id UUID NOT NULL REFERENCES players(id),
  team1_player2_id UUID NOT NULL REFERENCES players(id),
  team2_player1_id UUID NOT NULL REFERENCES players(id),
  team2_player2_id UUID NOT NULL REFERENCES players(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in-progress', 'completed'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Enums

```typescript
// Skill categories
enum SkillCategory {
  Starter = 'Starter',
  Intermediate = 'Intermediate',
  Pro = 'Pro'
}

// Gender
enum Gender {
  Male = 'Male',
  Female = 'Female'
}

// Player status
enum PlayerStatus {
  Queue = 'Queue',
  Playing = 'Playing',
  Break = 'Break'
}

// Match mode
enum MatchMode {
  Balanced = 'balanced',
  NonBalanced = 'non-balanced',
  GenderBased = 'gender-based',
  GenderSpecific = 'gender-specific',
  Random = 'random'
}

// Match status
enum MatchStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed'
}
```

### Relationships

- **Session → Players**: One-to-many (cascade delete)
- **Session → Courts**: One-to-many (cascade delete)
- **Session → Matches**: One-to-many (cascade delete)
- **Court → Matches**: One-to-many
- **Player → Matches**: Many-to-many (4 players per match)

### Indexes

```sql
CREATE INDEX idx_players_session ON players(session_id);
CREATE INDEX idx_courts_session ON courts(session_id);
CREATE INDEX idx_matches_session ON matches(session_id);
CREATE INDEX idx_matches_court ON matches(court_id);
CREATE INDEX idx_players_status ON players(status);
```

## Backend Implementation

### Storage Interface Pattern

```typescript
interface IStorage {
  // Sessions
  createSession(data: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessions(): Promise<Session[]>;
  updateSession(id: string, data: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  
  // Players
  createPlayer(data: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayers(sessionId: string): Promise<Player[]>;
  updatePlayer(id: string, data: Partial<InsertPlayer>): Promise<Player>;
  deletePlayer(id: string): Promise<void>;
  
  // Courts
  createCourt(data: InsertCourt): Promise<Court>;
  getCourt(id: string): Promise<Court | undefined>;
  getCourts(sessionId: string): Promise<Court[]>;
  updateCourt(id: string, data: Partial<InsertCourt>): Promise<Court>;
  deleteCourt(id: string): Promise<void>;
  
  // Matches
  createMatch(data: InsertMatch): Promise<Match>;
  getMatch(id: string): Promise<Match | undefined>;
  getMatches(sessionId: string): Promise<Match[]>;
  updateMatch(id: string, data: Partial<InsertMatch>): Promise<Match>;
  deleteMatch(id: string): Promise<void>;
  
  // Utility
  resetSession(sessionId: string): Promise<void>;
}
```

### API Route Structure

All routes follow RESTful conventions:

```typescript
// Sessions
GET    /api/sessions          - List all sessions
POST   /api/sessions          - Create session
GET    /api/sessions/:id      - Get session by ID
PATCH  /api/sessions/:id      - Update session
DELETE /api/sessions/:id      - Delete session
POST   /api/sessions/:id/reset - Reset session
POST   /api/sessions/:id/generate-matches - Generate matches

// Players
GET    /api/sessions/:id/players - Get session players
POST   /api/players              - Create player
PATCH  /api/players/:id          - Update player
DELETE /api/players/:id          - Delete player

// Courts
GET    /api/sessions/:id/courts - Get session courts
POST   /api/courts               - Create court
PATCH  /api/courts/:id           - Update court
DELETE /api/courts/:id           - Delete court

// Matches
GET    /api/sessions/:id/matches - Get session matches
PATCH  /api/matches/:id          - Update match
DELETE /api/matches/:id          - Delete match
```

### Request Validation

All POST/PATCH requests validate using Zod schemas:

```typescript
app.post("/api/sessions", async (req, res) => {
  try {
    const validatedData = insertSessionSchema.parse(req.body);
    const session = await storage.createSession(validatedData);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
```

### Error Handling

Standard error response format:

```typescript
{
  "message": "Error description"
}
```

HTTP status codes:
- 200: Success
- 201: Created (not used, returns 200 with data)
- 400: Validation error
- 404: Not found
- 500: Server error

## Frontend Implementation

### Component Hierarchy

```
App
├── ThemeProvider
│   └── Router
│       ├── Home
│       │   └── SessionsList
│       ├── CreateSession
│       └── SessionDashboard
│           ├── PlayerManagement
│           │   ├── AddPlayerDialog
│           │   └── PlayerCard
│           ├── MatchGeneration
│           ├── CourtConfiguration
│           └── ActiveMatches
```

### State Management Strategy

**TanStack Query Configuration:**

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

**Query Keys Pattern:**

```typescript
// Session queries
["/api/sessions"]                     // All sessions
["/api/sessions", sessionId]          // Single session
["/api/sessions", sessionId, "players"] // Session players
["/api/sessions", sessionId, "courts"]  // Session courts
["/api/sessions", sessionId, "matches"] // Session matches
```

**Mutations with Cache Invalidation:**

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    return await apiRequest("POST", "/api/players", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ 
      queryKey: ["/api/sessions", sessionId, "players"] 
    });
  },
});
```

### Routing

```typescript
// Route definitions
<Switch>
  <Route path="/" component={Home} />
  <Route path="/sessions/new" component={CreateSession} />
  <Route path="/sessions/:id" component={SessionDashboard} />
  <Route component={NotFound} />
</Switch>
```

### Form Handling

Using shadcn's Form component with react-hook-form:

```typescript
const form = useForm<InsertPlayer>({
  resolver: zodResolver(insertPlayerSchema),
  defaultValues: {
    name: "",
    skillCategory: "Intermediate",
    gender: "Male",
    status: "Queue",
  },
});

const onSubmit = (data: InsertPlayer) => {
  mutation.mutate(data);
};
```

## Match Generation Algorithms

Located in `/server/match-generator.ts`:

### Algorithm Implementations

#### 1. Balanced Algorithm

```typescript
function balancedPairing(players: Player[]): Team[] {
  // Sort by skill level (Pro > Intermediate > Starter)
  const sorted = sortBySkill(players);
  
  // Pair highest with lowest for balance
  const team1 = [sorted[0], sorted[3]];
  const team2 = [sorted[1], sorted[2]];
  
  return [team1, team2];
}
```

**Logic:**
- Assigns numeric weights: Pro=3, Intermediate=2, Starter=1
- Sorts players by skill descending
- Pairs strongest with weakest
- Creates balanced team skill totals

#### 2. Non-Balanced Algorithm

```typescript
function nonBalancedPairing(players: Player[]): Team[] {
  // Random shuffle
  const shuffled = shuffle(players);
  
  // Split into two teams
  const team1 = shuffled.slice(0, 2);
  const team2 = shuffled.slice(2, 4);
  
  return [team1, team2];
}
```

**Logic:**
- Randomly shuffles player array
- Splits into two teams of 2
- No skill consideration

#### 3. Gender-Based Algorithm

```typescript
function genderBasedPairing(players: Player[]): Team[] {
  const males = players.filter(p => p.gender === 'Male');
  const females = players.filter(p => p.gender === 'Female');
  
  if (males.length < 2 || females.length < 2) {
    throw new Error('Need at least 2 males and 2 females');
  }
  
  // Create mixed-gender teams
  const team1 = [males[0], females[0]];
  const team2 = [males[1], females[1]];
  
  return [team1, team2];
}
```

**Logic:**
- Separates players by gender
- Validates sufficient count
- Creates 1 male + 1 female per team

#### 4. Gender-Specific Algorithm

```typescript
function genderSpecificPairing(players: Player[]): Team[] {
  const males = players.filter(p => p.gender === 'Male');
  const females = players.filter(p => p.gender === 'Female');
  
  // Prefer larger gender group
  const dominant = males.length >= females.length ? males : females;
  
  if (dominant.length < 4) {
    throw new Error('Need at least 4 players of same gender');
  }
  
  const team1 = dominant.slice(0, 2);
  const team2 = dominant.slice(2, 4);
  
  return [team1, team2];
}
```

**Logic:**
- Uses gender with more players
- Creates same-gender teams
- Falls back if insufficient count

#### 5. Random Algorithm

```typescript
function randomPairing(players: Player[]): Team[] {
  const shuffled = shuffle(players);
  
  const team1 = shuffled.slice(0, 2);
  const team2 = shuffled.slice(2, 4);
  
  return [team1, team2];
}
```

**Logic:**
- Identical to non-balanced
- Complete randomization
- No constraints

### Player Selection Logic

```typescript
function selectPlayers(
  allPlayers: Player[], 
  count: number
): Player[] {
  // Filter to Queue status only
  const available = allPlayers.filter(p => p.status === 'Queue');
  
  if (available.length < count) {
    throw new Error(`Need ${count} players in queue`);
  }
  
  // Sort by games played (ascending)
  const sorted = available.sort((a, b) => 
    a.gamesPlayed - b.gamesPlayed
  );
  
  // Select players with fewest games
  return sorted.slice(0, count);
}
```

**Fair Rotation:**
- Only considers Queue status players
- Prioritizes players with fewer games
- Ensures all players get equal opportunities

### Court Allocation

```typescript
function allocateCourts(
  courts: Court[], 
  teams: Team[][]
): Match[] {
  const active = courts.filter(c => c.isActive);
  
  if (active.length === 0) {
    throw new Error('No active courts available');
  }
  
  return teams.slice(0, active.length).map((teamPair, i) => ({
    court: active[i],
    team1: teamPair[0],
    team2: teamPair[1],
  }));
}
```

**Logic:**
- Filters to active courts only
- Limits matches to court count
- Assigns teams sequentially

## Design System

### Color Tokens

Defined in `/client/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode values */
}
```

### Typography

```css
body {
  font-family: 'Inter', sans-serif;
}
```

Font sizes:
- Headings: 2xl (1.5rem), xl (1.25rem), lg (1.125rem)
- Body: base (1rem), sm (0.875rem)
- Small: xs (0.75rem)

### Border Radius System

- **Buttons**: `rounded-full` (9999px)
- **Cards**: `rounded-2xl` (1rem)
- **Modals**: `rounded-3xl` (1.5rem)
- **Inputs**: `rounded-xl` (0.75rem)
- **Badges**: `rounded-full`

### Spacing Scale

Consistent use of Tailwind spacing:
- Small: 2 (0.5rem)
- Medium: 4 (1rem), 6 (1.5rem)
- Large: 8 (2rem)
- Card padding: 6
- Section margin: 8

### Component Variants

**Button sizes:**
- `default`: min-h-9
- `sm`: min-h-8
- `lg`: min-h-10
- `icon`: h-9 w-9

**Badge variants:**
- `default`: Primary colored
- `secondary`: Muted background
- `outline`: Bordered, transparent
- `destructive`: Red/error colored

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
npm run db:push

# Start development server
npm run dev
```

### Available Scripts

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "tsc && vite build",
  "db:push": "drizzle-kit push",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

### Development Server

- Frontend: Vite dev server with HMR
- Backend: tsx with watch mode
- Single port: 5000 (frontend and API)
- Auto-reload on file changes

### Database Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Push schema directly (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Building for Production

```bash
# Build frontend and backend
npm run build

# Outputs:
# - dist/public/ (frontend static files)
# - dist/index.js (backend bundle)
```

### Code Organization Principles

1. **Shared Types**: Always define types in `/shared/schema.ts`
2. **Component Composition**: Break down into small, reusable components
3. **Server Logic**: Keep business logic on server, not in API routes
4. **Validation**: Use Zod schemas for all user input
5. **Type Safety**: Leverage TypeScript strictly, no `any` types
6. **Consistent Naming**: Use descriptive, consistent naming conventions

### Testing Strategy

While no automated tests are currently implemented, manual testing covers:

- Session CRUD operations
- Player management and status changes
- Match generation with all algorithms
- Court configuration
- Theme toggle
- Responsive design
- Error handling

### Performance Considerations

- **Query Caching**: TanStack Query caches responses
- **Optimistic Updates**: Not implemented (could be added)
- **Database Indexes**: Strategic indexes on foreign keys
- **Lazy Loading**: Components loaded on-demand via routing
- **Bundle Size**: Code splitting via Vite

### Security Considerations

- **SQL Injection**: Protected by Drizzle ORM parameterized queries
- **XSS**: React escapes by default
- **CSRF**: Not implemented (no authentication)
- **Input Validation**: Zod schemas validate all inputs
- **Secrets**: Environment variables for sensitive data

---

For API documentation, see [API.md](./API.md)
For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
