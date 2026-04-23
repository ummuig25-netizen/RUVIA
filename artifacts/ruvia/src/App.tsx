import { useEffect } from "react";
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

import { useAppStore } from "@/store/useAppStore";
import { useRealtimeBroadcast } from "@/hooks/useRealtimeBroadcast";
import { authService } from "@/services/auth";
import { startDriverSimulator } from "@/services/driverSimulator";

const queryClient = new QueryClient();

function AuthGate({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "passenger" | "driver";
}) {
  const [, navigate] = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
    } else if (role && currentUser.role !== role) {
      navigate(currentUser.role === "driver" ? "/driver" : "/passenger");
    }
  }, [currentUser, role, navigate]);

  if (!currentUser) return null;
  if (role && currentUser.role !== role) return null;
  return <>{children}</>;
}

function AppShell() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  useRealtimeBroadcast();

  useEffect(() => {
    // Restore session
    const saved = authService.getCurrentUser();
    if (saved) setCurrentUser(saved);
    // Start the simulated driver fleet (background bots)
    startDriverSimulator(null);
  }, [setCurrentUser]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/passenger">
        <AuthGate role="passenger">
          <PassengerHome />
        </AuthGate>
      </Route>
      <Route path="/driver">
        <AuthGate role="driver">
          <DriverHome />
        </AuthGate>
      </Route>
      <Route path="/profile">
        <AuthGate>
          <Profile />
        </AuthGate>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
