import { 
  users, 
  incidents, 
  audioRecordings, 
  educationalLessons,
  userProgress,
  greyRockScenarios,
  greyRockAttempts,
  boundaryTemplates,
  userBoundaries,
  boundaryViolations,
  type User, 
  type InsertUser, 
  type Incident, 
  type InsertIncident, 
  type AudioRecordingDb, 
  type InsertAudioRecording,
  type EducationalLesson,
  type UserProgress,
  type InsertUserProgress,
  type GreyRockScenario,
  type GreyRockAttempt,
  type InsertGreyRockAttempt,
  type BoundaryTemplate,
  type UserBoundary,
  type InsertUserBoundary,
  type BoundaryViolation,
  type InsertBoundaryViolation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getIncidents(userId: number): Promise<Incident[]>;
  getIncident(id: number, userId: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident & { userId: number }): Promise<Incident>;
  updateIncident(id: number, userId: number, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  deleteIncident(id: number, userId: number): Promise<boolean>;
  
  getAudioRecordings(incidentId: number): Promise<AudioRecordingDb[]>;
  createAudioRecording(recording: InsertAudioRecording): Promise<AudioRecordingDb>;
  deleteAudioRecording(id: number): Promise<boolean>;
  
  getIncidentStats(userId: number): Promise<{
    total: number;
    thisMonth: number;
    avgSafetyRating: number;
    totalAudioDuration: number;
    behaviorTypeDistribution: Record<string, number>;
    weeklyPattern: Record<string, number>;
  }>;

  // Educational Resources
  getEducationalLessons(): Promise<EducationalLesson[]>;
  getEducationalLesson(id: number): Promise<EducationalLesson | undefined>;
  getUserProgress(userId: number): Promise<UserProgress[]>;
  markLessonComplete(userId: number, lessonId: number, timeSpent: number): Promise<UserProgress>;

  // Grey Rock Simulator
  getGreyRockScenarios(): Promise<GreyRockScenario[]>;
  getGreyRockScenario(id: number): Promise<GreyRockScenario | undefined>;
  createGreyRockAttempt(attempt: InsertGreyRockAttempt): Promise<GreyRockAttempt>;
  getUserGreyRockAttempts(userId: number): Promise<GreyRockAttempt[]>;

  // Boundary Builder
  getBoundaryTemplates(): Promise<BoundaryTemplate[]>;
  getBoundaryTemplate(id: number): Promise<BoundaryTemplate | undefined>;
  getUserBoundaries(userId: number): Promise<UserBoundary[]>;
  createUserBoundary(boundary: InsertUserBoundary): Promise<UserBoundary>;
  updateUserBoundary(id: number, userId: number, boundary: Partial<InsertUserBoundary>): Promise<UserBoundary | undefined>;
  getBoundaryViolations(userId: number): Promise<BoundaryViolation[]>;
  createBoundaryViolation(violation: InsertBoundaryViolation): Promise<BoundaryViolation>;

  // Subscription Management
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  toggleSubscriptionPlanStatus(planId: number): Promise<SubscriptionPlan | undefined>;
  getUserSubscription(userId: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  getSubscriptionUsage(userId: number): Promise<{
    incidentsThisMonth: number;
    incidentLimit: number;
    lessonsCompleted: number;
    greyRockAttempts: number;
  }>;

  // Admin Functions
  getAdminMetrics(): Promise<AdminMetric | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getIncidents(userId: number): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.userId, userId))
      .orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: number, userId: number): Promise<Incident | undefined> {
    const [incident] = await db
      .select()
      .from(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)));
    return incident || undefined;
  }

  async createIncident(incidentData: InsertIncident & { userId: number }): Promise<Incident> {
    const [incident] = await db
      .insert(incidents)
      .values(incidentData)
      .returning();
    return incident;
  }

  async updateIncident(id: number, userId: number, incidentData: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [incident] = await db
      .update(incidents)
      .set(incidentData)
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)))
      .returning();
    return incident || undefined;
  }

  async deleteIncident(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)));
    return result.rowCount > 0;
  }

  async getAudioRecordings(incidentId: number): Promise<AudioRecordingDb[]> {
    return await db
      .select()
      .from(audioRecordings)
      .where(eq(audioRecordings.incidentId, incidentId))
      .orderBy(desc(audioRecordings.timestamp));
  }

  async createAudioRecording(recordingData: InsertAudioRecording): Promise<AudioRecordingDb> {
    const [recording] = await db
      .insert(audioRecordings)
      .values(recordingData)
      .returning();
    return recording;
  }

  async deleteAudioRecording(id: number): Promise<boolean> {
    const result = await db
      .delete(audioRecordings)
      .where(eq(audioRecordings.id, id));
    return result.rowCount > 0;
  }

  async getIncidentStats(userId: number): Promise<{
    total: number;
    thisMonth: number;
    avgSafetyRating: number;
    totalAudioDuration: number;
    behaviorTypeDistribution: Record<string, number>;
    weeklyPattern: Record<string, number>;
  }> {
    const userIncidents = await this.getIncidents(userId);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthIncidents = userIncidents.filter(incident => 
      new Date(incident.createdAt!) >= thisMonth
    );

    const behaviorTypeDistribution: Record<string, number> = {};
    const weeklyPattern: Record<string, number> = {};
    let totalSafetyRating = 0;
    let totalAudioDuration = 0;

    for (const incident of userIncidents) {
      // Behavior type distribution
      if (incident.behaviorType) {
        behaviorTypeDistribution[incident.behaviorType] = 
          (behaviorTypeDistribution[incident.behaviorType] || 0) + 1;
      }

      // Weekly pattern
      if (incident.createdAt) {
        const dayOfWeek = incident.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
        weeklyPattern[dayOfWeek] = (weeklyPattern[dayOfWeek] || 0) + 1;
      }

      // Safety rating
      if (incident.safetyRating) {
        totalSafetyRating += incident.safetyRating;
      }

      // Audio duration
      const audioFiles = await this.getAudioRecordings(incident.id);
      totalAudioDuration += audioFiles.reduce((sum, audio) => sum + audio.duration, 0);
    }

    return {
      total: userIncidents.length,
      thisMonth: thisMonthIncidents.length,
      avgSafetyRating: userIncidents.length > 0 ? totalSafetyRating / userIncidents.length : 0,
      totalAudioDuration,
      behaviorTypeDistribution,
      weeklyPattern
    };
  }

  // Educational Resources
  async getEducationalLessons(): Promise<EducationalLesson[]> {
    return await db.select().from(educationalLessons).orderBy(educationalLessons.category, educationalLessons.difficulty);
  }

  async getEducationalLesson(id: number): Promise<EducationalLesson | undefined> {
    const [lesson] = await db.select().from(educationalLessons).where(eq(educationalLessons.id, id));
    return lesson || undefined;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async markLessonComplete(userId: number, lessonId: number, timeSpent: number): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)));

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({ 
          completed: true, 
          completedAt: new Date(), 
          timeSpent 
        })
        .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
          timeSpent
        })
        .returning();
      return created;
    }
  }

  // Grey Rock Simulator
  async getGreyRockScenarios(): Promise<GreyRockScenario[]> {
    return await db.select().from(greyRockScenarios).orderBy(greyRockScenarios.difficulty, greyRockScenarios.category);
  }

  async getGreyRockScenario(id: number): Promise<GreyRockScenario | undefined> {
    const [scenario] = await db.select().from(greyRockScenarios).where(eq(greyRockScenarios.id, id));
    return scenario || undefined;
  }

  async createGreyRockAttempt(attempt: InsertGreyRockAttempt): Promise<GreyRockAttempt> {
    const [created] = await db
      .insert(greyRockAttempts)
      .values(attempt)
      .returning();
    return created;
  }

  async getUserGreyRockAttempts(userId: number): Promise<GreyRockAttempt[]> {
    return await db
      .select()
      .from(greyRockAttempts)
      .where(eq(greyRockAttempts.userId, userId))
      .orderBy(desc(greyRockAttempts.completedAt));
  }

  // Boundary Builder
  async getBoundaryTemplates(): Promise<BoundaryTemplate[]> {
    return await db.select().from(boundaryTemplates).orderBy(boundaryTemplates.category, boundaryTemplates.difficulty);
  }

  async getBoundaryTemplate(id: number): Promise<BoundaryTemplate | undefined> {
    const [template] = await db.select().from(boundaryTemplates).where(eq(boundaryTemplates.id, id));
    return template || undefined;
  }

  async getUserBoundaries(userId: number): Promise<UserBoundary[]> {
    return await db
      .select()
      .from(userBoundaries)
      .where(eq(userBoundaries.userId, userId))
      .orderBy(desc(userBoundaries.createdAt));
  }

  async createUserBoundary(boundary: InsertUserBoundary): Promise<UserBoundary> {
    const [created] = await db
      .insert(userBoundaries)
      .values(boundary)
      .returning();
    return created;
  }

  async updateUserBoundary(id: number, userId: number, boundary: Partial<InsertUserBoundary>): Promise<UserBoundary | undefined> {
    const [updated] = await db
      .update(userBoundaries)
      .set(boundary)
      .where(and(eq(userBoundaries.id, id), eq(userBoundaries.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async getBoundaryViolations(userId: number): Promise<BoundaryViolation[]> {
    return await db
      .select()
      .from(boundaryViolations)
      .where(eq(boundaryViolations.userId, userId))
      .orderBy(desc(boundaryViolations.createdAt));
  }

  async createBoundaryViolation(violation: InsertBoundaryViolation): Promise<BoundaryViolation> {
    const [created] = await db
      .insert(boundaryViolations)
      .values(violation)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();