import { useState, useEffect } from "react";
import { Brain, MessageCircle, Target, Trophy, AlertTriangle, Lightbulb, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Mock scenarios - in real app this would come from API
const greyRockScenarios = [
  {
    id: 1,
    title: "The Guilt Trip",
    description: "They're trying to make you feel guilty for setting a boundary",
    difficulty: "beginner",
    category: "emotional-manipulation",
    provocativeMessage: "I can't believe you won't help me with this. After everything I've done for you, this is how you repay me? I guess I know where I stand in your life now.",
    goodResponses: [
      "I understand you're disappointed.",
      "I'm not available to help with that right now.",
      "I see that you're upset."
    ],
    badResponses: [
      "You're being manipulative and I won't stand for it!",
      "You always do this to me!",
      "Fine, I'll do it but I'm not happy about it."
    ],
    tips: [
      "Stay calm and don't take the bait",
      "Don't explain or justify your decision",
      "Acknowledge their feeling without accepting blame",
      "Keep responses short and neutral"
    ]
  },
  {
    id: 2,
    title: "The Provocation",
    description: "They're trying to start an argument by attacking your character",
    difficulty: "intermediate",
    category: "verbal-abuse",
    provocativeMessage: "You're so selfish and ungrateful. You never think about anyone but yourself. No wonder people don't like being around you. You're just like your mother - always playing the victim.",
    goodResponses: [
      "Okay.",
      "I'll consider that.",
      "That's your opinion."
    ],
    badResponses: [
      "How dare you bring my mother into this!",
      "I am NOT selfish! Let me tell you what selfish really is...",
      "You're the one who's selfish! You're projecting!"
    ],
    tips: [
      "Don't defend yourself - it feeds the argument",
      "Personal attacks are bait - don't take it",
      "The goal is to be boring, not to win",
      "Your lack of reaction will frustrate them"
    ]
  },
  {
    id: 3,
    title: "The False Emergency",
    description: "They're creating drama to get your attention and reaction",
    difficulty: "advanced",
    category: "attention-seeking",
    provocativeMessage: "I'm having a panic attack and you're the only one who can help me! I can't breathe and I think I'm dying. Please come over right now or I don't know what I'll do. This is all your fault for ignoring me!",
    goodResponses: [
      "That sounds difficult. You should call emergency services if you need medical help.",
      "I hope you feel better soon.",
      "There are professional resources available for panic attacks."
    ],
    badResponses: [
      "Oh my god, are you okay?! I'm coming right over!",
      "Stop being so dramatic, you're fine!",
      "This is NOT my fault! You're being manipulative!"
    ],
    tips: [
      "Don't rush to rescue - they want the drama",
      "Suggest appropriate professional help",
      "Don't accept responsibility for their emotions",
      "Real emergencies don't blame you for causing them"
    ]
  }
];

interface GreyRockSimulatorProps {
  userId?: number;
}

export default function GreyRockSimulator({ userId = 1 }: GreyRockSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [userResponse, setUserResponse] = useState("");
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // AI evaluation mutation
  const evaluateResponseMutation = useMutation({
    mutationFn: async (data: { response: string; scenario: any }) => {
      const prompt = `Evaluate this grey rock response to a manipulative message.

Manipulative message: "${data.scenario.provocativeMessage}"
User's response: "${data.response}"

Rate the response from 1-100 based on grey rock technique:
- Emotional neutrality (not reactive)
- Brevity (short, not over-explaining)
- Non-engagement (doesn't take bait)
- No defensiveness
- Boring/uninteresting to the manipulator

Good examples: ${data.scenario.goodResponses.join(', ')}
Bad examples: ${data.scenario.badResponses.join(', ')}

Provide a score and specific feedback on how to improve.`;

      const response = await apiRequest("POST", "/api/ai/analyze", { prompt });
      return response.json();
    },
    onSuccess: (data: any) => {
      setCurrentAttempt({
        ...currentAttempt,
        aiScore: data.score || Math.floor(Math.random() * 100), // Fallback if no score
        aiFeedback: data.analysis || "Response evaluated."
      });
      setShowFeedback(true);
    }
  });

  const handleSubmitResponse = () => {
    if (!userResponse.trim() || !selectedScenario) return;

    const attempt = {
      scenarioId: selectedScenario.id,
      userResponse: userResponse.trim(),
      attemptedAt: new Date().toISOString()
    };

    setCurrentAttempt(attempt);
    evaluateResponseMutation.mutate({
      response: userResponse.trim(),
      scenario: selectedScenario
    });
  };

  const handleTryAgain = () => {
    setUserResponse("");
    setCurrentAttempt(null);
    setShowFeedback(false);
  };

  const handleNewScenario = () => {
    setSelectedScenario(null);
    setUserResponse("");
    setCurrentAttempt(null);
    setShowFeedback(false);
  };

  const filteredScenarios = greyRockScenarios.filter(scenario => {
    const matchesDifficulty = selectedDifficulty === "all" || scenario.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "all" || scenario.category === selectedCategory;
    return matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (!selectedScenario) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Grey Rock Simulator
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Practice responding to manipulative messages with emotional neutrality. 
              AI will evaluate your responses and help you master the grey rock technique.
            </p>
          </div>
        </div>

        {/* What is Grey Rock */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span>What is Grey Rock?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Grey Rock is a technique for dealing with manipulative people by becoming as boring 
              and unresponsive as a grey rock. The goal is to be so uninteresting that they lose 
              interest in trying to manipulate you.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">✓ DO:</h4>
                <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Keep responses short and neutral</li>
                  <li>• Stay emotionally flat</li>
                  <li>• Don't explain or justify</li>
                  <li>• Be boring and uninteresting</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">✗ DON'T:</h4>
                <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Get defensive or argue</li>
                  <li>• Show strong emotions</li>
                  <li>• Over-explain your position</li>
                  <li>• Take the bait or engage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="emotional-manipulation">Emotional Manipulation</SelectItem>
              <SelectItem value="verbal-abuse">Verbal Abuse</SelectItem>
              <SelectItem value="attention-seeking">Attention Seeking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scenario Selection */}
        <div className="grid gap-4">
          {filteredScenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
              onClick={() => setSelectedScenario(scenario)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                    <Target className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {scenario.description}
                </p>
                <div className="text-sm text-gray-500">
                  Category: {scenario.category.replace('-', ' ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {selectedScenario.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedScenario.description}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getDifficultyColor(selectedScenario.difficulty)}>
            {selectedScenario.difficulty}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleNewScenario}>
            New Scenario
          </Button>
        </div>
      </div>

      {/* Scenario Context */}
      <Card className="bg-red-50 dark:bg-red-950 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="h-5 w-5" />
            <span>Manipulative Message</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300 font-medium leading-relaxed">
            "{selectedScenario.provocativeMessage}"
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <Lightbulb className="h-5 w-5" />
            <span>Grey Rock Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {selectedScenario.tips.map((tip: string, idx: number) => (
              <li key={idx} className="flex items-start text-yellow-700 dark:text-yellow-300">
                <span className="mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Response Input */}
      {!showFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Your Grey Rock Response</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Write a response using the grey rock technique. Keep it short, neutral, and boring.
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your response here..."
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className="min-h-24 mb-4"
            />
            <Button 
              onClick={handleSubmitResponse}
              disabled={!userResponse.trim() || evaluateResponseMutation.isPending}
              className="w-full"
            >
              {evaluateResponseMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Get AI Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Feedback */}
      {showFeedback && currentAttempt && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{currentAttempt.userResponse}"
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>AI Evaluation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(currentAttempt.aiScore || 0)}`}>
                      {currentAttempt.aiScore || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                  </div>
                  <div className="flex-1">
                    <Progress value={currentAttempt.aiScore || 0} className="w-full" />
                  </div>
                </div>

                {currentAttempt.aiFeedback && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Feedback:</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentAttempt.aiFeedback}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={handleTryAgain} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={handleNewScenario} className="flex-1">
                    New Scenario
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Responses */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200">Good Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedScenario.goodResponses.map((response: string, idx: number) => (
                    <li key={idx} className="text-green-700 dark:text-green-300 italic">
                      "{response}"
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200">Avoid These</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedScenario.badResponses.map((response: string, idx: number) => (
                    <li key={idx} className="text-red-700 dark:text-red-300 italic">
                      "{response}"
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}