import { useQuery } from "@tanstack/react-query";
import { PieChart, Calendar, Heart, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const behaviorTypeColors: Record<string, string> = {
  gaslighting: "bg-error-custom",
  "silent-treatment": "bg-warning-custom", 
  triangulation: "bg-accent-custom",
  "love-bombing": "bg-purple-500",
  other: "bg-gray-400",
};

export default function AnalyticsDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const behaviorEntries = stats?.behaviorTypeDistribution 
    ? Object.entries(stats.behaviorTypeDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    : [];

  const totalIncidents = stats?.total || 0;
  const behaviorPercentages = behaviorEntries.map(([type, count]) => ({
    type,
    count,
    percentage: totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0
  }));

  const weeklyEntries = stats?.weeklyPattern 
    ? Object.entries(stats.weeklyPattern)
        .map(([day, count]) => ({ day, count }))
    : [];

  const maxWeeklyCount = Math.max(...weeklyEntries.map(entry => entry.count), 1);

  const formatBehaviorType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
          <div className="flex items-center space-x-4">
            <Select defaultValue="last-30-days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary text-white hover:bg-blue-700">
              <Bot className="h-4 w-4 mr-2" />
              AI Analysis
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Behavior Type Distribution */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-primary" />
                <span>Behavior Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {behaviorPercentages.length > 0 ? (
                  behaviorPercentages.map(({ type, count, percentage }) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${behaviorTypeColors[type] || 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-700">{formatBehaviorType(type)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{percentage}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No data available</p>
                    <p className="text-xs">Start logging incidents to see patterns</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Pattern */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Weekly Patterns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyEntries.length > 0 ? (
                  weeklyEntries.map(({ day, count }) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{day}</span>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(count / maxWeeklyCount) * 100} 
                          className="w-16 h-2"
                        />
                        <span className="text-xs text-gray-500 w-4">{count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No weekly data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Impact */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Emotional Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${
                    (stats?.avgSafetyRating || 0) <= 2 ? 'text-error-custom' :
                    (stats?.avgSafetyRating || 0) <= 3 ? 'text-warning-custom' : 
                    'text-success-custom'
                  }`}>
                    {stats?.avgSafetyRating || 0}
                  </div>
                  <div className="text-xs text-gray-500">Average Safety Rating</div>
                </div>
                
                {stats?.total > 0 && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Total Incidents</span>
                        <span className="text-gray-500">{stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">This Month</span>
                        <span className="text-gray-500">{stats.thisMonth}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-sm text-gray-700 mb-2">Safety Trend:</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.avgSafetyRating <= 2 && (
                          <>
                            <span className="px-2 py-1 bg-error-custom text-white text-xs rounded">High Risk</span>
                            <span className="px-2 py-1 bg-warning-custom text-white text-xs rounded">Seek Help</span>
                          </>
                        )}
                        {stats.avgSafetyRating > 2 && stats.avgSafetyRating <= 3 && (
                          <span className="px-2 py-1 bg-warning-custom text-white text-xs rounded">Moderate Risk</span>
                        )}
                        {stats.avgSafetyRating > 3 && (
                          <span className="px-2 py-1 bg-success-custom text-white text-xs rounded">Improving</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                {!stats?.total && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No impact data</p>
                    <p className="text-xs">Log incidents with safety ratings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </CardContent>
    </Card>
  );
}
