import { Link } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import { Users, Car } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/services/auth";

export default function AdminDashboard() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <div className="absolute top-0 left-0 w-full h-72 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.12),transparent_70%)] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <BrandLogo size="sm" />
        <button 
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Logout
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Admin Control Center</h1>
          <p className="text-base text-muted-foreground mb-12">
            Welcome to the RUVIA admin center. Choose which side of the platform you want to view.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/passenger-dashboard">
              <a className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-card-border hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(255,215,0,0.1)] transition-all group">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Passenger View</h2>
                  <p className="text-sm text-muted-foreground">Experience the application from the client's perspective.</p>
                </div>
              </a>
            </Link>
            
            <Link href="/driver-dashboard">
              <a className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-card-border hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(255,215,0,0.1)] transition-all group">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Car className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Driver View</h2>
                  <p className="text-sm text-muted-foreground">Experience the application from the driver's perspective.</p>
                </div>
              </a>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
