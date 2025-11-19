import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import PlayerManagement from "@/components/player-management";
import MatchGeneration from "@/components/match-generation";
import ActiveMatches from "@/components/active-matches";
import CourtConfiguration from "@/components/court-configuration";
import SessionActions from "@/components/session-actions";
import type { Session, Player, Court, Match } from "@shared/schema";

export default function SessionDashboard() {
  const [, params] = useRoute("/sessions/:id");
  const [, setLocation] = useLocation();
  const sessionId = params?.id;

  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/sessions", sessionId, "players"],
    enabled: !!sessionId,
  });

  const { data: courts = [], isLoading: courtsLoading } = useQuery<Court[]>({
    queryKey: ["/api/sessions", sessionId, "courts"],
    enabled: !!sessionId,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/sessions", sessionId, "matches"],
    enabled: !!sessionId,
  });

  const isLoading = sessionLoading || playersLoading || courtsLoading || matchesLoading;

  if (!sessionId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session not found</h2>
          <Button onClick={() => setLocation("/")} className="rounded-full">
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const queuePlayers = players.filter((p) => p.status === "Queue");
  const playingPlayers = players.filter((p) => p.status === "Playing");
  const breakPlayers = players.filter((p) => p.status === "Break");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="rounded-full"
                data-testid="button-back-to-sessions"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{session.name}</h1>
                {session.location && (
                  <p className="text-sm text-muted-foreground">{session.location}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SessionActions sessionId={sessionId} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Player Management */}
          <div className="lg:col-span-1">
            <PlayerManagement
              sessionId={sessionId}
              players={players}
              queuePlayers={queuePlayers}
              playingPlayers={playingPlayers}
              breakPlayers={breakPlayers}
            />
          </div>

          {/* Middle Column - Match Generation & Active Matches */}
          <div className="lg:col-span-1 space-y-6">
            <MatchGeneration
              sessionId={sessionId}
              session={session}
              players={queuePlayers}
              courts={courts}
            />
            <ActiveMatches sessionId={sessionId} matches={matches} players={players} />
          </div>

          {/* Right Column - Court Configuration */}
          <div className="lg:col-span-1">
            <CourtConfiguration sessionId={sessionId} session={session} courts={courts} />
          </div>
        </div>
      </div>
    </div>
  );
}
