import { useLocation } from "wouter";
import { ArrowLeft, ChevronRight, Clock, LogOut, Mail, User as UserIcon } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { authService } from "../services/auth";
import { BrandLogo } from "../components/BrandLogo";

import { SafetySettings } from "../components/SafetySettings";

export default function Profile() {
  const [, navigate] = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  const signOut = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-20">
      <header className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate(currentUser.role === "driver" ? "/driver-dashboard" : "/passenger-dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <BrandLogo size="sm" />
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground text-3xl font-semibold flex items-center justify-center shadow-[0_8px_30px_rgba(255,215,0,0.25)]">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="mt-5 text-2xl font-semibold">{currentUser.name}</h1>
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium border border-primary/30">
            {currentUser.role === "driver" ? "Driver" : "Passenger"}
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Account Information</p>
          <div className="rounded-2xl bg-card border border-card-border divide-y divide-card-border">
            <Row icon={<UserIcon className="w-4 h-4" />} label="Name" value={currentUser.name} />
            <Row icon={<Mail className="w-4 h-4" />} label="Email" value={currentUser.email} />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Safety & Security</p>
          <SafetySettings />
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Activity</p>
          <button
            onClick={() => navigate("/history")}
            className="w-full rounded-2xl bg-card border border-card-border p-4 flex items-center gap-3 hover:bg-card/70 transition-colors"
            data-testid="button-history"
          >
            <span className="w-8 h-8 rounded-full bg-background border border-card-border flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Trip history</p>
              <p className="text-xs text-muted-foreground">
                See your past rides and totals
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <button
          onClick={signOut}
          className="w-full py-3.5 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 font-medium"
          data-testid="button-signout"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </main>
    </div>
  );
}


function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-8 h-8 rounded-full bg-background border border-card-border flex items-center justify-center text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
