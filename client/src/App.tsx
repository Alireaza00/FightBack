import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import EducationalResourcesPage from "@/pages/educational-resources";
import GreyRockSimulatorPage from "@/pages/grey-rock-simulator";
import BoundaryBuilderPage from "@/pages/boundary-builder";
import SubscriptionPage from "@/pages/subscription";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/education" component={EducationalResourcesPage} />
      <Route path="/grey-rock" component={GreyRockSimulatorPage} />
      <Route path="/boundaries" component={BoundaryBuilderPage} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
