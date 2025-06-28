import { Plus, TriangleAlert, Headphones } from "lucide-react";
import Layout from "@/components/layout";
import IncidentForm from "@/components/incident-form";
import Sidebar from "@/components/sidebar";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <Layout>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Incident Form */}
          <div className="lg:col-span-2">
            <IncidentForm />
          </div>

          {/* Sidebar */}
          <div>
            <Sidebar />
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="mt-12">
          <AnalyticsDashboard />
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <Button 
            size="sm" 
            className="w-12 h-12 bg-error-custom text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
          >
            <TriangleAlert className="h-5 w-5" />
          </Button>
          <Button 
            size="sm" 
            className="w-12 h-12 bg-accent-custom text-white rounded-full shadow-lg hover:bg-teal-600 transition-colors"
          >
            <Headphones className="h-5 w-5" />
          </Button>
          <Button 
            size="sm" 
            className="w-14 h-14 bg-primary-custom text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}