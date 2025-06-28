import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Brain, Lightbulb, TrendingUp, File, FileSpreadsheet, CloudUpload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Incident } from "@shared/schema";

const behaviorTypeColors: Record<string, string> = {
  gaslighting: "bg-error-custom",
  "silent-treatment": "bg-warning-custom",
  triangulation: "bg-accent-custom",
  "love-bombing": "bg-purple-500",
  projection: "bg-indigo-500",
  "emotional-manipulation": "bg-pink-500",
  "financial-abuse": "bg-orange-500",
  isolation: "bg-yellow-500",
  "verbal-abuse": "bg-red-600",
  other: "bg-gray-400",
};

export default function Sidebar() {
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const recentIncidents = incidents.slice(0, 3);

  const formatBehaviorType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${behaviorTypeColors[incident.behaviorType] || 'bg-gray-400'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatBehaviorType(incident.behaviorType)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(incident.date)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
            
            {recentIncidents.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No entries yet</p>
              </div>
            )}
          </div>
          
          {incidents.length > 3 && (
            <Button variant="ghost" className="w-full mt-4 text-primary hover:text-blue-700">
              View All Entries
            </Button>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <p className="text-sm text-gray-700 flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>
                  {stats?.total > 0 
                    ? `Pattern detected: You have logged ${stats.total} incidents. Consider reviewing patterns with a professional.`
                    : "Start logging incidents to receive AI-powered insights about patterns."
                  }
                </span>
              </p>
            </div>
            
            {stats && stats.avgSafetyRating < 3 && (
              <div className="bg-white p-3 rounded-md border border-blue-100">
                <p className="text-sm text-gray-700 flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>
                    Your average safety rating is {stats.avgSafetyRating}. Consider reaching out to support resources.
                  </span>
                </p>
              </div>
            )}
          </div>
          
          <Button className="w-full mt-4 bg-primary text-white hover:bg-blue-700">
            Generate Full Report
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.total || 0}</div>
              <div className="text-xs text-gray-500">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-custom">{stats?.thisMonth || 0}</div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-error-custom">
                {stats?.avgSafetyRating || 0}
              </div>
              <div className="text-xs text-gray-500">Avg Safety</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-custom">
                {stats?.totalAudioDuration ? `${Math.round(stats.totalAudioDuration / 60)}min` : '0min'}
              </div>
              <div className="text-xs text-gray-500">Audio Logged</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-center">
              <File className="h-4 w-4 mr-2 text-error-custom" />
              Export as PDF
            </Button>
            <Button variant="outline" className="w-full justify-center">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-success-custom" />
              Export as CSV
            </Button>
            <Button variant="outline" className="w-full justify-center">
              <CloudUpload className="h-4 w-4 mr-2 text-accent-custom" />
              Backup to Cloud
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
