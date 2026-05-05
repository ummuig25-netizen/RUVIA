import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, User, Car, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";
import { authService } from "../services/auth";
import { useAppStore } from "../store/useAppStore";
import type { Role } from "../types";
import { cn } from "../lib/utils";

type Mode = "signin" | "register";

export default function Auth() {
  const [, navigate] = useLocation();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("passenger");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let profile;
      if (mode === "register") {
        if (!name.trim() || !email.trim() || !password.trim()) {
          toast.error("Please fill out all fields.");
          return;
        }
        profile = await authService.register(name.trim(), email.trim().toLowerCase(), role);
        toast.success(`Welcome, ${profile.name}.`);
      } else {
        if (!email.trim()) {
          toast.error("Enter your email.");
          return;
        }
        profile = await authService.login(email.trim().toLowerCase());
        toast.success(`Welcome back, ${profile.name}.`);
      }
      setCurrentUser(profile);
      navigate(profile.role === "admin" ? "/admin-dashboard" : profile.role === "driver" ? "/driver-dashboard" : "/passenger-dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };


  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <div className="absolute top-0 left-0 w-full h-72 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.12),transparent_70%)] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <BrandLogo size="sm" />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <h1 className="text-3xl font-semibold mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "signin" ? "Sign in to continue your journey." : "Pick your role to get started."}
          </p>

          <div className="flex p-1 bg-card border border-card-border rounded-full mb-6">
            <button
              onClick={() => setMode("signin")}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-medium transition-colors",
                mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("register")}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-medium transition-colors",
                mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Full name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Jane Doe"
                  data-testid="input-name"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="you@email.com"
                data-testid="input-email"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                data-testid="input-password"
              />
            </Field>

            {mode === "register" && (
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">I am a</label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <RoleCard
                    icon={<User className="w-5 h-5" />}
                    label="Passenger"
                    selected={role === "passenger"}
                    onClick={() => setRole("passenger")}
                  />
                  <RoleCard
                    icon={<Car className="w-5 h-5" />}
                    label="Driver"
                    selected={role === "driver"}
                    onClick={() => setRole("driver")}
                  />
                  <RoleCard
                    icon={<ShieldCheck className="w-5 h-5" />}
                    label="Admin"
                    selected={role === "admin"}
                    onClick={() => setRole("admin")}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(255,215,0,0.2)]"
              data-testid="button-submit"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RoleCard({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left",
        selected
          ? "bg-primary/10 border-primary/50 text-foreground"
          : "bg-card border-card-border text-muted-foreground hover:border-muted-foreground/40",
      )}
      data-testid={`role-${label.toLowerCase()}`}
    >
      <span className={cn("p-2 rounded-lg", selected ? "bg-primary text-primary-foreground" : "bg-background")}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
