import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for type safety
export const skillCategoryEnum = pgEnum('skill_category', ['Starter', 'Intermediate', 'Pro']);
export const genderEnum = pgEnum('gender', ['Male', 'Female', 'Other']);
export const playerStatusEnum = pgEnum('player_status', ['Queue', 'Playing', 'Break']);
export const matchModeEnum = pgEnum('match_mode', ['balanced', 'non-balanced', 'gender-based', 'gender-specific', 'random']);
export const matchStatusEnum = pgEnum('match_status', ['pending', 'in-progress', 'completed']);

// Sessions table
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastPlayedAt: timestamp("last_played_at"),
  defaultCourts: integer("default_courts").notNull().default(3),
  defaultMatchMode: matchModeEnum("default_match_mode").notNull().default('balanced'),
});

// Players table
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  skillCategory: skillCategoryEnum("skill_category").notNull().default('Intermediate'),
  gender: genderEnum("gender").notNull().default('Male'),
  gamesPlayed: integer("games_played").notNull().default(0),
  status: playerStatusEnum("status").notNull().default('Queue'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Courts table
export const courts = pgTable("courts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  defaultName: text("default_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  position: integer("position").notNull(),
});

// Matches table
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  courtId: varchar("court_id").notNull().references(() => courts.id, { onDelete: 'cascade' }),
  courtName: text("court_name").notNull(),
  team1Player1Id: varchar("team1_player1_id").notNull().references(() => players.id),
  team1Player2Id: varchar("team1_player2_id").notNull().references(() => players.id),
  team2Player1Id: varchar("team2_player1_id").notNull().references(() => players.id),
  team2Player2Id: varchar("team2_player2_id").notNull().references(() => players.id),
  status: matchStatusEnum("status").notNull().default('pending'),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

// Relations
export const sessionsRelations = relations(sessions, ({ many }) => ({
  players: many(players),
  courts: many(courts),
  matches: many(matches),
}));

export const playersRelations = relations(players, ({ one }) => ({
  session: one(sessions, {
    fields: [players.sessionId],
    references: [sessions.id],
  }),
}));

export const courtsRelations = relations(courts, ({ one }) => ({
  session: one(sessions, {
    fields: [courts.sessionId],
    references: [sessions.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  session: one(sessions, {
    fields: [matches.sessionId],
    references: [sessions.id],
  }),
  court: one(courts, {
    fields: [matches.courtId],
    references: [courts.id],
  }),
  team1Player1: one(players, {
    fields: [matches.team1Player1Id],
    references: [players.id],
  }),
  team1Player2: one(players, {
    fields: [matches.team1Player2Id],
    references: [players.id],
  }),
  team2Player1: one(players, {
    fields: [matches.team2Player1Id],
    references: [players.id],
  }),
  team2Player2: one(players, {
    fields: [matches.team2Player2Id],
    references: [players.id],
  }),
}));

// Insert schemas with proper defaults
export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  lastPlayedAt: true,
}).extend({
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  defaultCourts: z.number().int().min(1).max(5).default(3),
  defaultMatchMode: z.enum(['balanced', 'non-balanced', 'gender-based', 'gender-specific', 'random']).default('balanced'),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
}).extend({
  skillCategory: z.enum(['Starter', 'Intermediate', 'Pro']).default('Intermediate'),
  gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
  gamesPlayed: z.number().int().min(0).default(0),
  status: z.enum(['Queue', 'Playing', 'Break']).default('Queue'),
});

export const insertCourtSchema = createInsertSchema(courts).omit({
  id: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  generatedAt: true,
});

// Types
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Court = typeof courts.$inferSelect;
export type InsertCourt = z.infer<typeof insertCourtSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// Additional types for frontend
export type SkillCategory = 'Starter' | 'Intermediate' | 'Pro';
export type Gender = 'Male' | 'Female' | 'Other';
export type PlayerStatus = 'Queue' | 'Playing' | 'Break';
export type MatchMode = 'balanced' | 'non-balanced' | 'gender-based' | 'gender-specific' | 'random';
export type MatchStatus = 'pending' | 'in-progress' | 'completed';
