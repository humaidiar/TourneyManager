# Badminton Tournament Manager

A modern, full-stack web application for managing badminton tournaments and social games with real-time player tracking, intelligent match generation, and court management.

## Overview

The Badminton Tournament Manager is designed to help organizers run smooth badminton sessions by automating match generation, tracking player availability, and managing court allocations. Built with React, TypeScript, and PostgreSQL, it provides a beautiful, responsive interface with dark mode support.

## Key Features

### Session Management
- Create and manage multiple badminton sessions
- Track session details (name, location, description)
- Auto-create default courts (3 courts by default)
- Session reset and delete functionality

### Player Management
- Add players with skill categories (Starter, Intermediate, Pro)
- Track gender for gender-based match algorithms
- Monitor player status (Queue, Playing, Break)
- View games played statistics
- Tabbed interface for easy navigation between player groups

### Intelligent Match Generation
Five sophisticated algorithms to create balanced matches:
1. **Balanced** - Pairs players based on skill level for competitive matches
2. **Non-Balanced** - Random pairing without skill consideration
3. **Gender-Based** - Creates mixed-gender doubles matches
4. **Gender-Specific** - Generates same-gender doubles matches
5. **Random** - Completely random player selection

### Court Management
- Configure 1-5 courts per session
- Toggle courts active/inactive
- Automatic court allocation for matches
- Real-time court status updates

### Match Tracking
- View active matches with team compositions
- Complete matches to update player statistics
- Fair player rotation system
- Prevents player favoritism through games-played tracking

### User Experience
- Beautiful rounded design system
- Dark mode support with theme toggle
- Responsive mobile-friendly interface
- Real-time updates with React Query
- Toast notifications for all actions

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/humaidiar/TourneyManager.git
cd TourneyManager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5000`

## Usage

### Creating a Session
1. Click "Create New Session" on the home page
2. Enter session details (name, location, description)
3. Click "Create Session"
4. Three courts are automatically created

### Adding Players
1. Navigate to your session dashboard
2. Click the "Add" button in the Players card
3. Enter player details:
   - Name
   - Skill level (Starter/Intermediate/Pro)
   - Gender (Male/Female)
4. Players start in the Queue tab

### Generating Matches
1. Ensure you have at least 4 players in Queue status
2. Select a match generation algorithm
3. Click "Generate Matches"
4. Matches appear in the Active Matches section
5. Players automatically move to Playing status

### Managing Matches
1. View active matches with team compositions
2. Click "Complete Match" when finished
3. Players return to Queue automatically
4. Statistics update (games played count)

### Court Configuration
1. Navigate to the Courts card
2. Click "Add Court" to create new courts (up to 5 total)
3. Toggle courts active/inactive as needed
4. Edit court names for easy identification

## Technology Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui component library
- Wouter for routing
- TanStack Query for state management

### Backend
- Express.js REST API
- TypeScript throughout
- Drizzle ORM for database access
- Zod for validation

### Database
- PostgreSQL via Neon serverless
- Drizzle migrations
- Cascade delete for data integrity

## Documentation

- [User Guide](./USER_GUIDE.md) - Detailed usage instructions
- [Technical Documentation](./TECHNICAL.md) - Architecture and implementation details
- [API Documentation](./API.md) - REST API reference
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

## Project Status

✅ **Production Ready**
- All critical bugs resolved
- Comprehensive E2E testing completed
- Database schema validated
- Theme system fully functional
- Match generation algorithms working correctly
- Fair player rotation implemented

## Known Limitations

- No user authentication (suitable for single-organizer or trusted-group scenarios)
- All sessions are publicly accessible
- No real-time WebSocket updates

## Future Enhancements

- User authentication and session ownership
- Real-time updates via WebSockets
- Mobile app version
- Advanced analytics and player statistics
- Tournament bracket generation
- Player rating system
- Match history and replay

## Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style
- All tests pass
- Documentation is updated
- Commits are descriptive

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Credits

Built with modern web technologies and inspired by Linear's design system for a clean, efficient user experience.
