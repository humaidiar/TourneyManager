import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Session, Court, InsertCourt } from "@shared/schema";

interface CourtConfigurationProps {
  sessionId: string;
  session: Session;
  courts: Court[];
}

export default function CourtConfiguration({ sessionId, session, courts }: CourtConfigurationProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();

  const addCourtMutation = useMutation({
    mutationFn: async () => {
      const position = courts.length + 1;
      const courtData: InsertCourt = {
        sessionId,
        name: `Court ${position}`,
        defaultName: `Court ${position}`,
        isActive: true,
        position,
      };
      return await apiRequest("POST", "/api/courts", courtData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "courts"] });
      toast({
        title: "Court added",
        description: "New court has been added successfully.",
      });
    },
  });

  const updateCourtMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Court> }) => {
      return await apiRequest("PATCH", `/api/courts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "courts"] });
      setEditingId(null);
    },
  });

  const deleteCourtMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/courts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "courts"] });
      toast({
        title: "Court removed",
        description: "Court has been removed.",
      });
    },
  });

  const startEdit = (court: Court) => {
    setEditingId(court.id);
    setEditName(court.name);
  };

  const saveEdit = (courtId: string) => {
    if (editName.trim()) {
      updateCourtMutation.mutate({ id: courtId, data: { name: editName.trim() } });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const toggleActive = (court: Court) => {
    updateCourtMutation.mutate({ id: court.id, data: { isActive: !court.isActive } });
  };

  const sortedCourts = [...courts].sort((a, b) => a.position - b.position);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Court Configuration</CardTitle>
        <Button
          size="sm"
          onClick={() => addCourtMutation.mutate()}
          disabled={courts.length >= 5 || addCourtMutation.isPending}
          className="rounded-full"
          data-testid="button-add-court"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedCourts.length > 0 ? (
          sortedCourts.map((court) => (
            <div
              key={court.id}
              className="flex items-center gap-3 p-3 rounded-xl border bg-card"
              data-testid={`card-court-${court.id}`}
            >
              <Switch
                checked={court.isActive}
                onCheckedChange={() => toggleActive(court)}
                data-testid={`switch-court-active-${court.id}`}
              />

              <div className="flex-1">
                {editingId === court.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 rounded-lg"
                    data-testid={`input-court-name-${court.id}`}
                    autoFocus
                  />
                ) : (
                  <Label className="font-medium text-sm">{court.name}</Label>
                )}
              </div>

              <div className="flex items-center gap-1">
                {editingId === court.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveEdit(court.id)}
                      className="h-8 w-8 rounded-full"
                      data-testid={`button-save-court-${court.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEdit}
                      className="h-8 w-8 rounded-full"
                      data-testid={`button-cancel-edit-court-${court.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(court)}
                      className="h-8 w-8 rounded-full"
                      data-testid={`button-edit-court-${court.id}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCourtMutation.mutate(court.id)}
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                      data-testid={`button-delete-court-${court.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No courts configured. Add a court to get started.
            </p>
          </div>
        )}

        {courts.length >= 5 && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum of 5 courts reached
          </p>
        )}
      </CardContent>
    </Card>
  );
}
