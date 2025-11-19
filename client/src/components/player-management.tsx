import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PlayerCard from "./player-card";
import AddPlayerDialog from "./add-player-dialog";
import type { Player, InsertPlayer } from "@shared/schema";

interface PlayerManagementProps {
  sessionId: string;
  players: Player[];
  queuePlayers: Player[];
  playingPlayers: Player[];
  breakPlayers: Player[];
}

export default function PlayerManagement({
  sessionId,
  players,
  queuePlayers,
  playingPlayers,
  breakPlayers,
}: PlayerManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const addPlayerMutation = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      return await apiRequest("POST", "/api/players", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      setShowAddDialog(false);
      toast({
        title: "Player added",
        description: "Player has been added successfully.",
      });
    },
  });

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Players</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="rounded-full"
            data-testid="button-add-player"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Queue Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Queue</h3>
              <Badge variant="secondary" className="rounded-full">
                {queuePlayers.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {queuePlayers.length > 0 ? (
                queuePlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} sessionId={sessionId} />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No players in queue
                </div>
              )}
            </div>
          </div>

          {/* Playing Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Playing</h3>
              <Badge variant="default" className="rounded-full bg-primary">
                {playingPlayers.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {playingPlayers.length > 0 ? (
                playingPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} sessionId={sessionId} />
                ))
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No players currently playing
                </div>
              )}
            </div>
          </div>

          {/* Break Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Break</h3>
              <Badge variant="outline" className="rounded-full">
                {breakPlayers.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {breakPlayers.length > 0 ? (
                breakPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} sessionId={sessionId} />
                ))
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No players on break
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPlayerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        sessionId={sessionId}
        onSubmit={(data) => addPlayerMutation.mutate(data)}
        isPending={addPlayerMutation.isPending}
      />
    </>
  );
}
