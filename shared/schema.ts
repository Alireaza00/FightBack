import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  behaviorType: text("behavior_type").notNull(),
  description: text("description").notNull(),
  feelings: text("feelings"),
  impact: text("impact"),
  moodBefore: text("mood_before"),
  moodAfter: text("mood_after"),
  safetyRating: integer("safety_rating"),
  transcription: text("transcription"),
  audioRecordings: jsonb("audio_recordings").$type<AudioRecording[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audioRecordings = pgTable("audio_recordings", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").notNull(),
  filename: text("filename").notNull(),
  duration: integer("duration").notNull(), // in seconds
  timestamp: timestamp("timestamp").defaultNow(),
  transcription: text("transcription"),
});

export type AudioRecording = {
  id: string;
  filename: string;
  duration: number;
  timestamp: string;
  transcription?: string;
};

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  safetyRating: z.number().min(1).max(5).optional(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAudioRecordingSchema = createInsertSchema(audioRecordings).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertAudioRecording = z.infer<typeof insertAudioRecordingSchema>;
export type AudioRecordingDb = typeof audioRecordings.$inferSelect;

export const behaviorTypes = [
  "gaslighting",
  "love-bombing", 
  "triangulation",
  "silent-treatment",
  "projection",
  "emotional-manipulation",
  "financial-abuse",
  "isolation",
  "verbal-abuse",
  "other"
] as const;

export const moodOptions = [
  "calm",
  "happy", 
  "anxious",
  "sad",
  "angry",
  "confused"
] as const;
