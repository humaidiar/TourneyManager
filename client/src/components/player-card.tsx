import { useMutation } from "@tanstack/react-query";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EditPlayerDialog from "./edit-player-dialog";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  sessionId: string;
}

const skillColors = {
  Starter: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Intermediate: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Pro: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const statusOptions = ["Queue", "Playing", "Break"] as const;

export default function PlayerCard({ player, sessionId }: PlayerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/players/${player.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: { name: string; skillCategory: string }) => {
      return await apiRequest("PATCH", `/api/players/${player.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      toast({
        title: "Player updated",
        description: "Player information has been updated successfully.",
      });
      setShowEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update player. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/players/${player.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "players"] });
      toast({
        title: "Player removed",
        description: `${player.name} has been removed.`,
      });
      setShowDeleteDialog(false);
    },
  });

  return (
    <>
      <div
        className="group flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover-elevate transition-all"
        data-testid={`card-player-${player.id}`}
      >
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h4 className="font-medium text-sm truncate">{player.name}</h4>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{player.gender}</span>
            <span>•</span>
            <span>{player.gamesPlayed} games</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid={`button-player-menu-${player.id}`}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem
              onClick={() => setShowEditDialog(true)}
              data-testid="menu-item-edit"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Player
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {statusOptions.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => updateStatusMutation.mutate(status)}
                disabled={player.status === status}
                data-testid={`menu-item-status-${status.toLowerCase()}`}
              >
                Move to {status}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
              data-testid="menu-item-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Player
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditPlayerDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        player={player}
        onSubmit={(data) => updatePlayerMutation.mutate(data)}
        isPending={updatePlayerMutation.isPending}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {player.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
