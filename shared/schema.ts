import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  feelings: text("feelings").default(""),
  impact: text("impact").default(""),
  moodBefore: text("mood_before").default(""),
  moodAfter: text("mood_after").default(""),
  safetyRating: integer("safety_rating"),
  transcription: text("transcription").default(""),
  audioRecordings: jsonb("audio_recordings").$type<AudioRecording[]>().default([]),
  photos: jsonb("photos").$type<PhotoAttachment[]>().default([]),
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

export type PhotoAttachment = {
  id: string;
  filename: string;
  caption: string;
  timestamp: string;
  size: number;
  type: string;
  dataUrl?: string;
};

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  safetyRating: z.number().min(1).max(5).optional(),
  photos: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    caption: z.string(),
    timestamp: z.string(),
    size: z.number(),
    type: z.string(),
    dataUrl: z.string().optional(),
  })).optional(),
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
  "intimidation",
  "controlling-behavior",
  "jealousy-monitoring",
  "other"
] as const;

export const behaviorTypeDescriptions: Record<string, {
  title: string;
  description: string;
  examples: string[];
  keywords: string[];
}> = {
  "gaslighting": {
    title: "Gaslighting",
    description: "Making you question your memory, perception, or sanity",
    examples: ["'That never happened'", "'You're being too sensitive'", "'You're imagining things'"],
    keywords: ["memory", "crazy", "imagining", "sensitive", "overreacting"]
  },
  "love-bombing": {
    title: "Love-bombing",
    description: "Excessive affection followed by withdrawal or manipulation",
    examples: ["Overwhelming gifts then coldness", "Intense attention then ignoring", "Perfect partner then criticism"],
    keywords: ["gifts", "perfect", "intense", "overwhelming", "then cold"]
  },
  "triangulation": {
    title: "Triangulation", 
    description: "Bringing other people into conflicts to make you jealous or insecure",
    examples: ["Comparing you to others", "Flirting to make you jealous", "Getting others to side against you"],
    keywords: ["comparing", "jealous", "flirting", "other people", "ex"]
  },
  "silent-treatment": {
    title: "Silent Treatment",
    description: "Ignoring you, refusing to communicate, or shutting you out",
    examples: ["Not responding to texts", "Acting like you don't exist", "Giving cold shoulder"],
    keywords: ["ignoring", "silent", "not talking", "cold", "shutting out"]
  },
  "projection": {
    title: "Projection",
    description: "Accusing you of things they are actually doing themselves",
    examples: ["Accusing you of cheating while they cheat", "Calling you controlling", "Saying you're manipulative"],
    keywords: ["accusing", "you always", "you never", "hypocrite"]
  },
  "emotional-manipulation": {
    title: "Emotional Manipulation",
    description: "Using guilt, shame, or fear to control your actions",
    examples: ["'If you loved me, you would...'", "Threatening self-harm", "Making you feel guilty"],
    keywords: ["guilt", "if you loved me", "threatening", "your fault"]
  },
  "financial-abuse": {
    title: "Financial Abuse",
    description: "Controlling your money, access to funds, or financial decisions",
    examples: ["Taking your paycheck", "Hiding money", "Preventing you from working", "Running up debt"],
    keywords: ["money", "paycheck", "work", "debt", "credit card", "spending"]
  },
  "isolation": {
    title: "Isolation",
    description: "Cutting you off from friends, family, or support systems",
    examples: ["'Your friends don't like me'", "Preventing visits", "Moving you away", "Monitoring contacts"],
    keywords: ["friends", "family", "visit", "contact", "alone", "isolate"]
  },
  "verbal-abuse": {
    title: "Verbal Abuse",
    description: "Name-calling, yelling, threats, or degrading language",
    examples: ["Calling you names", "Screaming at you", "Put-downs", "Threats of violence"],
    keywords: ["yelling", "screaming", "stupid", "worthless", "threatening", "name calling"]
  },
  "intimidation": {
    title: "Intimidation",
    description: "Using physical presence, objects, or threats to scare you",
    examples: ["Getting in your face", "Breaking things", "Aggressive driving", "Threatening gestures"],
    keywords: ["scary", "breaking things", "aggressive", "threatening", "intimidating"]
  },
  "controlling-behavior": {
    title: "Controlling Behavior",
    description: "Dictating what you can do, wear, say, or where you can go",
    examples: ["Telling you what to wear", "Checking your phone", "Deciding for you", "Setting rules"],
    keywords: ["controlling", "rules", "permission", "checking phone", "what to wear"]
  },
  "jealousy-monitoring": {
    title: "Jealousy & Monitoring",
    description: "Excessive jealousy and monitoring your activities or relationships",
    examples: ["Checking your phone/email", "Following you", "Interrogating about your day", "Tracking location"],
    keywords: ["jealous", "checking", "following", "tracking", "where were you", "who were you with"]
  },
  "other": {
    title: "Other Concerning Behavior",
    description: "Other patterns that don't fit the above categories but feel wrong",
    examples: ["Trust your instincts", "Something feels off", "Pattern you can't name"],
    keywords: ["feels wrong", "uncomfortable", "strange", "concerning"]
  }
} as const;

