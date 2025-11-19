import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match, Player } from "@shared/schema";

interface ActiveMatchesProps {
  sessionId: string;
  matches: Match[];
  players: Player[];
}

export default function ActiveMatches({ sessionId, matches, players }: ActiveMatchesProps) {
  const { toast } = useToast();

  const pendingMatches = matches.filter((m) => m.status === "pending" || m.status === "in-progress");

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || "Unknown";
  };

  const completeMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return await apiRequest("PATCH", `/api/matches/${matchId}`, { status: "completed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      toast({
        title: "Match completed",
        description: "Match has been marked as completed.",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return await apiRequest("DELETE", `/api/matches/${matchId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      toast({
        title: "Match cancelled",
        description: "Match has been cancelled.",
      });
    },
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Active Matches</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingMatches.length > 0 ? (
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 rounded-xl border bg-card space-y-3"
                data-testid={`card-match-${match.id}`}
              >
                <div className="flex items-center justify-between">
                  <Badge className="rounded-full bg-primary text-primary-foreground">
                    {match.courtName}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {match.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium mb-1">Team 1</p>
                      <p className="text-sm">{getPlayerName(match.team1Player1Id)}</p>
                      <p className="text-sm">{getPlayerName(match.team1Player2Id)}</p>
                    </div>
                    <span className="text-muted-foreground font-semibold">vs</span>
                    <div className="flex-1 p-2 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium mb-1">Team 2</p>
                      <p className="text-sm">{getPlayerName(match.team2Player1Id)}</p>
                      <p className="text-sm">{getPlayerName(match.team2Player2Id)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelMutation.mutate(match.id)}
                    disabled={cancelMutation.isPending}
                    className="flex-1 rounded-full"
                    data-testid={`button-cancel-match-${match.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => completeMutation.mutate(match.id)}
                    disabled={completeMutation.isPending}
                    className="flex-1 rounded-full"
                    data-testid={`button-complete-match-${match.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shuffle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No active matches. Generate matches to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Shuffle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
      <path d="m18 14 4 4-4 4" />
    </svg>
  );
}
