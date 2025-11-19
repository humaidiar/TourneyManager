import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InsertPlayer } from "@shared/schema";

interface AddPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onSubmit: (data: InsertPlayer) => void;
  isPending: boolean;
}

export default function AddPlayerDialog({
  open,
  onOpenChange,
  sessionId,
  onSubmit,
  isPending,
}: AddPlayerDialogProps) {
  const [formData, setFormData] = useState<Omit<InsertPlayer, "sessionId">>({
    name: "",
    skillCategory: "Intermediate",
    gender: "Male",
    gamesPlayed: 0,
    status: "Queue",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, sessionId });
    setFormData({
      name: "",
      skillCategory: "Intermediate",
      gender: "Male",
      gamesPlayed: 0,
      status: "Queue",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
          <DialogDescription>Add a new player to this session</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Name *</Label>
            <Input
              id="player-name"
              placeholder="Player name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
              data-testid="input-player-name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill-category">Skill Level *</Label>
              <Select
                value={formData.skillCategory}
                onValueChange={(value) => setFormData({ ...formData, skillCategory: value })}
              >
                <SelectTrigger className="rounded-xl" data-testid="select-skill-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="rounded-xl" data-testid="select-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full"
              data-testid="button-cancel-add-player"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full"
              disabled={isPending}
              data-testid="button-submit-add-player"
            >
              {isPending ? "Adding..." : "Add Player"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
