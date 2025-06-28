import { useState, useMemo } from "react";
import { Shield, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Calendar, TrendingUp, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Mock data - in real app this would come from API
const boundaryTemplates = [
  {
    id: 1,
    title: "Emotional Boundaries - No Guilt Trips",
    category: "emotional",
    template: "I will not accept guilt trips or emotional manipulation. When someone tries to make me feel guilty for my decisions, I will [action].",
    example: "I will not accept guilt trips or emotional manipulation. When someone tries to make me feel guilty for my decisions, I will calmly state 'I understand you're disappointed, but my decision stands' and disengage from the conversation.",
    difficulty: "easy",
    tags: ["guilt", "manipulation", "emotions"]
  },
  {
    id: 2,
    title: "Communication Boundaries - Respectful Language",
    category: "emotional",
    template: "I require respectful communication. When someone raises their voice, calls me names, or uses hostile language, I will [action].",
    example: "I require respectful communication. When someone raises their voice, calls me names, or uses hostile language, I will say 'I'm not comfortable with this tone. Let's discuss this when we can both be respectful' and leave the conversation.",
    difficulty: "moderate",
    tags: ["communication", "respect", "verbal-abuse"]
  },
  {
    id: 3,
    title: "Physical Space Boundaries",
    category: "physical",
    template: "I have the right to my physical space. When someone invades my personal space or touches me without consent, I will [action].",
    example: "I have the right to my physical space. When someone invades my personal space or touches me without consent, I will clearly say 'Please give me some space' and physically move away.",
    difficulty: "easy",
    tags: ["physical", "space", "consent"]
  },
  {
    id: 4,
    title: "Time Boundaries - Availability",
    category: "personal",
    template: "My time is valuable and I set my own availability. When someone demands immediate attention or tries to control my schedule, I will [action].",
    example: "My time is valuable and I set my own availability. When someone demands immediate attention or tries to control my schedule, I will say 'I'm not available right now. I can discuss this at [specific time]' and stick to my schedule.",
    difficulty: "moderate",
    tags: ["time", "availability", "control"]
  },
  {
    id: 5,
    title: "Digital Boundaries - Privacy",
    category: "digital",
    template: "I have the right to privacy in my digital communications. When someone tries to access my phone, email, or social media without permission, I will [action].",
    example: "I have the right to privacy in my digital communications. When someone tries to access my phone, email, or social media without permission, I will firmly say 'This is private' and secure my devices.",
    difficulty: "challenging",
    tags: ["privacy", "digital", "control"]
  },
  {
    id: 6,
    title: "Financial Boundaries - Money Decisions",
    category: "financial",
    template: "I control my own financial decisions. When someone tries to pressure me about money, spending, or financial choices, I will [action].",
    example: "I control my own financial decisions. When someone tries to pressure me about money, spending, or financial choices, I will say 'This is my decision to make' and not discuss my finances further.",
    difficulty: "challenging",
    tags: ["money", "financial", "independence"]
  }
];

const userBoundaries = [
  {
    id: 1,
    templateId: 1,
    customBoundary: "I will not accept guilt trips about my career choices. When my partner tries to make me feel guilty for working late, I will remind them that my career is important to me and end the conversation if they continue.",
    category: "emotional",
    isActive: true,
    createdAt: "2025-06-20T10:00:00Z",
    lastViolated: "2025-06-25T15:30:00Z",
    violationCount: 3,
    notes: "Getting better at enforcing this. Partner is starting to respect it more."
  },
  {
    id: 2,
    templateId: 2,
    customBoundary: "I require calm discussion during disagreements. When voices get raised, I will say 'Let's take a break and discuss this when we're both calm' and leave the room for 15 minutes.",
    category: "emotional",
    isActive: true,
    createdAt: "2025-06-18T14:00:00Z",
    lastViolated: null,
    violationCount: 0,
    notes: "This has been working really well! Arguments are much more productive now."
  }
];

const boundaryViolations = [
  {
    id: 1,
    boundaryId: 1,
    description: "Partner made sarcastic comments about me 'choosing work over family' when I stayed late for an important presentation.",
    severity: 3,
    violatedAt: "2025-06-25T15:30:00Z",
    actionTaken: "I reminded them of my boundary and explained that my career is important. Left the conversation when they continued."
  },
  {
    id: 2,
    boundaryId: 1,
    description: "Got multiple guilt-trip texts while at work about missing a family dinner I couldn't attend due to a client meeting.",
    severity: 2,
    violatedAt: "2025-06-22T18:00:00Z",
    actionTaken: "Didn't respond to the guilt-trip texts. Addressed it calmly later that evening."
  }
];

const boundaryFormSchema = z.object({
  customBoundary: z.string().min(10, "Boundary must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional()
});

type BoundaryFormValues = z.infer<typeof boundaryFormSchema>;

interface BoundaryBuilderProps {
  userId?: number;
}

export default function BoundaryBuilder({ userId = 1 }: BoundaryBuilderProps) {
  const [activeTab, setActiveTab] = useState("my-boundaries");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);
  const [selectedBoundary, setSelectedBoundary] = useState<any>(null);

  const form = useForm<BoundaryFormValues>({
    resolver: zodResolver(boundaryFormSchema),
    defaultValues: {
      customBoundary: "",
      category: "",
      notes: ""
    }
  });

  // Statistics
  const stats = useMemo(() => {
    const totalBoundaries = userBoundaries.length;
    const activeBoundaries = userBoundaries.filter(b => b.isActive).length;
    const totalViolations = userBoundaries.reduce((sum, b) => sum + b.violationCount, 0);
    const successfulBoundaries = userBoundaries.filter(b => b.violationCount === 0).length;
    const successRate = totalBoundaries > 0 ? (successfulBoundaries / totalBoundaries) * 100 : 0;

    return {
      totalBoundaries,
      activeBoundaries,
      totalViolations,
      successRate
    };
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return boundaryTemplates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emotional": return "💭";
      case "physical": return "🛡️";
      case "digital": return "📱";
      case "financial": return "💰";
      case "personal": return "⏰";
      default: return "🔒";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "challenging": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (severity >= 3) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    if (severity >= 2) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const handleCreateFromTemplate = (template: any) => {
    setSelectedTemplate(template);
    form.setValue("customBoundary", template.example);
    form.setValue("category", template.category);
    setIsCreateDialogOpen(true);
  };

  const handleSubmitBoundary = (data: BoundaryFormValues) => {
    console.log("Creating boundary:", data);
    // In real app, this would call API to create boundary
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleReportViolation = (boundary: any) => {
    setSelectedBoundary(boundary);
    setIsViolationDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Boundary Builder
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create and track personal boundaries. Use templates or customize your own.
            Monitor violations and strengthen your boundary-setting skills.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Boundary Success Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeBoundaries}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Boundaries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.successRate)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalViolations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Violations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalBoundaries}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Boundaries Set</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={stats.successRate} className="w-full" />
            <p className="text-xs text-gray-500 mt-1 text-center">
              {stats.successRate >= 80 ? "Excellent boundary maintenance!" : 
               stats.successRate >= 60 ? "Good progress on boundaries" : 
               "Keep working on boundary enforcement"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-boundaries">My Boundaries</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        {/* My Boundaries Tab */}
        <TabsContent value="my-boundaries" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Active Boundaries</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Boundary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Boundary</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitBoundary)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customBoundary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Boundary Statement</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="I will not accept... When someone does [behavior], I will [action]..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="emotional">Emotional</SelectItem>
                              <SelectItem value="physical">Physical</SelectItem>
                              <SelectItem value="digital">Digital</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes about this boundary..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Boundary</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {userBoundaries.map((boundary) => (
              <Card key={boundary.id} className={boundary.violationCount === 0 ? "border-green-200 bg-green-50 dark:bg-green-950" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(boundary.category)}</span>
                        <Badge variant="secondary">{boundary.category}</Badge>
                        {boundary.violationCount === 0 && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {boundary.customBoundary}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReportViolation(boundary)}>
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>Created: {new Date(boundary.createdAt).toLocaleDateString()}</span>
                      <span className={boundary.violationCount === 0 ? "text-green-600" : "text-orange-600"}>
                        Violations: {boundary.violationCount}
                      </span>
                    </div>
                    {boundary.lastViolated && (
                      <span>Last violated: {new Date(boundary.lastViolated).toLocaleDateString()}</span>
                    )}
                  </div>
                  {boundary.notes && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                      <strong>Notes:</strong> {boundary.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
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
                <SelectItem value="emotional">Emotional</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="challenging">Challenging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(template.category)}</span>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => handleCreateFromTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Template:</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                        {template.template}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Example:</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {template.example}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <h3 className="text-lg font-semibold">Boundary Violation History</h3>
          
          <div className="space-y-4">
            {boundaryViolations.map((violation) => {
              const boundary = userBoundaries.find(b => b.id === violation.boundaryId);
              return (
                <Card key={violation.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(violation.severity)}>
                            Severity {violation.severity}/5
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(violation.violatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {violation.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {violation.actionTaken && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Action Taken:</h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          {violation.actionTaken}
                        </p>
                      </div>
                    )}
                    {boundary && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <strong>Related Boundary:</strong> {boundary.customBoundary}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Violation Dialog */}
      <Dialog open={isViolationDialogOpen} onOpenChange={setIsViolationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Boundary Violation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe what happened..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Severity (1-5)</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Minor</SelectItem>
                  <SelectItem value="2">2 - Mild</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Severe</SelectItem>
                  <SelectItem value="5">5 - Extreme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Action Taken (Optional)</label>
              <Textarea placeholder="What did you do in response?" className="mt-1" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsViolationDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsViolationDialogOpen(false)}>
                Report Violation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}