import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Mic, MicOff, FileAudio, Trash2, Bot, Key, Save, Camera } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertIncidentSchema, behaviorTypes, moodOptions, type InsertIncident, type PhotoAttachment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import AudioRecorder from "@/components/audio-recorder";
import PhotoUploader from "@/components/photo-uploader";

const safetyRatings = [
  { value: 1, color: "bg-error-custom", label: "1" },
  { value: 2, color: "bg-warning-custom", label: "2" },
  { value: 3, color: "bg-yellow-500", label: "3" },
  { value: 4, color: "bg-blue-500", label: "4" },
  { value: 5, color: "bg-success-custom", label: "5" },
];

const moodEmojis = {
  calm: "😌 Calm",
  happy: "😊 Happy", 
  anxious: "😰 Anxious",
  sad: "😢 Sad",
  angry: "😠 Angry",
  confused: "😕 Confused"
};

export default function IncidentForm() {
  const [selectedSafety, setSelectedSafety] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertIncident>({
    resolver: zodResolver(insertIncidentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      behaviorType: "",
      description: "",
      feelings: "",
      impact: "",
      moodBefore: "",
      moodAfter: "",
      safetyRating: undefined,
      transcription: "",
      photos: [],
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: InsertIncident) => {
      const response = await apiRequest("POST", "/api/incidents", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Saved",
        description: "Your incident has been securely recorded.",
      });
      form.reset();
      setSelectedSafety(null);
      setPhotos([]);
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const transcribeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/transcribe", { audioData: "mock" });
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("transcription", data.transcription);
      toast({
        title: "Transcription Complete",
        description: "Audio has been transcribed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Transcription Failed",
        description: "Unable to transcribe audio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertIncident) => {
    const submissionData = {
      ...data,
      safetyRating: selectedSafety || undefined,
      photos: photos,
    };
    createIncidentMutation.mutate(submissionData);
  };

  const handleTranscribe = () => {
    setIsTranscribing(true);
    transcribeMutation.mutate();
    setTimeout(() => setIsTranscribing(false), 2000);
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">New Entry</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>Secure Entry</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Behavior Type */}
            <FormField
              control={form.control}
              name="behaviorType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Behavior Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select behavior type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {behaviorTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what happened..." 
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload Section */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Photo Evidence</h3>
                <span className="text-sm text-green-600 flex items-center space-x-1">
                  <Camera className="h-4 w-4" />
                  <span>Visual Documentation</span>
                </span>
              </div>
              
              <PhotoUploader 
                photos={photos} 
                onPhotosChange={setPhotos} 
              />
            </div>

            {/* Audio Recording Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Audio Recordings</h3>
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <Mic className="h-4 w-4" />
                  <span>Galadia API Integration</span>
                </span>
              </div>
              
              <AudioRecorder />
            </div>

            {/* Conversation Transcription */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Conversation Transcription</h3>
                <span className="text-sm text-blue-600 flex items-center space-x-1">
                  <Bot className="h-4 w-4" />
                  <span>OpenRouter API</span>
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button 
                    type="button" 
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className="bg-primary-custom hover:bg-blue-700"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    {isTranscribing ? "Transcribing..." : "Transcribe Audio"}
                  </Button>
                  <div className="text-sm text-gray-500 flex items-center space-x-1">
                    <Key className="h-4 w-4" />
                    <span>API Connected</span>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="transcription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transcribed Text</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Audio transcription will appear here..." 
                          rows={4} 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Feelings and Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="feelings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feelings</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How did you feel before, during, and after?" 
                        rows={3} 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How did this affect you?" 
                        rows={3} 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mood and Safety Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormLabel>Mood Before/After</FormLabel>
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="moodBefore"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Before..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {moodOptions.map((mood) => (
                              <SelectItem key={mood} value={mood}>
                                {moodEmojis[mood]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="moodAfter"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="After..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {moodOptions.map((mood) => (
                              <SelectItem key={mood} value={mood}>
                                {moodEmojis[mood]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <FormLabel>Safety Level (1-5)</FormLabel>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">Unsafe</span>
                  <div className="flex space-x-1">
                    {safetyRatings.map((rating) => (
                      <Button
                        key={rating.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`w-8 h-8 rounded-full border-2 transition-colors ${
                          selectedSafety === rating.value 
                            ? `${rating.color} text-white border-transparent` 
                            : `border-gray-300 hover:${rating.color} hover:text-white`
                        }`}
                        onClick={() => setSelectedSafety(rating.value)}
                      >
                        {rating.label}
                      </Button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Safe</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createIncidentMutation.isPending}
                  className="bg-primary-custom hover:bg-blue-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {createIncidentMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
