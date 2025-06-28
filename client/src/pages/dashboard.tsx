import { Shield, Settings, Lock, Plus, TriangleAlert, Headphones } from "lucide-react";
import IncidentForm from "@/components/incident-form";
import Sidebar from "@/components/sidebar";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-custom">
      {/* Security Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="text-primary-custom text-xl" />
              <h1 className="text-xl font-semibold text-gray-800">Personal Wellness Journal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                <Lock className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  );
}
