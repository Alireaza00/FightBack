import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  BarChart3, 
  UserPlus, 
  UserMinus,
  Settings,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newSignups: number;
  churnRate: number;
  popularFeatures: Record<string, number>;
}

interface User {
  id: number;
  username: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  isAdmin: boolean;
  createdAt: string;
  incidentsThisMonth: number;
}

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

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: metrics, isLoading: metricsLoading } = useQuery<AdminMetrics>({
    queryKey: ["/api/admin/metrics"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/admin/subscription-plans"],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: Partial<SubscriptionPlan>) => {
      const response = await apiRequest("POST", "/api/admin/subscription-plans", planData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription plan created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsCreatePlanOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create subscription plan.", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditUserOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    },
  });

  const togglePlanStatusMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("PATCH", `/api/admin/subscription-plans/${planId}/toggle-status`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Plan status updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update plan status.", variant: "destructive" });
    },
  });

  const handleCreatePlan = (formData: FormData) => {
    const planData = {
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      price: parseInt(formData.get("price") as string) * 100, // Convert to cents
      currency: "usd",
      interval: formData.get("interval") as string,
      incidentLimit: parseInt(formData.get("incidentLimit") as string),
      features: JSON.parse(formData.get("features") as string || "{}"),
    };
    createPlanMutation.mutate(planData);
  };

  const handleUpdateUser = (formData: FormData) => {
    if (!selectedUser) return;
    
    const userData = {
      subscriptionTier: formData.get("subscriptionTier") as string,
      subscriptionStatus: formData.get("subscriptionStatus") as string,
      isAdmin: formData.get("isAdmin") === "true",
    };
    updateUserMutation.mutate({ userId: selectedUser.id, data: userData });
  };

  if (metricsLoading || usersLoading || plansLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, subscriptions, and platform metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreatePlanOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.newSignups || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.churnRate || 0}% churn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${((metrics?.monthlyRevenue || 0) / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics?.popularFeatures || {}).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total feature usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {user.username}
                              {user.isAdmin && <Shield className="w-3 h-3 text-blue-500" />}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscriptionTier === "free" ? "secondary" : "default"}>
                          {user.subscriptionTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.subscriptionStatus === "active" ? "default" : "destructive"}
                        >
                          {user.subscriptionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.incidentsThisMonth} incidents</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditUserOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage pricing plans and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Incident Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.displayName}</TableCell>
                      <TableCell>${(plan.price / 100).toFixed(2)}</TableCell>
                      <TableCell>{plan.interval}</TableCell>
                      <TableCell>
                        {plan.incidentLimit === -1 ? "Unlimited" : plan.incidentLimit}
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePlanStatusMutation.mutate(plan.id)}
                        >
                          {plan.isActive ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Features</CardTitle>
                <CardDescription>Most used platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics?.popularFeatures || {}).map(([feature, count]) => (
                    <div key={feature} className="flex justify-between items-center">
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.filter(p => p.isActive).map((plan) => {
                    const subscribers = users.filter(u => u.subscriptionTier === plan.name && u.subscriptionStatus === "active").length;
                    const revenue = subscribers * plan.price;
                    return (
                      <div key={plan.id} className="flex justify-between items-center">
                        <span>{plan.displayName}</span>
                        <div className="text-right">
                          <div className="font-medium">${(revenue / 100).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{subscribers} subscribers</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan to the platform
            </DialogDescription>
          </DialogHeader>
          
          <form action={handleCreatePlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" name="name" placeholder="e.g., premium" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" name="displayName" placeholder="e.g., Premium Plan" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interval">Interval</Label>
                <Select name="interval" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidentLimit">Incident Limit (-1 for unlimited)</Label>
              <Input id="incidentLimit" name="incidentLimit" type="number" defaultValue="-1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="features">Features (JSON)</Label>
              <Textarea 
                id="features" 
                name="features" 
                placeholder='{"aiAnalysis": true, "exportReports": true}'
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlanMutation.isPending}>
                Create Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user subscription and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <form action={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={selectedUser.username} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                <Select name="subscriptionTier" defaultValue={selectedUser.subscriptionTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="therapeutic">Therapeutic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                <Select name="subscriptionStatus" defaultValue={selectedUser.subscriptionStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isAdmin">Admin Access</Label>
                <Select name="isAdmin" defaultValue={selectedUser.isAdmin.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  Update User
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}