import { Shield, Settings, Lock, BookOpen, Brain, PersonStanding } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Shield, description: "Log incidents & view analytics" },
    { path: "/education", label: "Learn", icon: BookOpen, description: "Educational resources", badge: "New" },
    { path: "/grey-rock", label: "Practice", icon: Brain, description: "Grey Rock simulator", badge: "New" },
    { path: "/boundaries", label: "Boundaries", icon: PersonStanding, description: "Build & track boundaries", badge: "New" }
  ];

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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}