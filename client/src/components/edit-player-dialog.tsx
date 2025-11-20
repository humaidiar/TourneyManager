import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Player } from "@shared/schema";

const editPlayerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  skillCategory: z.enum(["Starter", "Intermediate", "Pro"]),
});

type EditPlayerFormData = z.infer<typeof editPlayerSchema>;

interface EditPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  onSubmit: (data: EditPlayerFormData) => void;
  isPending: boolean;
}

export default function EditPlayerDialog({
  open,
  onOpenChange,
  player,
  onSubmit,
  isPending,
}: EditPlayerDialogProps) {
  const form = useForm<EditPlayerFormData>({
    resolver: zodResolver(editPlayerSchema),
    defaultValues: {
      name: player.name,
      skillCategory: player.skillCategory,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: player.name,
        skillCategory: player.skillCategory,
      });
    }
  }, [open, player, form]);

  const handleSubmit = (data: EditPlayerFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>Update player information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter player name"
                      className="rounded-xl"
                      data-testid="input-edit-player-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skillCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl" data-testid="select-edit-skill">
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Starter">Starter</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={isPending}
                data-testid="button-save-player"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
