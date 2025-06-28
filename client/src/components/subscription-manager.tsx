import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, Shield, Star, Users, FileText, Brain } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_FEATURES } from "@shared/schema";

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  interval: string;
  features: any;
  incidentLimit: number;
  isActive: boolean;
}

interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: SubscriptionPlan;
}

const planIcons = {
  free: Users,
  basic: Zap,
  pro: Crown,
  therapeutic: Shield,
};

const planColors = {
  free: "bg-gray-100 border-gray-200",
  basic: "bg-blue-50 border-blue-200",
  pro: "bg-purple-50 border-purple-200",
  therapeutic: "bg-green-50 border-green-200",
};

const planButtonColors = {
  free: "bg-gray-600 hover:bg-gray-700",
  basic: "bg-blue-600 hover:bg-blue-700",
  pro: "bg-purple-600 hover:bg-purple-700",
  therapeutic: "bg-green-600 hover:bg-green-700",
};

export default function SubscriptionManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: currentSubscription, isLoading: subLoading } = useQuery<UserSubscription>({
    queryKey: ["/api/user-subscription"],
  });

  const { data: usage, isLoading: usageLoading } = useQuery<{
    incidentsThisMonth: number;
    incidentLimit: number;
    lessonsCompleted: number;
    greyRockAttempts: number;
  }>({
    queryKey: ["/api/subscription-usage"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("POST", "/api/upgrade-subscription", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated successfully!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user-subscription"] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cancel-subscription");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll keep access until the end of your billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-subscription"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: number) => {
    setIsLoading(true);
    upgradeMutation.mutate(planId, {
      onSettled: () => setIsLoading(false),
    });
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      cancelMutation.mutate();
    }
  };

  if (plansLoading || subLoading || usageLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan || { name: "free", displayName: "Free" };
  const usagePercent = usage?.incidentLimit === -1 ? 0 : 
    Math.round((usage?.incidentsThisMonth || 0) / (usage?.incidentLimit || 10) * 100);

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and view your usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan.displayName}</h3>
              <p className="text-sm text-muted-foreground">
                {currentSubscription?.status === "active" ? "Active" : "Inactive"}
              </p>
            </div>
            {currentSubscription && currentSubscription.plan.name !== "free" && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                Cancel Subscription
              </Button>
            )}
          </div>

          {usage && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Incidents</span>
                  <span>
                    {usage.incidentsThisMonth} / {usage.incidentLimit === -1 ? "Unlimited" : usage.incidentLimit}
                  </span>
                </div>
                {usage.incidentLimit !== -1 && (
                  <Progress value={usagePercent} className="h-2" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Lessons Completed:</span>
                  <div className="font-semibold">{usage.lessonsCompleted}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Practice Sessions:</span>
                  <div className="font-semibold">{usage.greyRockAttempts}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name as keyof typeof planIcons] || Users;
          const features = SUBSCRIPTION_FEATURES[plan.name as keyof typeof SUBSCRIPTION_FEATURES] || {};
          const isCurrentPlan = currentPlan.name === plan.name;
          const isUpgrade = plans.findIndex(p => p.name === currentPlan.name) < plans.findIndex(p => p.name === plan.name);

          return (
            <Card
              key={plan.id}
              className={`relative ${planColors[plan.name as keyof typeof planColors]} ${
                isCurrentPlan ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {plan.name === "pro" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price / 100}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.interval}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {features.incidentLimit === -1 ? "Unlimited" : features.incidentLimit} incidents/month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {features.educationalLessons === -1 ? "All" : features.educationalLessons} educational lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {features.greyRockScenarios === -1 ? "All" : features.greyRockScenarios} practice scenarios
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {features.boundaryTemplates === -1 ? "All" : features.boundaryTemplates} boundary templates
                  </li>
                  {features.aiAnalysis && (
                    <li className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      AI-powered insights
                    </li>
                  )}
                  {features.exportReports && (
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Export reports
                    </li>
                  )}
                  {features.prioritySupport && (
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Priority support
                    </li>
                  )}
                </ul>

                <Separator />

                <Button
                  className={`w-full ${planButtonColors[plan.name as keyof typeof planButtonColors]}`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || isLoading}
                  variant={isCurrentPlan ? "secondary" : "default"}
                >
                  {isCurrentPlan ? "Current Plan" : isUpgrade ? "Upgrade" : "Downgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}