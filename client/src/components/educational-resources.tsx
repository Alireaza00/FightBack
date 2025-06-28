import { useState, useMemo } from "react";
import { BookOpen, Clock, Star, CheckCircle, Filter, Search, Brain, Heart, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock educational content - in real app this would come from API
const educationalLessons = [
  {
    id: 1,
    title: "Understanding Narcissistic Abuse: The Basics",
    content: `Narcissistic abuse is a form of emotional and psychological abuse where the abuser uses manipulation tactics to control and dominate their victim. Unlike physical abuse, the signs are often subtle and can be difficult to recognize.

**Key Characteristics:**
- Constant criticism disguised as "help"
- Gaslighting (making you question your reality)
- Love-bombing followed by devaluation
- Isolation from friends and family
- Financial control or sabotage

**Why It's Hard to Recognize:**
Many victims don't realize they're being abused because narcissistic abusers are skilled manipulators. They often:
- Start relationships with intense charm and attention
- Gradually increase controlling behaviors
- Blame the victim for their own reactions
- Alternate between kindness and cruelty

**Trust Your Instincts:**
If something feels wrong in your relationship, it probably is. Your feelings are valid, and you deserve to be treated with respect and kindness.`,
    category: "narcissistic-abuse",
    difficulty: "beginner",
    duration: 5,
    tags: ["basics", "recognition", "red-flags"],
    keyTakeaways: [
      "Narcissistic abuse is subtle and psychological",
      "It starts small and escalates gradually",
      "Your instincts are usually right",
      "You deserve respect and kindness"
    ],
    completed: false,
    rating: 0
  },
  {
    id: 2,
    title: "Trauma Bonds: Why It's Hard to Leave",
    content: `A trauma bond is a psychological attachment that forms between an abuser and victim through cycles of abuse, devaluation, and positive reinforcement. Understanding this concept is crucial for survivors.

**How Trauma Bonds Form:**
1. **Intermittent Reinforcement**: Unpredictable patterns of punishment and reward
2. **Isolation**: Cutting you off from other support systems
3. **Dependency**: Making you feel you can't survive without them
4. **Shared Experiences**: Both positive and negative intense experiences

**The Addiction-Like Cycle:**
- High: Periods of intense love, attention, or kindness
- Withdrawal: Abuse, neglect, or silent treatment
- Craving: Desperate desire to return to the "high"
- Tolerance: Accepting worse treatment over time

**Breaking Free:**
- Recognize the pattern exists
- Build external support systems
- Practice self-compassion
- Seek professional help when possible
- Remember: Leaving takes time and multiple attempts

**You Are Not Weak:**
Trauma bonds are biological responses. Your brain literally becomes addicted to the cycle. This is not a character flaw - it's how humans are wired to survive.`,
    category: "trauma-bonds",
    difficulty: "intermediate",
    duration: 8,
    tags: ["trauma-bond", "psychology", "leaving", "addiction"],
    keyTakeaways: [
      "Trauma bonds create addiction-like attachments",
      "Your brain is responding normally to abnormal situations",
      "Breaking free takes time and support",
      "You are not weak - you are surviving"
    ],
    completed: true,
    rating: 5
  },
  {
    id: 3,
    title: "Advanced Manipulation Tactics: Triangulation & Flying Monkeys",
    content: `Advanced manipulators use sophisticated tactics that can be harder to identify. Understanding these helps you recognize when they're being used against you.

**Triangulation:**
Using a third person to validate their position or make you jealous/insecure.
- Comparing you to ex-partners: "She never complained about this"
- Bringing family into arguments: "Even my mother thinks you're wrong"
- Flirting with others to make you jealous
- Getting mutual friends to take sides

**Flying Monkeys:**
People recruited to do the narcissist's bidding, often without realizing it.
- Family members who pressure you to "forgive and forget"
- Friends who say "they're not that bad" or "you're being dramatic"
- Therapists or counselors who don't understand narcissistic abuse
- New partners who are told lies about you

**Smear Campaigns:**
Systematic destruction of your reputation to isolate you.
- Spreading lies about your mental health
- Twisting your words out of context
- Playing victim while painting you as the abuser
- Using your private information against you

**Protection Strategies:**
- Keep detailed records of interactions
- Limit information you share with mutual contacts
- Build a support network outside their influence
- Don't defend yourself to flying monkeys - it feeds the narrative
- Focus on your healing, not changing others' minds

**Remember:**
People who truly know you won't believe lies about you. Those who do weren't really your allies to begin with.`,
    category: "manipulation-tactics",
    difficulty: "advanced",
    duration: 12,
    tags: ["triangulation", "flying-monkeys", "smear-campaign", "advanced"],
    keyTakeaways: [
      "Triangulation uses third parties against you",
      "Flying monkeys often don't realize they're being used",
      "Smear campaigns aim to isolate you",
      "Don't defend yourself to flying monkeys",
      "True allies won't believe lies about you"
    ],
    completed: false,
    rating: 0
  },
  {
    id: 4,
    title: "The Cycle of Abuse: Recognizing the Pattern",
    content: `The cycle of abuse is a predictable pattern that most abusive relationships follow. Understanding this cycle helps you recognize where you are and predict what comes next.

**Phase 1: Tension Building**
- Walking on eggshells
- Increasing criticism and complaints
- Victim tries harder to please
- Sense of impending doom

**Phase 2: Acute Abuse/Explosion**
- Verbal, emotional, or physical outburst
- Severe criticism or punishment
- Victim feels shocked and hurt
- May fight back or shut down

**Phase 3: Reconciliation/Honeymoon**
- Apologies and promises to change
- Gifts, attention, and affection
- Blaming external factors (stress, work)
- "This is the person I fell in love with"

**Phase 4: Calm/Normal**
- Things seem fine temporarily
- Victim feels hopeful
- May question if abuse really happened
- Gradually returns to Phase 1

**Why the Cycle Continues:**
- The honeymoon phase gives hope
- Trauma bonding strengthens during reconciliation
- Victim believes the "real" person is the honeymoon version
- Each cycle erodes self-esteem further

**Breaking the Cycle:**
- Recognize you're in a cycle, not isolated incidents
- Don't make major decisions during honeymoon phase
- Document patterns in a safe place
- Build support outside the relationship
- Plan for safety during tension-building phases`,
    category: "narcissistic-abuse",
    difficulty: "intermediate",
    duration: 7,
    tags: ["cycle-of-abuse", "pattern", "honeymoon-phase", "recognition"],
    keyTakeaways: [
      "Abuse follows predictable cycles",
      "Honeymoon phases give false hope",
      "Each cycle erodes self-esteem further",
      "Document patterns to see clearly",
      "Plan safety during tension phases"
    ],
    completed: false,
    rating: 0
  }
];

interface EducationalResourcesProps {
  userId?: number;
}

export default function EducationalResources({ userId = 1 }: EducationalResourcesProps) {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const completed = educationalLessons.filter(lesson => lesson.completed).length;
    const total = educationalLessons.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const totalDuration = educationalLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const completedDuration = educationalLessons
      .filter(lesson => lesson.completed)
      .reduce((sum, lesson) => sum + lesson.duration, 0);
    
    return {
      completed,
      total,
      completionRate,
      totalDuration,
      completedDuration
    };
  }, []);

  // Filter lessons based on search and filters
  const filteredLessons = useMemo(() => {
    return educationalLessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lesson.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "narcissistic-abuse": return <Brain className="h-4 w-4" />;
      case "trauma-bonds": return <Heart className="h-4 w-4" />;
      case "manipulation-tactics": return <Shield className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCompleteLesson = (lessonId: number, rating: number) => {
    // In real app, this would call API to update progress
    console.log(`Lesson ${lessonId} completed with rating ${rating}`);
    setSelectedLesson(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Educational Resources
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Learn about abuse patterns, psychology, and healing at your own pace
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Your Learning Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progressStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{progressStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(progressStats.completionRate)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{progressStats.completedDuration}min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Invested</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progressStats.completionRate} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lessons, topics, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="narcissistic-abuse">Narcissistic Abuse</SelectItem>
            <SelectItem value="trauma-bonds">Trauma Bonds</SelectItem>
            <SelectItem value="manipulation-tactics">Manipulation Tactics</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-6">
        {filteredLessons.map((lesson) => (
          <Card 
            key={lesson.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              lesson.completed 
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                : 'hover:border-blue-300'
            }`}
            onClick={() => setSelectedLesson(lesson)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getCategoryIcon(lesson.category)}
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    {lesson.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration} min read
                    </div>
                    {lesson.completed && lesson.rating > 0 && (
                      <div className="flex items-center">
                        {[...Array(lesson.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {lesson.content.substring(0, 150)}...
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {lesson.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Key Takeaways:</div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {lesson.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No lessons match your current filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Lesson Detail Modal */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedLesson && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2 mb-2">
                  {getCategoryIcon(selectedLesson.category)}
                  <DialogTitle className="text-xl">{selectedLesson.title}</DialogTitle>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <Badge className={getDifficultyColor(selectedLesson.difficulty)}>
                    {selectedLesson.difficulty}
                  </Badge>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedLesson.duration} min read
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  {selectedLesson.content.split('\n\n').map((paragraph: string, idx: number) => (
                    <div key={idx} className="mb-4">
                      {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                        <h3 className="font-semibold text-lg mb-2">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      ) : paragraph.startsWith('- ') ? (
                        <ul className="list-disc pl-6 space-y-1">
                          {paragraph.split('\n').map((item, itemIdx) => (
                            <li key={itemIdx}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Key Takeaways:
                  </h4>
                  <ul className="space-y-2">
                    {selectedLesson.keyTakeaways.map((takeaway: string, idx: number) => (
                      <li key={idx} className="flex items-start text-blue-700 dark:text-blue-300">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!selectedLesson.completed && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mark this lesson as complete and rate it:
                    </p>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteLesson(selectedLesson.id, rating)}
                          className="w-8 h-8 p-0"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}