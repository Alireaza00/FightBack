import { useState, useEffect, useMemo } from "react";
import { Search, HelpCircle, Lightbulb, ChevronDown, Check, Brain, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { behaviorTypes, behaviorTypeDescriptions } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BehaviorTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  description?: string;
  onAIAnalysis?: (analysis: string) => void;
}

export default function BehaviorTypeSelector({ 
  value, 
  onChange, 
  description = "",
  onAIAnalysis 
}: BehaviorTypeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showGuided, setShowGuided] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);

  // AI analysis mutation
  const analyzeDescriptionMutation = useMutation({
    mutationFn: async (text: string) => {
      const prompt = `Based on this incident description, which behavior types might apply? Description: "${text}". Please suggest the most relevant behavior types and explain why.`;
      const response = await apiRequest("POST", "/api/ai/analyze", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      if (onAIAnalysis) {
        onAIAnalysis(data.analysis);
      }
      setShowAISuggestions(true);
    }
  });

  // Auto-suggest based on description
  const suggestedTypes = useMemo(() => {
    if (!description || description.length < 10) return [];
    
    const descLower = description.toLowerCase();
    const suggestions: { type: string; score: number; matchedKeywords: string[] }[] = [];
    
    Object.entries(behaviorTypeDescriptions).forEach(([type, info]) => {
      const matchedKeywords = info.keywords.filter(keyword => 
        descLower.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        suggestions.push({
          type,
          score: matchedKeywords.length,
          matchedKeywords
        });
      }
    });
    
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [description]);

  // Filter behavior types based on search
  const filteredTypes = useMemo(() => {
    if (!searchTerm) return behaviorTypes;
    
    const searchLower = searchTerm.toLowerCase();
    return behaviorTypes.filter(type => {
      const info = behaviorTypeDescriptions[type];
      return (
        info.title.toLowerCase().includes(searchLower) ||
        info.description.toLowerCase().includes(searchLower) ||
        info.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
        info.examples.some(example => example.toLowerCase().includes(searchLower))
      );
    });
  }, [searchTerm]);

  const handleAIAnalysis = () => {
    if (description && description.length > 10) {
      analyzeDescriptionMutation.mutate(description);
    }
  };

  const renderBehaviorCard = (type: string, isHighlighted = false) => {
    const info = behaviorTypeDescriptions[type];
    const isSelected = value === type;
    
    return (
      <Card 
        key={type}
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-950' 
            : isHighlighted
            ? 'border-orange-200 bg-orange-50 dark:bg-orange-950'
            : 'hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => onChange(type)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center space-x-2">
              <span>{info.title}</span>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
              {isHighlighted && <Lightbulb className="h-4 w-4 text-orange-500" />}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {info.description}
          </p>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">Examples:</div>
            <div className="flex flex-wrap gap-1">
              {info.examples.slice(0, 2).map((example, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            What type of behavior was this?
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Don't worry if you're unsure - we'll help you identify it
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowGuided(!showGuided)}
          className="flex items-center space-x-2"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Need Help?</span>
        </Button>
      </div>

      {/* AI Suggestions (if description provided) */}
      {suggestedTypes.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span>Smart Suggestions</span>
              </CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAIAnalysis}
                disabled={analyzeDescriptionMutation.isPending}
                className="text-xs"
              >
                <Brain className="h-3 w-3 mr-1" />
                {analyzeDescriptionMutation.isPending ? "Analyzing..." : "AI Analysis"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Based on your description, these patterns might apply:
            </p>
            <div className="grid gap-2">
              {suggestedTypes.map(({ type, matchedKeywords }) => (
                <div 
                  key={type}
                  className="p-2 bg-white dark:bg-gray-800 rounded border cursor-pointer hover:shadow-sm"
                  onClick={() => onChange(type)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{behaviorTypeDescriptions[type].title}</span>
                    <div className="flex flex-wrap gap-1">
                      {matchedKeywords.slice(0, 2).map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {behaviorTypeDescriptions[type].description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Results */}
      {showAISuggestions && analyzeDescriptionMutation.data && (
        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>AI Pattern Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
              {analyzeDescriptionMutation.data.analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guided Help Section */}
      <Collapsible open={showGuided} onOpenChange={setShowGuided}>
        <CollapsibleContent>
          <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>Not Sure? Ask Yourself These Questions:</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium mb-2">💭 Did they make you question yourself?</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    If they said things like "that never happened" or "you're being too sensitive" → This might be <strong>Gaslighting</strong>
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium mb-2">🤐 Did they ignore you or give you the cold shoulder?</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    If they stopped talking to you, ignored texts, or acted like you don't exist → This might be the <strong>Silent Treatment</strong>
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium mb-2">📱 Did they control or monitor you?</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    If they checked your phone, told you what to wear, or tracked where you go → This might be <strong>Controlling Behavior</strong>
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium mb-2">😔 Did they make you feel guilty or bad about yourself?</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    If they used guilt, shame, or threats to get their way → This might be <strong>Emotional Manipulation</strong>
                  </p>
                </div>
                
                <div className="text-center mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Remember:</strong> If something felt wrong or made you uncomfortable, trust your instincts. 
                    You can always select "Other Concerning Behavior" if nothing else fits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search behavior types or describe what happened..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Behavior Type Grid */}
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {filteredTypes.map((type) => {
          const isHighlighted = suggestedTypes.some(s => s.type === type);
          return renderBehaviorCard(type, isHighlighted);
        })}
        
        {filteredTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No behavior types match your search.</p>
            <p className="text-sm mt-1">Try different keywords or select "Other" if nothing fits.</p>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {value && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Selected: {behaviorTypeDescriptions[value].title}
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {behaviorTypeDescriptions[value].description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}