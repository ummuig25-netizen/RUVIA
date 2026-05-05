import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import PassengerHome from "@/pages/PassengerHome";
import DriverHome from "@/pages/DriverHome";
import Profile from "@/pages/Profile";
import TripHistory from "@/pages/TripHistory";
import AdminDashboard from "@/pages/AdminDashboard";

import { useAppStore } from "@/store/useAppStore";
import { useRealtimeBroadcast } from "@/hooks/useRealtimeBroadcast";
import { useScheduledRides } from "@/hooks/useScheduledRides";
import { authService } from "@/services/auth";
import { startDriverSimulator } from "@/services/driverSimulator";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "passenger" | "driver" | "admin";
}) {
  const [, navigate] = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate("/auth");
      } else if (role && user.role !== role && user.role !== "admin") {
        const dashboardMap: Record<string, string> = {
          driver: "/driver-dashboard",
          passenger: "/passenger-dashboard",
          admin: "/admin-dashboard"
        };
        navigate(dashboardMap[user.role] || "/");
      }
      setLoading(false);
    };
    checkAuth();
  }, [currentUser, role, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>;
  
  if (!currentUser) return null;
  if (role && currentUser.role !== role && currentUser.role !== "admin") return null;
  return <>{children}</>;
}

function AppShell() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  useRealtimeBroadcast();
  useScheduledRides();

  useEffect(() => {
    const init = async () => {
      const saved = await authService.getCurrentUser();
      if (saved) setCurrentUser(saved);
      startDriverSimulator(null);
    };
    init();
  }, [setCurrentUser]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      
      <Route path="/admin-dashboard">
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/passenger-dashboard">
        <ProtectedRoute role="passenger">
          <PassengerHome />
        </ProtectedRoute>
      </Route>
      
      <Route path="/driver-dashboard">
        <ProtectedRoute role="driver">
          <DriverHome />
        </ProtectedRoute>
      </Route>

      {/* Legacy redirects */}
      <Route path="/passenger">
        <ProtectedRoute role="passenger">
          <PassengerHome />
        </ProtectedRoute>
      </Route>
      <Route path="/driver">
        <ProtectedRoute role="driver">
          <DriverHome />
        </ProtectedRoute>
      </Route>
      
      <Route path="/history">
        <ProtectedRoute>
          <TripHistory />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_url' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  if (!isSupabaseConfigured) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter>
            <Switch>
              <Route path="/" component={Landing} />
              <Route>
                <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
                  <div className="max-w-md space-y-6 glass p-8 rounded-3xl border-primary/20">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                        <span className="text-primary text-3xl font-bold">!</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold text-primary">Configuration Required</h1>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        To access the application, you need to connect your Supabase project. 
                        Please add your credentials to the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">.env</code> file.
                      </p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl text-left font-mono text-[11px] space-y-1 border border-white/5 overflow-x-auto">
                      <p className="text-muted-foreground"># .env</p>
                      <p><span className="text-primary">VITE_SUPABASE_URL</span>=https://your-id.supabase.co</p>
                      <p><span className="text-primary">VITE_SUPABASE_ANON_KEY</span>=eyJhbGciOiJIUzI1...</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Check <code className="text-foreground">schema.sql</code> for the database structure.
                    </p>
                  </div>
                </div>
              </Route>
            </Switch>
          </WouterRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppShell />
        </WouterRouter>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--card-border))",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


export default App;

