// OpenRouter API integration for AI analysis and transcription

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AnalysisRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

export interface AnalysisResponse {
  analysis: string;
  confidence?: number;
  suggestions?: string[];
}

export class OpenRouterAPI {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    this.model = config.model || 'google/gemini-pro';
  }

  async analyzeIncidents(prompt: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Analysis API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        analysis: data.analysis,
        confidence: 0.8, // Mock confidence score
        suggestions: [
          "Consider documenting patterns with timestamps",
          "Reach out to support resources if you feel unsafe",
          "Review safety planning strategies"
        ]
      };
    } catch (error) {
      console.error('OpenRouter analysis error:', error);
      throw new Error('Failed to generate AI analysis');
    }
  }

  async summarizeEntries(entries: any[]): Promise<string> {
    const prompt = `Please analyze these incident entries and provide a compassionate summary of patterns, focusing on safety and healing:

${entries.map((entry, index) => `
Entry ${index + 1}:
- Date: ${entry.date}
- Type: ${entry.behaviorType}
- Description: ${entry.description}
- Safety Rating: ${entry.safetyRating}/5
- Feelings: ${entry.feelings}
`).join('\n')}

Please provide:
1. A summary of behavior patterns
2. Safety concerns or trends
3. Supportive recommendations for moving forward

Keep the tone supportive and non-judgmental.`;

    const result = await this.analyzeIncidents(prompt);
    return result.analysis;
  }

  async generateCopiingStrategies(behaviorType: string, feelings: string): Promise<string[]> {
    const prompt = `Based on experiencing ${behaviorType} behavior and feeling ${feelings}, please suggest 3-5 healthy coping strategies that prioritize safety and self-care.`;

    try {
      const result = await this.analyzeIncidents(prompt);
      // Parse suggestions from the analysis text
      return result.suggestions || [
        "Practice grounding techniques (5-4-3-2-1 method)",
        "Reach out to trusted friends or support groups",
        "Document incidents for your own clarity",
        "Consider professional counseling support",
        "Prioritize your physical and emotional safety"
      ];
    } catch (error) {
      console.error('Coping strategies generation error:', error);
      return [
        "Practice deep breathing exercises",
        "Connect with supportive people",
        "Focus on self-care activities",
        "Consider professional help if needed"
      ];
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Mock transcription - in production, use actual speech-to-text service
      // This could integrate with OpenRouter's audio transcription or another service
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("This is a mock transcription. In production, this would use actual speech-to-text processing through OpenRouter or a specialized service.");
        }, 2000);
      });
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }
}

// Create default instance
export const openRouterAPI = new OpenRouterAPI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
});
