# API Documentation - Badminton Tournament Manager

Complete REST API reference for the Badminton Tournament Manager.

## Base URL

```
http://localhost:5000/api
```

Production: Replace with your deployed domain.

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All responses return JSON:

**Success Response:**
```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2"
}
```

**Error Response:**
```json
{
  "message": "Error description"
}
```

## HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Validation error or invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Sessions

### List All Sessions

```http
GET /api/sessions
```

**Description:** Retrieves all sessions.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Monday Night Badminton",
    "description": "Weekly badminton games",
    "location": "Community Sports Center",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "lastPlayedAt": "2025-11-20T19:30:00.000Z",
    "defaultCourts": 3,
    "defaultMatchMode": "balanced"
  }
]
```

---

### Get Session by ID

```http
GET /api/sessions/:id
```

**Parameters:**
- `id` (path): Session UUID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Monday Night Badminton",
  "description": "Weekly badminton games",
  "location": "Community Sports Center",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "lastPlayedAt": "2025-11-20T19:30:00.000Z",
  "defaultCourts": 3,
  "defaultMatchMode": "balanced"
}
```

**Error Responses:**
- `404`: Session not found

---

### Create Session

```http
POST /api/sessions
```

**Request Body:**
```json
{
  "name": "Tuesday Evening Games",
  "description": "Competitive badminton",
  "location": "Downtown Gym",
  "defaultCourts": 3,
  "defaultMatchMode": "balanced"
}
```

**Field Validation:**
- `name` (required): String, 1-200 characters
- `description` (optional): String
- `location` (optional): String
- `defaultCourts` (optional): Integer, 1-5, default: 3
- `defaultMatchMode` (optional): Enum, default: "balanced"
  - Values: "balanced", "non-balanced", "gender-based", "gender-specific", "random"

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Tuesday Evening Games",
  "description": "Competitive badminton",
  "location": "Downtown Gym",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "lastPlayedAt": null,
  "defaultCourts": 3,
  "defaultMatchMode": "balanced"
}
```

**Side Effects:**
- Automatically creates `defaultCourts` number of courts (Court 1, Court 2, etc.)

**Error Responses:**
- `400`: Validation error (missing name, invalid defaultCourts, etc.)

---

### Update Session

```http
PATCH /api/sessions/:id
```

**Parameters:**
- `id` (path): Session UUID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Session Name",
  "description": "New description",
  "location": "New Location",
  "defaultMatchMode": "random"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Session Name",
  "description": "New description",
  "location": "New Location",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "lastPlayedAt": "2025-11-20T19:30:00.000Z",
  "defaultCourts": 3,
  "defaultMatchMode": "random"
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Session not found

---

### Delete Session

```http
DELETE /api/sessions/:id
```

**Parameters:**
- `id` (path): Session UUID

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

**Side Effects:**
- Cascade deletes all associated players, courts, and matches

**Error Responses:**
- `404`: Session not found

---

### Reset Session

```http
POST /api/sessions/:id/reset
```

**Parameters:**
- `id` (path): Session UUID

**Description:** Deletes all players and matches but keeps courts configured.

**Response:**
```json
{
  "message": "Session reset successfully"
}
```

**Side Effects:**
- Deletes all players in the session
- Deletes all matches in the session
- Keeps all courts intact

**Error Responses:**
- `404`: Session not found

---

### Generate Matches

```http
POST /api/sessions/:id/generate-matches
```

**Parameters:**
- `id` (path): Session UUID

**Request Body:**
```json
{
  "mode": "balanced"
}
```

**Field Validation:**
- `mode` (required): Enum
  - Values: "balanced", "non-balanced", "gender-based", "gender-specific", "random"

**Response:**
```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "courtId": "750e8400-e29b-41d4-a716-446655440000",
    "courtName": "Court 1",
    "team1Player1Id": "850e8400-e29b-41d4-a716-446655440001",
    "team1Player2Id": "850e8400-e29b-41d4-a716-446655440002",
    "team2Player1Id": "850e8400-e29b-41d4-a716-446655440003",
    "team2Player2Id": "850e8400-e29b-41d4-a716-446655440004",
    "status": "pending",
    "createdAt": "2025-11-20T19:30:00.000Z"
  }
]
```

**Side Effects:**
- Creates matches for each active court
- Selects 4 players per court from Queue status
- Updates selected players:
  - Status: Queue → Playing
  - gamesPlayed: increments by 1
- Updates session lastPlayedAt to current time

**Player Selection Logic:**
- Only considers players with status "Queue"
- Prioritizes players with fewer gamesPlayed (fair rotation)
- Uses specified algorithm to create teams

**Error Responses:**
- `400`: 
  - Not enough players in queue (need 4 × active courts)
  - No active courts available
  - Gender requirements not met (for gender-based modes)
- `404`: Session not found

---

## Players

### Get Session Players

```http
GET /api/sessions/:id/players
```

**Parameters:**
- `id` (path): Session UUID

**Response:**
```json
[
  {
    "id": "850e8400-e29b-41d4-a716-446655440001",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "skillCategory": "Intermediate",
    "gender": "Male",
    "status": "Queue",
    "gamesPlayed": 3
  },
  {
    "id": "850e8400-e29b-41d4-a716-446655440002",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Smith",
    "skillCategory": "Pro",
    "gender": "Female",
    "status": "Playing",
    "gamesPlayed": 5
  }
]
```

---

### Create Player

```http
POST /api/players
```

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Johnson",
  "skillCategory": "Starter",
  "gender": "Female"
}
```

