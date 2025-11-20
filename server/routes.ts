import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertPlayerSchema, insertCourtSchema, insertMatchSchema } from "@shared/schema";
import { generateMatches } from "./match-generator";
import type { MatchMode } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== SESSIONS ====================

  // Get all sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);

      // Create default courts for the session
      const defaultCourtCount = validatedData.defaultCourts || 3;
      for (let i = 1; i <= defaultCourtCount; i++) {
        await storage.createCourt({
          sessionId: session.id,
          name: `Court ${i}`,
          defaultName: `Court ${i}`,
          isActive: true,
          position: i,
        });
      }

      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update session
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete session
  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      await storage.deleteSession(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reset session
  app.post("/api/sessions/:id/reset", async (req, res) => {
    try {
      await storage.resetSession(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate matches
  app.post("/api/sessions/:id/generate-matches", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const { mode } = req.body as { mode: MatchMode };

      const players = await storage.getPlayers(sessionId);
      const courts = await storage.getCourts(sessionId);

      const generatedMatches = generateMatches(players, courts, mode);

      const createdMatches = [];
      for (const match of generatedMatches) {
        const createdMatch = await storage.createMatch({
          sessionId,
          courtId: match.court.id,
          courtName: match.court.name,
          team1Player1Id: match.team1.player1.id,
          team1Player2Id: match.team1.player2.id,
          team2Player1Id: match.team2.player1.id,
          team2Player2Id: match.team2.player2.id,
          status: "pending",
        });
        createdMatches.push(createdMatch);

        // Update player status to Playing and increment games played (fetch fresh data)
        const p1 = await storage.getPlayer(match.team1.player1.id);
        const p2 = await storage.getPlayer(match.team1.player2.id);
        const p3 = await storage.getPlayer(match.team2.player1.id);
        const p4 = await storage.getPlayer(match.team2.player2.id);

        if (p1) await storage.updatePlayer(p1.id, { status: "Playing", gamesPlayed: p1.gamesPlayed + 1 });
        if (p2) await storage.updatePlayer(p2.id, { status: "Playing", gamesPlayed: p2.gamesPlayed + 1 });
        if (p3) await storage.updatePlayer(p3.id, { status: "Playing", gamesPlayed: p3.gamesPlayed + 1 });
        if (p4) await storage.updatePlayer(p4.id, { status: "Playing", gamesPlayed: p4.gamesPlayed + 1 });
      }

      // Update session lastPlayedAt
      await storage.updateSession(sessionId, { lastPlayedAt: new Date() });

      res.json(createdMatches);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== PLAYERS ====================

  // Get players for a session
  app.get("/api/sessions/:id/players", async (req, res) => {
    try {
      const players = await storage.getPlayers(req.params.id);
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create player
  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.json(player);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update player
  app.patch("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.updatePlayer(req.params.id, req.body);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete player
  app.delete("/api/players/:id", async (req, res) => {
    try {
      await storage.deletePlayer(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Swap two players' status
  app.post("/api/players/swap", async (req, res) => {
    try {
      const { player1Id, player2Id } = req.body;
      
      if (!player1Id || !player2Id) {
        return res.status(400).json({ message: "Both player IDs are required" });
      }

      const player1 = await storage.getPlayer(player1Id);
      const player2 = await storage.getPlayer(player2Id);

      if (!player1 || !player2) {
        return res.status(404).json({ message: "One or both players not found" });
      }

      // Swap their statuses
      const player1Status = player1.status;
      const player2Status = player2.status;

      await storage.updatePlayer(player1Id, { status: player2Status });
      await storage.updatePlayer(player2Id, { status: player1Status });

      res.json({ success: true, player1, player2 });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== COURTS ====================

  // Get courts for a session
  app.get("/api/sessions/:id/courts", async (req, res) => {
    try {
      const courts = await storage.getCourts(req.params.id);
      res.json(courts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create court
  app.post("/api/courts", async (req, res) => {
    try {
      const validatedData = insertCourtSchema.parse(req.body);
      const court = await storage.createCourt(validatedData);
      res.json(court);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update court
  app.patch("/api/courts/:id", async (req, res) => {
    try {
      const court = await storage.updateCourt(req.params.id, req.body);
      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }
      res.json(court);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete court
  app.delete("/api/courts/:id", async (req, res) => {
    try {
      await storage.deleteCourt(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== MATCHES ====================

  // Get matches for a session
  app.get("/api/sessions/:id/matches", async (req, res) => {
    try {
      const matches = await storage.getMatches(req.params.id);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update match
  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // If completing match, move players back to queue
      if (req.body.status === "completed") {
        await storage.updatePlayer(match.team1Player1Id, { status: "Queue" });
        await storage.updatePlayer(match.team1Player2Id, { status: "Queue" });
        await storage.updatePlayer(match.team2Player1Id, { status: "Queue" });
        await storage.updatePlayer(match.team2Player2Id, { status: "Queue" });
      }

      const updatedMatch = await storage.updateMatch(req.params.id, req.body);
      res.json(updatedMatch);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete match (cancel)
  app.delete("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Move players back to queue and decrement games played
      const player1 = await storage.getPlayer(match.team1Player1Id);
      const player2 = await storage.getPlayer(match.team1Player2Id);
      const player3 = await storage.getPlayer(match.team2Player1Id);
      const player4 = await storage.getPlayer(match.team2Player2Id);

      if (player1) {
        await storage.updatePlayer(player1.id, {
          status: "Queue",
          gamesPlayed: Math.max(0, player1.gamesPlayed - 1),
        });
      }
      if (player2) {
        await storage.updatePlayer(player2.id, {
          status: "Queue",
          gamesPlayed: Math.max(0, player2.gamesPlayed - 1),
        });
      }
      if (player3) {
        await storage.updatePlayer(player3.id, {
          status: "Queue",
          gamesPlayed: Math.max(0, player3.gamesPlayed - 1),
        });
      }
      if (player4) {
        await storage.updatePlayer(player4.id, {
          status: "Queue",
          gamesPlayed: Math.max(0, player4.gamesPlayed - 1),
        });
      }

      await storage.deleteMatch(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complete all matches for a session
  app.post("/api/sessions/:id/complete-all-matches", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const matches = await storage.getMatches(sessionId);
      const activeMatches = matches.filter((m) => m.status === "pending" || m.status === "in-progress");

      // Complete all active matches
      for (const match of activeMatches) {
        await storage.updateMatch(match.id, { status: "completed" });

        // Move players back to queue
        await storage.updatePlayer(match.team1Player1Id, { status: "Queue" });
        await storage.updatePlayer(match.team1Player2Id, { status: "Queue" });
        await storage.updatePlayer(match.team2Player1Id, { status: "Queue" });
        await storage.updatePlayer(match.team2Player2Id, { status: "Queue" });
      }

      res.json({ success: true, completedCount: activeMatches.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