export const moodOptions = [
  "calm",
  "happy", 
  "anxious",
  "sad",
  "angry",
  "confused"
] as const;

// Educational Resources Schema
export const educationalLessons = pgTable("educational_lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // narcissistic-abuse, trauma-bonds, manipulation-tactics
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // estimated reading time in minutes
  tags: text("tags").array().default([]),
  keyTakeaways: text("key_takeaways").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => educationalLessons.id).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  rating: integer("rating"), // 1-5 stars
  notes: text("notes"),
});

// Grey Rock Simulator Schema
export const greyRockScenarios = pgTable("grey_rock_scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  provocativeMessage: text("provocative_message").notNull(),
  goodResponses: text("good_responses").array().notNull(),
  badResponses: text("bad_responses").array().notNull(),
  tips: text("tips").array().default([]),
  category: text("category").notNull(), // work, family, partner, ex-partner
});

export const greyRockAttempts = pgTable("grey_rock_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scenarioId: integer("scenario_id").references(() => greyRockScenarios.id).notNull(),
  userResponse: text("user_response").notNull(),
  aiScore: integer("ai_score"), // 1-100 score from AI
  aiFeedback: text("ai_feedback"),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

// Boundary Builder Schema
export const boundaryTemplates = pgTable("boundary_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // personal, emotional, physical, digital, financial
  template: text("template").notNull(),
  example: text("example").notNull(),
  difficulty: text("difficulty").notNull(), // easy, moderate, challenging
  tags: text("tags").array().default([]),
});

export const userBoundaries = pgTable("user_boundaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateId: integer("template_id").references(() => boundaryTemplates.id),
  customBoundary: text("custom_boundary").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastViolated: timestamp("last_violated"),
  violationCount: integer("violation_count").default(0),
  notes: text("notes"),
});

export const boundaryViolations = pgTable("boundary_violations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  boundaryId: integer("boundary_id").references(() => userBoundaries.id).notNull(),
  incidentId: integer("incident_id").references(() => incidents.id),
  description: text("description").notNull(),
  severity: integer("severity").notNull(), // 1-5 scale
  violatedAt: timestamp("violated_at").defaultNow().notNull(),
  actionTaken: text("action_taken"),
});

// Type exports for new schemas
export type EducationalLesson = typeof educationalLessons.$inferSelect;
export type InsertEducationalLesson = typeof educationalLessons.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
export type GreyRockScenario = typeof greyRockScenarios.$inferSelect;
export type InsertGreyRockScenario = typeof greyRockScenarios.$inferInsert;
export type GreyRockAttempt = typeof greyRockAttempts.$inferSelect;
export type InsertGreyRockAttempt = typeof greyRockAttempts.$inferInsert;
export type BoundaryTemplate = typeof boundaryTemplates.$inferSelect;
export type InsertBoundaryTemplate = typeof boundaryTemplates.$inferInsert;
export type UserBoundary = typeof userBoundaries.$inferSelect;
export type InsertUserBoundary = typeof userBoundaries.$inferInsert;
export type BoundaryViolation = typeof boundaryViolations.$inferSelect;
export type InsertBoundaryViolation = typeof boundaryViolations.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  incidents: many(incidents),
  userProgress: many(userProgress),
  greyRockAttempts: many(greyRockAttempts),
  userBoundaries: many(userBoundaries),
  boundaryViolations: many(boundaryViolations),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  user: one(users, { fields: [incidents.userId], references: [users.id] }),
  audioRecordings: many(audioRecordings),
}));

export const audioRecordingsRelations = relations(audioRecordings, ({ one }) => ({
  incident: one(incidents, { fields: [audioRecordings.incidentId], references: [incidents.id] }),
}));

export const educationalLessonsRelations = relations(educationalLessons, ({ many }) => ({
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  lesson: one(educationalLessons, { fields: [userProgress.lessonId], references: [educationalLessons.id] }),
}));

export const greyRockScenariosRelations = relations(greyRockScenarios, ({ many }) => ({
  attempts: many(greyRockAttempts),
}));

export const greyRockAttemptsRelations = relations(greyRockAttempts, ({ one }) => ({
  user: one(users, { fields: [greyRockAttempts.userId], references: [users.id] }),
  scenario: one(greyRockScenarios, { fields: [greyRockAttempts.scenarioId], references: [greyRockScenarios.id] }),
}));

export const boundaryTemplatesRelations = relations(boundaryTemplates, ({ many }) => ({
  userBoundaries: many(userBoundaries),
}));

export const userBoundariesRelations = relations(userBoundaries, ({ one, many }) => ({
  user: one(users, { fields: [userBoundaries.userId], references: [users.id] }),
  template: one(boundaryTemplates, { fields: [userBoundaries.templateId], references: [boundaryTemplates.id] }),
  violations: many(boundaryViolations),
}));

export const boundaryViolationsRelations = relations(boundaryViolations, ({ one }) => ({
  user: one(users, { fields: [boundaryViolations.userId], references: [users.id] }),
  boundary: one(userBoundaries, { fields: [boundaryViolations.boundaryId], references: [userBoundaries.id] }),
}));
