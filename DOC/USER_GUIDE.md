# User Guide - Badminton Tournament Manager

Complete guide for using the Badminton Tournament Manager application.

## Table of Contents
- [Getting Started](#getting-started)
- [Sessions](#sessions)
- [Players](#players)
- [Match Generation](#match-generation)
- [Courts](#courts)
- [Active Matches](#active-matches)
- [Tips & Best Practices](#tips--best-practices)

## Getting Started

### First Time Setup

1. **Access the Application**
   - Open your web browser
   - Navigate to the application URL
   - You'll see the Sessions list page

2. **Choose Your Theme**
   - Click the theme toggle button (sun/moon icon) in the top-right corner
   - Switch between light and dark modes
   - Your preference is saved automatically

## Sessions

### Creating a New Session

1. Click **"Create New Session"** button on the home page
2. Fill in the session details:
   - **Session Name*** (required): e.g., "Monday Night Badminton"
   - **Description** (optional): e.g., "Weekly badminton games with friends"
   - **Location** (optional): e.g., "Community Sports Center"
3. Click **"Create Session"**
4. You'll be redirected to the session dashboard
5. Three courts are automatically created (Court 1, Court 2, Court 3)

### Viewing Sessions

- All sessions are listed on the home page
- Each session card shows:
  - Session name
  - Location (if provided)
  - Number of players
  - Number of active matches
  - Creation date
- Click **"View Session"** to open the dashboard

### Deleting a Session

1. Open the session dashboard
2. Click the **"Delete Session"** button
3. Confirm the deletion
4. All associated data (players, courts, matches) will be removed

### Resetting a Session

1. Open the session dashboard
2. Click the **"Reset Session"** button
3. Confirm the reset
4. All players and matches are deleted
5. Courts remain configured

## Players

### Understanding Player Status

Players can have three different statuses:

- **Queue**: Available and waiting to play
- **Playing**: Currently in an active match
- **Break**: Taking a break, not available for matches

### Adding Players

1. Click the **"Add"** button in the Players card
2. Fill in player information:
   - **Name*** (required): Player's full name
   - **Skill Level*** (required):
     - **Starter**: New to badminton
     - **Intermediate**: Regular player
     - **Pro**: Advanced/competitive player
   - **Gender*** (required): Male or Female
3. Click **"Add Player"**
4. Player appears in the Queue tab

### Navigating Player Tabs

Use the tab navigation to view different player groups:

- **Queue Tab**: Shows players waiting to play
  - Badge displays number of queued players
  - These players are available for match generation
  
- **Playing Tab**: Shows players in active matches
  - Badge displays number of playing players
  - Automatically updated when matches are generated/completed
  
- **Break Tab**: Shows players on break
  - Badge displays number of players on break
  - These players are excluded from match generation

### Changing Player Status

1. Find the player in any tab
2. Click on their card
3. Use the status dropdown to select:
   - Queue (back to waiting)
   - Playing (currently in a match)
   - Break (taking a rest)
4. Status updates immediately

### Editing Player Information

1. Click on a player card
2. Use the edit options to change:
   - Name
   - Skill level
   - Gender
3. Changes save automatically

### Deleting a Player

1. Click on a player card
2. Click the **"Delete"** button
3. Confirm deletion
4. Player is removed from the session

### Player Statistics

Each player card displays:
- Player name
- Skill level badge (color-coded)
- Gender
- Games played count
- Current status

## Match Generation

### Prerequisites

Before generating matches, ensure:
- At least **4 players** are in Queue status
- At least **1 court** is active
- You have selected a generation algorithm

### Selecting an Algorithm

Choose from five match generation algorithms:

#### 1. Balanced (Recommended)
- **Best for**: Competitive, fair games
- **How it works**: Pairs players based on skill level
- **Result**: Mixed skill teams for balanced competition
- Example: Pro + Starter vs Intermediate + Intermediate

#### 2. Non-Balanced
- **Best for**: Casual games, mixed skill groups
- **How it works**: Random pairing without skill consideration
- **Result**: Unpredictable match-ups
- Example: Any combination of players

#### 3. Gender-Based
- **Best for**: Mixed doubles events
- **How it works**: Creates male-female pairs
- **Result**: Each team has 1 male and 1 female
- Requires: Equal or near-equal male/female players

#### 4. Gender-Specific
- **Best for**: Men's or women's doubles
- **How it works**: Creates same-gender teams
- **Result**: All-male or all-female matches
- Example: Male + Male vs Male + Male

#### 5. Random
- **Best for**: Fun, casual sessions
- **How it works**: Completely random selection
- **Result**: Total randomization

### Generating Matches

1. Navigate to the Match Generation card
2. Select your preferred algorithm from the dropdown
3. Click **"Generate Matches"**
4. The system:
   - Selects 4 players per active court from Queue
   - Creates balanced teams based on algorithm
   - Assigns teams to courts
   - Updates player status to Playing
   - Increments games played counter

### Fair Player Rotation

The system ensures fair play by:
- Tracking games played for each player
- Prioritizing players with fewer games
- Preventing the same players from playing repeatedly
- Rotating players through Queue fairly

### Match Generation Errors

Common errors and solutions:

**"Not enough players in queue"**
- Solution: Need at least 4 players in Queue status
- Move players from Break to Queue

**"No active courts available"**
- Solution: Activate at least one court
- Toggle a court to active in Courts section

**"Not enough male/female players"**
- Only for Gender-Based algorithm
- Solution: Add more players or use different algorithm

## Courts

### Adding Courts

1. Click **"Add Court"** in the Courts card
2. Enter court name (e.g., "Court 4")
3. Court position is auto-assigned
4. Maximum: 5 courts per session

### Editing Court Names

1. Click on a court card
2. Edit the court name
3. Changes save automatically
4. Useful for: "Main Court", "Practice Court", etc.

### Activating/Deactivating Courts

1. Find the court card
2. Toggle the **Active/Inactive** switch
3. **Active courts**:
   - Green indicator
   - Used for match generation
   - Available for assignment
4. **Inactive courts**:
   - Gray indicator
   - Skipped during match generation
   - Useful for maintenance or unavailable courts

### Deleting Courts

1. Click on a court card
2. Click **"Delete Court"**
3. Confirm deletion
4. Cannot delete courts with active matches
5. Must complete or clear matches first

### Court Management Tips

- Keep at least 1 court active
- Deactivate courts during:
  - Maintenance
  - Court unavailability
  - Reducing match volume
- Reactivate courts to increase match capacity

## Active Matches

### Viewing Active Matches

The Active Matches section shows:
- Court assignment
- Team 1 composition (2 players)
- Team 2 composition (2 players)
- Player skill levels
- Match status

### Match Information

Each match card displays:
- **Court name**: Where the match is played
- **Team 1**: Two player names with skill badges
- **VS**: Versus indicator
- **Team 2**: Two player names with skill badges
- **Complete button**: To finish the match

### Completing a Match

1. Find the match card
2. Click **"Complete Match"**
3. The system automatically:
   - Marks match as completed
   - Updates player status to Queue
   - Makes players available for next round
   - Maintains games played statistics

### Match Completion Flow

When a match completes:
1. Both teams (4 players) return to Queue tab
2. Court becomes available for new matches
3. Games played count remains updated
4. Players ready for next match generation

## Tips & Best Practices

### Session Management

- **Descriptive Names**: Use clear session names like "Tuesday 7PM - Advanced Players"
- **Location Details**: Include gym name, court numbers, or specific areas
- **Reset vs Delete**: 
  - Reset: Keep courts, remove players/matches
  - Delete: Remove everything

### Player Management

- **Skill Categories**: Be consistent with skill assessments
- **Status Updates**: Move players to Break if they need rest
- **Queue Management**: Keep Queue populated for smooth match flow

### Match Generation

- **Algorithm Selection**:
  - Start with Balanced for fairness
  - Use Gender-Based for social events
  - Try Random for fun variety
- **Timing**: Generate matches between rounds, not during play
- **Player Count**: More players = better rotation and less waiting

### Court Utilization

- **Activate All**: Use all courts to maximize play time
- **Deactivate Strategically**: Reduce courts if player count is low
- **Naming**: Use descriptive names for easy identification

### Efficient Workflows

1. **Pre-Session**:
   - Create session
   - Add all expected players
   - Configure courts

2. **During Session**:
   - Generate first round of matches
   - Complete matches as they finish
   - Generate next round
   - Move tired players to Break

3. **Post-Session**:
   - Keep session for next time
   - Or reset to clear match history

### Common Scenarios

**Scenario: Player Arrives Late**
1. Add player to session
2. Player starts in Queue
3. Will be included in next match generation

**Scenario: Player Needs Break**
1. Find player in Playing or Queue
2. Change status to Break
3. Player excluded from match generation
4. Move back to Queue when ready

**Scenario: Court Becomes Unavailable**
1. Complete active match on that court
2. Toggle court to Inactive
3. Future matches skip that court

**Scenario: Uneven Gender Distribution**
- Use Balanced or Non-Balanced algorithms
- Avoid Gender-Based if ratio is very uneven
- Random works with any gender mix

**Scenario: New Players Only**
- Set all skill levels to Starter
- Use Balanced algorithm for fair matches
- Monitor and adjust skill levels as needed

## Keyboard Shortcuts

While the app doesn't have specific keyboard shortcuts, you can use:
- **Tab**: Navigate between form fields
- **Enter**: Submit forms
- **Esc**: Close dialogs

## Mobile Usage

The app is fully responsive:
- Touch-friendly buttons and cards
- Swipe-friendly tabs
- Optimized layouts for small screens
- All features available on mobile

## Troubleshooting

### Players Not Appearing in Match Generation
- Check player status (must be in Queue)
- Verify at least 4 players in Queue
- Ensure players aren't in Break status

### Matches Not Generating
- Confirm at least 1 active court
- Check player count (minimum 4 in Queue)
- For Gender-Based: verify gender distribution

### Court Changes Not Reflecting
- Refresh the page
- Check if match is active on that court
- Complete active matches first

## Getting Help

If you encounter issues:
1. Check this user guide
2. Review error messages carefully
3. Try refreshing the page
4. Check browser console for errors
5. Contact support with specific details

## Best Practices Summary

✅ **DO:**
- Keep player statuses updated
- Use descriptive session names
- Choose appropriate match algorithms
- Complete matches promptly
- Maintain accurate skill levels

❌ **DON'T:**
- Delete sessions with active matches
- Leave players in Playing status indefinitely
- Generate matches with insufficient players
- Deactivate all courts
- Forget to update player statuses

---

Enjoy organizing your badminton tournaments! 🏸
