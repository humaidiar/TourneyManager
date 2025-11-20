import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import EditSessionDialog from "@/components/edit-session-dialog";
import type { Session } from "@shared/schema";

export default function SessionsList() {
  const [, setLocation] = useLocation();
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
            Badminton Tournament Manager
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Organize your games, manage players, and track matches with ease
          </p>
          
          <Link href="/sessions/new">
            <Button 
              size="lg" 
              className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
              data-testid="button-create-session"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Session
            </Button>
          </Link>
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div key={session.id}>
                <Card 
                  className="relative rounded-2xl hover-elevate active-elevate-2 transition-all cursor-pointer h-full"
                  data-testid={`card-session-${session.id}`}
                  onClick={() => setLocation(`/sessions/${session.id}`)}
                >
                  <EditSessionDialog session={session} />
                  <CardHeader className="pb-3 pr-14">
                    <CardTitle className="text-xl font-semibold">
                      {session.name}
                    </CardTitle>
                    {session.description && (
                      <CardDescription className="line-clamp-2">
                        {session.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {session.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {session.lastPlayedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          Last played {new Date(session.lastPlayedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto max-w-md">
              <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first session to start organizing badminton games
              </p>
              <Link href="/sessions/new">
                <Button className="rounded-full px-6" data-testid="button-create-first-session">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
