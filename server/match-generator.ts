import type { Player, Court, MatchMode } from "@shared/schema";

interface Team {
  player1: Player;
  player2: Player;
}

interface GeneratedMatch {
  court: Court;
  team1: Team;
  team2: Team;
}

export function generateMatches(
  players: Player[],
  courts: Court[],
  mode: MatchMode
): GeneratedMatch[] {
  const activeCourts = courts.filter((c) => c.isActive);
  const availablePlayers = [...players].filter((p) => p.status === "Queue");

  if (activeCourts.length === 0 || availablePlayers.length < 4) {
    throw new Error("Need at least 4 players in queue and 1 active court");
  }

  // Sort players by games played (fair rotation)
  availablePlayers.sort((a, b) => a.gamesPlayed - b.gamesPlayed);

  const matches: GeneratedMatch[] = [];
  const maxMatches = Math.min(activeCourts.length, Math.floor(availablePlayers.length / 4));

  for (let i = 0; i < maxMatches; i++) {
    const court = activeCourts[i];
    const poolStart = i * 4;
    const fourPlayers = availablePlayers.slice(poolStart, poolStart + 4);

    if (fourPlayers.length !== 4) break;

    const teams = createTeams(fourPlayers, mode);
    if (teams) {
      matches.push({
        court,
        team1: teams.team1,
        team2: teams.team2,
      });
    }
  }

  return matches;
}

function createTeams(
  fourPlayers: Player[],
  mode: MatchMode
): { team1: Team; team2: Team } | null {
  switch (mode) {
    case "balanced":
      return balancedTeams(fourPlayers);
    case "gender-based":
      return genderBasedTeams(fourPlayers);
    case "random":
      return randomTeams(fourPlayers);
    default:
      return randomTeams(fourPlayers);
  }
}

function balancedTeams(players: Player[]): { team1: Team; team2: Team } {
  // Sort by skill level: Starter (0), Intermediate (1), Pro (2)
  const skillValue = (p: Player) => {
    if (p.skillCategory === "Starter") return 0;
    if (p.skillCategory === "Intermediate") return 1;
    return 2;
  };

  const sorted = [...players].sort((a, b) => skillValue(b) - skillValue(a));

  // Pair high with low: Best + Worst vs 2nd Best + 2nd Worst
  return {
    team1: { player1: sorted[0], player2: sorted[3] },
    team2: { player1: sorted[1], player2: sorted[2] },
  };
}

function genderBasedTeams(players: Player[]): { team1: Team; team2: Team } | null {
  const males = players.filter((p) => p.gender === "Male");
  const females = players.filter((p) => p.gender === "Female");

  // Prioritize mixed doubles: 2 males + 2 females
  if (males.length === 2 && females.length === 2) {
    return {
      team1: { player1: males[0], player2: females[0] },
      team2: { player1: males[1], player2: females[1] },
    };
  }

  // All-female matches if we have 4 females
  if (females.length === 4) {
    return {
      team1: { player1: females[0], player2: females[1] },
      team2: { player1: females[2], player2: females[3] },
    };
  }

  // All-male matches if we have 4 males
  if (males.length === 4) {
    return {
      team1: { player1: males[0], player2: males[1] },
      team2: { player1: males[2], player2: males[3] },
    };
  }

  // Handle 3 females + 1 male: Create F+F vs F+M
  if (females.length === 3 && males.length === 1) {
    return {
      team1: { player1: females[0], player2: females[1] },
      team2: { player1: females[2], player2: males[0] },
    };
  }

  // Handle 3 males + 1 female: Create M+M vs M+F
  if (males.length === 3 && females.length === 1) {
    return {
      team1: { player1: males[0], player2: males[1] },
      team2: { player1: males[2], player2: females[0] },
    };
  }

  // Fall back to random for other combinations
  return randomTeams(players);
}

function randomTeams(players: Player[]): { team1: Team; team2: Team } {
  // Fisher-Yates shuffle
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    team1: { player1: shuffled[0], player2: shuffled[1] },
    team2: { player1: shuffled[2], player2: shuffled[3] },
  };
}
