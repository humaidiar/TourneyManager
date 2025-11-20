import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Player } from "@shared/schema";

interface SwapPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlayer: Player;
  availablePlayers: Player[];
  onSwap: (targetPlayerId: string) => void;
  isPending?: boolean;
}

export default function SwapPlayerDialog({
  open,
  onOpenChange,
  currentPlayer,
  availablePlayers,
  onSwap,
  isPending = false,
}: SwapPlayerDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleSwap = () => {
    if (selectedPlayerId) {
      onSwap(selectedPlayerId);
      setSelectedPlayerId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Player</DialogTitle>
          <DialogDescription>
            Select a player to swap with {currentPlayer.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {availablePlayers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No players available to swap
              </p>
            ) : (
              availablePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all hover-elevate ${
                    selectedPlayerId === player.id
                      ? "border-primary bg-accent"
                      : "border-border bg-card"
                  }`}
                  data-testid={`swap-player-option-${player.id}`}
                >
                  <div className="font-medium text-sm mb-1">{player.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{player.gender}</span>
                    <span>•</span>
                    <span>{player.skillCategory}</span>
                    <span>•</span>
                    <span>{player.gamesPlayed} games</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedPlayerId(null);
            }}
            className="flex-1 rounded-full"
            disabled={isPending}
            data-testid="button-cancel-swap"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSwap}
            className="flex-1 rounded-full"
            disabled={!selectedPlayerId || isPending}
            data-testid="button-confirm-swap"
          >
            {isPending ? "Swapping..." : "Swap"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
