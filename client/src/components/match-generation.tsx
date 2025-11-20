import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Session, Player, Court, MatchMode } from "@shared/schema";

interface MatchGenerationProps {
  sessionId: string;
  session: Session;
  players: Player[];
  courts: Court[];
}

const matchModeDescriptions: Record<MatchMode, string> = {
  balanced: "Pair high-skill with low-skill players for competitive matches",
  "non-balanced": "Group similar skill levels together",
  "gender-based": "Create mixed doubles (2 males + 2 females per match)",
  "gender-specific": "Create male-only or female-only matches",
  random: "Randomly shuffle players for variety",
};

export default function MatchGeneration({
  sessionId,
  session,
  players,
  courts,
}: MatchGenerationProps) {
  const [selectedMode, setSelectedMode] = useState<MatchMode>(session.defaultMatchMode as MatchMode || "balanced");

  const activeCourts = courts.filter((c) => c.isActive);
  const availablePlayers = players.filter((p) => p.status === "Queue");

  const canGenerate = activeCourts.length > 0 && availablePlayers.length >= 4;
  const maxMatches = Math.min(activeCourts.length, Math.floor(availablePlayers.length / 4));

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Generate Matches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="match-mode">Match Generation Mode</Label>
          <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as MatchMode)}>
            <SelectTrigger className="rounded-xl" data-testid="select-match-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="gender-based">Gender-Based</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {matchModeDescriptions[selectedMode]}
          </p>
        </div>

        <Alert className="rounded-xl">
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="text-sm space-y-1">
              <p><strong>{availablePlayers.length}</strong> players in queue</p>
              <p><strong>{activeCourts.length}</strong> active courts</p>
              {canGenerate && (
                <p className="text-primary">Can generate up to <strong>{maxMatches}</strong> matches</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
