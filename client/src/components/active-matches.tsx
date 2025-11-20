import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Shuffle as ShuffleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Match, Player, Court, Session } from "@shared/schema";

interface ActiveMatchesProps {
  sessionId: string;
  session: Session;
  matches: Match[];
  players: Player[];
  courts: Court[];
}

export default function ActiveMatches({ sessionId, session, matches, players, courts }: ActiveMatchesProps) {
  const { toast } = useToast();
  const pendingMatches = matches.filter((m) => m.status === "pending" || m.status === "in-progress");
  const queuePlayers = players.filter((p) => p.status === "Queue");
  const activeCourts = courts.filter((c) => c.isActive);

  const completeAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/complete-all-matches`, {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      toast({
        title: "All matches completed",
        description: `${data.completedCount} ${data.completedCount === 1 ? "match" : "matches"} completed. All players returned to queue.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/generate-matches`, {
        mode: session.defaultMatchMode || "balanced",
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      const matchCount = Array.isArray(data) ? data.length : 0;
      toast({
        title: "Matches generated",
        description: `${matchCount} ${matchCount === 1 ? "match" : "matches"} created successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const canGenerateMatches = queuePlayers.length >= 4 && activeCourts.length > 0;

  const getPlayer = (playerId: string) => {
    return players.find((p) => p.id === playerId);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Active Matches</h2>
          {pendingMatches.length > 0 && (
            <Badge variant="secondary" className="rounded-full text-base px-4 py-1">
              {pendingMatches.length} {pendingMatches.length === 1 ? "match" : "matches"}
            </Badge>
          )}
        </div>
        {pendingMatches.length > 0 ? (
          <Button
            onClick={() => completeAllMutation.mutate()}
            disabled={completeAllMutation.isPending}
            className="rounded-full"
            variant="default"
            data-testid="button-complete-all-matches"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {completeAllMutation.isPending ? "Completing..." : "Complete All Matches"}
          </Button>
        ) : (
          <Button
            onClick={() => generateMatchesMutation.mutate()}
            disabled={!canGenerateMatches || generateMatchesMutation.isPending}
            className="rounded-full"
            variant="default"
            data-testid="button-generate-matches-quick"
          >
            <ShuffleIcon className="w-4 h-4 mr-2" />
            {generateMatchesMutation.isPending ? "Generating..." : "Generate Matches"}
          </Button>
        )}
      </div>

      {/* Matches Grid */}
      {pendingMatches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingMatches.map((match) => {
            const team1Player1 = getPlayer(match.team1Player1Id);
            const team1Player2 = getPlayer(match.team1Player2Id);
            const team2Player1 = getPlayer(match.team2Player1Id);
            const team2Player2 = getPlayer(match.team2Player2Id);

            return (
              <Card
                key={match.id}
                className="rounded-2xl overflow-hidden hover-elevate"
                data-testid={`card-match-${match.id}`}
              >
                <CardHeader className="pb-4 bg-primary/5">
                  <CardTitle className="text-2xl font-bold text-foreground text-center">
                    {match.courtName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Team 1 */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Team 1
                      </p>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-foreground">
                          {team1Player1?.name || "Unknown"}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {team1Player2?.name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        vs
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Team 2 */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Team 2
                      </p>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-foreground">
                          {team2Player1?.name || "Unknown"}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {team2Player2?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shuffle className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">
                No active matches. Generate matches to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
