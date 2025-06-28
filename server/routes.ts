import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, insertAudioRecordingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all incidents for current user (mock user id = 1 for demo)
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getIncidents(1);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  // Get specific incident
  app.get("/api/incidents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.getIncident(id, 1);
      
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  });

  // Create new incident
  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident({ ...validatedData, userId: 1 });
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create incident" });
    }
  });

  // Update incident
  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIncidentSchema.partial().parse(req.body);
      const incident = await storage.updateIncident(id, 1, validatedData);
      
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      
      res.json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update incident" });
    }
  });

  // Delete incident
  app.delete("/api/incidents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteIncident(id, 1);
      
      if (!success) {
        return res.status(404).json({ error: "Incident not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete incident" });
    }
  });

  // Get audio recordings for incident
  app.get("/api/incidents/:id/audio", async (req, res) => {
    try {
      const incidentId = parseInt(req.params.id);
      const recordings = await storage.getAudioRecordings(incidentId);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audio recordings" });
    }
  });

  // Add audio recording to incident
  app.post("/api/incidents/:id/audio", async (req, res) => {
    try {
      const incidentId = parseInt(req.params.id);
      const validatedData = insertAudioRecordingSchema.parse({
        ...req.body,
        incidentId
      });
      
      const recording = await storage.createAudioRecording(validatedData);
      res.status(201).json(recording);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create audio recording" });
    }
  });

  // Delete audio recording
  app.delete("/api/audio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAudioRecording(id);
      
      if (!success) {
        return res.status(404).json({ error: "Audio recording not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete audio recording" });
    }
  });

  // Get incident statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getIncidentStats(1);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // OpenRouter API proxy for AI analysis
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || "";
      
      if (!apiKey) {
        return res.status(400).json({ error: "OpenRouter API key not configured" });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.REPLIT_DOMAIN || "localhost",
        },
        body: JSON.stringify({
          model: "google/gemini-pro",
          messages: [
            {
              role: "system",
              content: "You are a compassionate AI assistant helping someone document and understand patterns of abuse. Provide supportive, non-judgmental responses focused on safety and healing."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json({ analysis: data.choices[0].message.content });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  // Speech-to-text transcription
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioData } = req.body;
      // Mock transcription - in real implementation would use OpenRouter or speech-to-text service
      res.json({ 
        transcription: "Transcription functionality would be implemented with actual audio processing." 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });

  // Export data endpoints
  app.get("/api/export/pdf", async (req, res) => {
    try {
      const incidents = await storage.getIncidents(1);
      // Mock PDF generation
      res.json({ 
        message: "PDF export would be implemented here",
        incidents: incidents.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export PDF" });
    }
  });

  app.get("/api/export/csv", async (req, res) => {
    try {
      const incidents = await storage.getIncidents(1);
      // Mock CSV generation
      res.json({ 
        message: "CSV export would be implemented here",
        incidents: incidents.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Educational Resources endpoints
  app.get("/api/educational/lessons", async (req, res) => {
    try {
      const lessons = await storage.getEducationalLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.get("/api/educational/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.getEducationalLesson(id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  app.get("/api/educational/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(1);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/educational/complete/:lessonId", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const { timeSpent } = req.body;
      const progress = await storage.markLessonComplete(1, lessonId, timeSpent || 0);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark lesson complete" });
    }
  });

  // Grey Rock Simulator endpoints
  app.get("/api/greyrock/scenarios", async (req, res) => {
    try {
      const scenarios = await storage.getGreyRockScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  app.get("/api/greyrock/scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scenario = await storage.getGreyRockScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenario" });
    }
  });

  app.post("/api/greyrock/attempts", async (req, res) => {
    try {
      const { scenarioId, userResponse, aiScore, aiFeedback } = req.body;
      const attempt = await storage.createGreyRockAttempt({
        userId: 1,
        scenarioId,
        userResponse,
        aiScore,
        aiFeedback
      });
      res.status(201).json(attempt);
    } catch (error) {
      res.status(500).json({ error: "Failed to create attempt" });
    }
  });

  app.get("/api/greyrock/attempts", async (req, res) => {
    try {
      const attempts = await storage.getUserGreyRockAttempts(1);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });

  // Boundary Builder endpoints
  app.get("/api/boundaries/templates", async (req, res) => {
    try {
      const templates = await storage.getBoundaryTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch boundary templates" });
    }
  });

  app.get("/api/boundaries/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getBoundaryTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.get("/api/boundaries", async (req, res) => {
    try {
      const boundaries = await storage.getUserBoundaries(1);
      res.json(boundaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user boundaries" });
    }
  });

  app.post("/api/boundaries", async (req, res) => {
    try {
      const { templateId, customBoundary, category } = req.body;
      const boundary = await storage.createUserBoundary({
        userId: 1,
        templateId,
        customBoundary,
        category
      });
      res.status(201).json(boundary);
    } catch (error) {
      res.status(500).json({ error: "Failed to create boundary" });
    }
  });

  app.put("/api/boundaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const boundary = await storage.updateUserBoundary(id, 1, updates);
      if (!boundary) {
        return res.status(404).json({ error: "Boundary not found" });
      }
      res.json(boundary);
    } catch (error) {
      res.status(500).json({ error: "Failed to update boundary" });
    }
  });

  app.get("/api/boundaries/violations", async (req, res) => {
    try {
      const violations = await storage.getBoundaryViolations(1);
      res.json(violations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch violations" });
    }
  });

  app.post("/api/boundaries/violations", async (req, res) => {
    try {
      const { boundaryId, description, severity, emotionalImpact, actionTaken } = req.body;
      const violation = await storage.createBoundaryViolation({
        userId: 1,
        boundaryId,
        description,
        severity,
        emotionalImpact,
        actionTaken
      });
      res.status(201).json(violation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create violation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
