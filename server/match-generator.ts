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
  const others = players.filter((p) => p.gender === "Other");

  // Priority 1: Mixed doubles (2M + 2F)
  if (males.length === 2 && females.length === 2) {
    return {
      team1: { player1: males[0], player2: females[0] },
      team2: { player1: males[1], player2: females[1] },
    };
  }

  // Priority 2: Same-gender matches (4M or 4F)
  if (males.length === 4) {
    return {
      team1: { player1: males[0], player2: males[1] },
      team2: { player1: males[2], player2: males[3] },
    };
  }

  if (females.length === 4) {
    return {
      team1: { player1: females[0], player2: females[1] },
      team2: { player1: females[2], player2: females[3] },
    };
  }

  // Priority 3: Majority gender with one minority (3M+1F or 3F+1M)
  if (males.length === 3 && females.length === 1) {
    return {
      team1: { player1: males[0], player2: males[1] },
      team2: { player1: males[2], player2: females[0] },
    };
  }

  if (females.length === 3 && males.length === 1) {
    return {
      team1: { player1: females[0], player2: females[1] },
      team2: { player1: females[2], player2: males[0] },
    };
  }

  // Priority 4: Handle "Other" gender players as wildcards
  if (others.length > 0) {
    // 4 Others: Pair them together
    if (others.length === 4) {
      return {
        team1: { player1: others[0], player2: others[1] },
        team2: { player1: others[2], player2: others[3] },
      };
    }

    // 3 Others + 1 Male/Female: Pair Others together, minority with an Other
    if (others.length === 3 && males.length === 1) {
      return {
        team1: { player1: others[0], player2: others[1] },
        team2: { player1: others[2], player2: males[0] },
      };
    }

    if (others.length === 3 && females.length === 1) {
      return {
        team1: { player1: others[0], player2: others[1] },
        team2: { player1: others[2], player2: females[0] },
      };
    }

    // 2 Others + 2 Males/Females: Pair each gender with an Other
    if (others.length === 2 && males.length === 2) {
      return {
        team1: { player1: males[0], player2: others[0] },
        team2: { player1: males[1], player2: others[1] },
      };
    }

    if (others.length === 2 && females.length === 2) {
      return {
        team1: { player1: females[0], player2: others[0] },
        team2: { player1: females[1], player2: others[1] },
      };
    }

    // 2 Others + 1 Male + 1 Female: Create balanced mixed teams with Others
    if (others.length === 2 && males.length === 1 && females.length === 1) {
      return {
        team1: { player1: males[0], player2: others[0] },
        team2: { player1: females[0], player2: others[1] },
      };
    }

    // 1 Other + 3 Males: Pair Males together, one Male with Other
    if (others.length === 1 && males.length === 3) {
      return {
        team1: { player1: males[0], player2: males[1] },
        team2: { player1: males[2], player2: others[0] },
      };
    }

    // 1 Other + 3 Females: Pair Females together, one Female with Other
    if (others.length === 1 && females.length === 3) {
      return {
        team1: { player1: females[0], player2: females[1] },
        team2: { player1: females[2], player2: others[0] },
      };
    }

    // 1 Other + 2 Males + 1 Female: Create balanced mixed with Other as wildcard
    if (others.length === 1 && males.length === 2 && females.length === 1) {
      return {
        team1: { player1: males[0], player2: females[0] },
        team2: { player1: males[1], player2: others[0] },
      };
    }

    // 1 Other + 2 Females + 1 Male: Create balanced mixed with Other as wildcard
    if (others.length === 1 && females.length === 2 && males.length === 1) {
      return {
        team1: { player1: females[0], player2: males[0] },
        team2: { player1: females[1], player2: others[0] },
      };
    }
  }

  // Fallback: This should never be reached with valid 4-player input
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