**Field Validation:**
- `sessionId` (required): Valid session UUID
- `name` (required): String, 1-200 characters
- `skillCategory` (required): Enum
  - Values: "Starter", "Intermediate", "Pro"
- `gender` (required): Enum
  - Values: "Male", "Female"

**Response:**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Johnson",
  "skillCategory": "Starter",
  "gender": "Female",
  "status": "Queue",
  "gamesPlayed": 0
}
```

**Default Values:**
- `status`: "Queue"
- `gamesPlayed`: 0

**Error Responses:**
- `400`: Validation error (missing fields, invalid enums)

---

### Update Player

```http
PATCH /api/players/:id
```

**Parameters:**
- `id` (path): Player UUID

**Request Body:** (all fields optional)
```json
{
  "name": "Alice J. Johnson",
  "skillCategory": "Intermediate",
  "status": "Break"
}
```

**Response:**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice J. Johnson",
  "skillCategory": "Intermediate",
  "gender": "Female",
  "status": "Break",
  "gamesPlayed": 0
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Player not found

---

### Delete Player

```http
DELETE /api/players/:id
```

**Parameters:**
- `id` (path): Player UUID

**Response:**
```json
{
  "message": "Player deleted successfully"
}
```

**Error Responses:**
- `404`: Player not found

---

## Courts

### Get Session Courts

```http
GET /api/sessions/:id/courts
```

**Parameters:**
- `id` (path): Session UUID

**Response:**
```json
[
  {
    "id": "750e8400-e29b-41d4-a716-446655440001",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Court 1",
    "position": 1,
    "isActive": true
  },
  {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Court 2",
    "position": 2,
    "isActive": true
  }
]
```

---

### Create Court

```http
POST /api/courts
```

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Court 4",
  "position": 4
}
```

**Field Validation:**
- `sessionId` (required): Valid session UUID
- `name` (required): String, 1-100 characters
- `position` (required): Integer, 1-5

