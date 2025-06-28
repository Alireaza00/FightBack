import { users, incidents, audioRecordings, type User, type InsertUser, type Incident, type InsertIncident, type AudioRecordingDb, type InsertAudioRecording } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incidents: Map<number, Incident>;
  private audioRecordings: Map<number, AudioRecordingDb>;
  private currentUserId: number;
  private currentIncidentId: number;
  private currentAudioId: number;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.audioRecordings = new Map();
    this.currentUserId = 1;
    this.currentIncidentId = 1;
    this.currentAudioId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getIncidents(userId: number): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getIncident(id: number, userId: number): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    return incident?.userId === userId ? incident : undefined;
  }

  async createIncident(incidentData: InsertIncident & { userId: number }): Promise<Incident> {
    const id = this.currentIncidentId++;
    const incident: Incident = {
      ...incidentData,
      id,
      createdAt: new Date(),
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async updateIncident(id: number, userId: number, incidentData: Partial<InsertIncident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident || incident.userId !== userId) {
      return undefined;
    }
    
    const updated = { ...incident, ...incidentData };
    this.incidents.set(id, updated);
    return updated;
  }

  async deleteIncident(id: number, userId: number): Promise<boolean> {
    const incident = this.incidents.get(id);
    if (!incident || incident.userId !== userId) {
      return false;
    }
    
    this.incidents.delete(id);
    // Delete associated audio recordings
    Array.from(this.audioRecordings.entries()).forEach(([audioId, recording]) => {
      if (recording.incidentId === id) {
        this.audioRecordings.delete(audioId);
      }
    });
    
    return true;
  }

  async getAudioRecordings(incidentId: number): Promise<AudioRecordingDb[]> {
    return Array.from(this.audioRecordings.values())
      .filter(recording => recording.incidentId === incidentId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async createAudioRecording(recordingData: InsertAudioRecording): Promise<AudioRecordingDb> {
    const id = this.currentAudioId++;
    const recording: AudioRecordingDb = {
      ...recordingData,
      id,
      timestamp: new Date(),
    };
    this.audioRecordings.set(id, recording);
    return recording;
  }

  async deleteAudioRecording(id: number): Promise<boolean> {
    return this.audioRecordings.delete(id);
  }

  async getIncidentStats(userId: number): Promise<{
    total: number;
    thisMonth: number;
    avgSafetyRating: number;
    totalAudioDuration: number;
    behaviorTypeDistribution: Record<string, number>;
    weeklyPattern: Record<string, number>;
  }> {
    const userIncidents = Array.from(this.incidents.values())
      .filter(incident => incident.userId === userId);
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthIncidents = userIncidents.filter(
      incident => new Date(incident.createdAt!) >= firstDayOfMonth
    );

    const safetyRatings = userIncidents
      .map(incident => incident.safetyRating)
      .filter(rating => rating !== null && rating !== undefined) as number[];
    
    const avgSafetyRating = safetyRatings.length > 0 
      ? safetyRatings.reduce((sum, rating) => sum + rating, 0) / safetyRatings.length
      : 0;

    const behaviorTypeDistribution: Record<string, number> = {};
    userIncidents.forEach(incident => {
      behaviorTypeDistribution[incident.behaviorType] = 
        (behaviorTypeDistribution[incident.behaviorType] || 0) + 1;
    });

    const weeklyPattern: Record<string, number> = {
      'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0,
      'Friday': 0, 'Saturday': 0, 'Sunday': 0
    };
    
    userIncidents.forEach(incident => {
      const date = new Date(incident.createdAt!);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      weeklyPattern[dayName] = (weeklyPattern[dayName] || 0) + 1;
    });

    const totalAudioDuration = Array.from(this.audioRecordings.values())
      .filter(recording => {
        const incident = this.incidents.get(recording.incidentId);
        return incident?.userId === userId;
      })
      .reduce((total, recording) => total + recording.duration, 0);

    return {
      total: userIncidents.length,
      thisMonth: thisMonthIncidents.length,
      avgSafetyRating: Math.round(avgSafetyRating * 10) / 10,
      totalAudioDuration,
      behaviorTypeDistribution,
      weeklyPattern
    };
  }
}

export const storage = new MemStorage();
