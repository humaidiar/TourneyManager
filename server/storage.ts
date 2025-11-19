// Reference: javascript_database blueprint integration
import { sessions, players, courts, matches, type Session, type Player, type Court, type Match, type InsertSession, type InsertPlayer, type InsertCourt, type InsertMatch } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Sessions
  getSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, data: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  resetSession(id: string): Promise<void>;

  // Players
  getPlayers(sessionId: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<void>;

  // Courts
  getCourts(sessionId: string): Promise<Court[]>;
  getCourt(id: string): Promise<Court | undefined>;
  createCourt(court: InsertCourt): Promise<Court>;
  updateCourt(id: string, data: Partial<Court>): Promise<Court | undefined>;
  deleteCourt(id: string): Promise<void>;

  // Matches
  getMatches(sessionId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Sessions
  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async resetSession(id: string): Promise<void> {
    // Reset all players to queue and reset games played
    await db
      .update(players)
      .set({ status: "Queue", gamesPlayed: 0 })
      .where(eq(players.sessionId, id));

    // Delete all matches
    await db.delete(matches).where(eq(matches.sessionId, id));
  }

  // Players
  async getPlayers(sessionId: string): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.sessionId, sessionId));
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(data)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async deletePlayer(id: string): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  // Courts
  async getCourts(sessionId: string): Promise<Court[]> {
    return await db.select().from(courts).where(eq(courts.sessionId, sessionId));
  }

  async getCourt(id: string): Promise<Court | undefined> {
    const [court] = await db.select().from(courts).where(eq(courts.id, id));
    return court || undefined;
  }

  async createCourt(insertCourt: InsertCourt): Promise<Court> {
    const [court] = await db.insert(courts).values(insertCourt).returning();
    return court;
  }

  async updateCourt(id: string, data: Partial<Court>): Promise<Court | undefined> {
    const [court] = await db
      .update(courts)
      .set(data)
      .where(eq(courts.id, id))
      .returning();
    return court || undefined;
  }

  async deleteCourt(id: string): Promise<void> {
    await db.delete(courts).where(eq(courts.id, id));
  }

  // Matches
  async getMatches(sessionId: string): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.sessionId, sessionId)).orderBy(desc(matches.generatedAt));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set(data)
      .where(eq(matches.id, id))
      .returning();
    return match || undefined;
  }

  async deleteMatch(id: string): Promise<void> {
    await db.delete(matches).where(eq(matches.id, id));
  }
}

export const storage = new DatabaseStorage();