**Response:**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440004",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Court 4",
  "position": 4,
  "isActive": true
}
```

**Default Values:**
- `isActive`: true

**Error Responses:**
- `400`: Validation error, maximum 5 courts per session

---

### Update Court

```http
PATCH /api/courts/:id
```

**Parameters:**
- `id` (path): Court UUID

**Request Body:** (all fields optional)
```json
{
  "name": "Main Court",
  "isActive": false
}
```

**Response:**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440001",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Main Court",
  "position": 1,
  "isActive": false
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Court not found

---

### Delete Court

```http
DELETE /api/courts/:id
```

**Parameters:**
- `id` (path): Court UUID

**Response:**
```json
{
  "message": "Court deleted successfully"
}
```

**Constraints:**
- Cannot delete court with active matches
- Must complete or delete matches first

**Error Responses:**
- `400`: Court has active matches
- `404`: Court not found

---

## Matches

### Get Session Matches

```http
GET /api/sessions/:id/matches
```

**Parameters:**
- `id` (path): Session UUID

**Response:**
```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "courtId": "750e8400-e29b-41d4-a716-446655440001",
    "courtName": "Court 1",
    "team1Player1Id": "850e8400-e29b-41d4-a716-446655440001",
    "team1Player2Id": "850e8400-e29b-41d4-a716-446655440002",
    "team2Player1Id": "850e8400-e29b-41d4-a716-446655440003",
    "team2Player2Id": "850e8400-e29b-41d4-a716-446655440004",
    "status": "pending",
    "createdAt": "2025-11-20T19:30:00.000Z"
  }
]
```

**Match Statuses:**
- `pending`: Match created, not started
- `in-progress`: Match currently being played
- `completed`: Match finished

---

### Update Match

```http
PATCH /api/matches/:id
```

**Parameters:**
- `id` (path): Match UUID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "courtId": "750e8400-e29b-41d4-a716-446655440001",
  "courtName": "Court 1",
  "team1Player1Id": "850e8400-e29b-41d4-a716-446655440001",
  "team1Player2Id": "850e8400-e29b-41d4-a716-446655440002",
  "team2Player1Id": "850e8400-e29b-41d4-a716-446655440003",
  "team2Player2Id": "850e8400-e29b-41d4-a716-446655440004",
  "status": "completed",
  "createdAt": "2025-11-20T19:30:00.000Z"
}
```

**Side Effects (when status = "completed"):**
- All 4 players in match: status updated to "Queue"
- Players available for next match generation

**Error Responses:**
- `400`: Validation error
- `404`: Match not found

---

### Delete Match

```http
DELETE /api/matches/:id
```

**Parameters:**
- `id` (path): Match UUID

**Response:**
```json
{
  "message": "Match deleted successfully"
}
```

**Error Responses:**
- `404`: Match not found

---

## Data Models

### Session

```typescript
{
  id: string;                    // UUID
  name: string;                  // 1-200 characters
  description: string | null;    // Optional
  location: string | null;       // Optional
  createdAt: Date;               // Auto-generated
  lastPlayedAt: Date | null;     // Updated on match generation
  defaultCourts: number;         // 1-5, default: 3
  defaultMatchMode: MatchMode;   // Default: "balanced"
}
```

### Player

```typescript
{
  id: string;                    // UUID
  sessionId: string;             // Foreign key to session
  name: string;                  // 1-200 characters
  skillCategory: SkillCategory;  // "Starter" | "Intermediate" | "Pro"
  gender: Gender;                // "Male" | "Female"
  status: PlayerStatus;          // "Queue" | "Playing" | "Break"
  gamesPlayed: number;           // Default: 0
}
```

### Court

```typescript
{
  id: string;                    // UUID
  sessionId: string;             // Foreign key to session
  name: string;                  // 1-100 characters
  position: number;              // 1-5
  isActive: boolean;             // Default: true
}
```

### Match

```typescript
{
  id: string;                    // UUID
  sessionId: string;             // Foreign key to session
  courtId: string;               // Foreign key to court
  courtName: string;             // Denormalized for convenience
  team1Player1Id: string;        // Foreign key to player
  team1Player2Id: string;        // Foreign key to player
  team2Player1Id: string;        // Foreign key to player
  team2Player2Id: string;        // Foreign key to player
  status: MatchStatus;           // "pending" | "in-progress" | "completed"
  createdAt: Date;               // Auto-generated
}
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production deployments.

## CORS

Currently allows all origins. Configure CORS middleware for production:

```typescript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## Versioning

API is currently unversioned. Future versions may use `/api/v1/` prefix.

## Pagination

Currently not implemented. All list endpoints return complete datasets. Consider pagination for large sessions:

```http
GET /api/sessions/:id/players?page=1&limit=50
```

## Filtering & Sorting

Currently not implemented. Potential enhancements:

```http
GET /api/sessions/:id/players?status=Queue&sort=gamesPlayed
GET /api/sessions/:id/players?skillCategory=Pro
```

## WebSockets

Currently not implemented. Real-time updates could be added using Socket.io:

```typescript
// Potential events
socket.emit('matchGenerated', matches);
socket.emit('playerStatusChanged', player);
socket.emit('matchCompleted', match);
```

---

For usage examples, see [USER_GUIDE.md](./USER_GUIDE.md)
For technical implementation, see [TECHNICAL.md](./TECHNICAL.md)
