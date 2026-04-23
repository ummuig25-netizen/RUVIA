import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Zap } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <BrandLogo size="md" />
        <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Sign in
        </Link>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-6">
            <span className="h-px w-8 bg-primary" />
            Premium Rides
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            The ride your
            <br />
            <span className="text-primary">city deserves.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
            RUVIA pairs riders and drivers in real time with a clean, no-nonsense
            interface built for the way you actually move.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(255,215,0,0.25)]"
              data-testid="button-get-started"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-card-border text-foreground hover:bg-card transition-colors"
            >
              I'm a driver
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            <Feature icon={<Zap className="w-4 h-4" />} label="Live ETAs" />
            <Feature icon={<MapPin className="w-4 h-4" />} label="Tap to book" />
            <Feature icon={<ShieldCheck className="w-4 h-4" />} label="Trusted drivers" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-card to-background border border-card-border p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.15),transparent_60%)]" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated</p>
                  <p className="text-3xl font-semibold">4 min</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Fare</p>
                  <p className="text-3xl font-semibold text-primary">$12.40</p>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Mission District, SF</span>
                </div>
                <div className="ml-1 h-6 border-l border-dashed border-card-border" />
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                  <span className="text-sm">Embarcadero Pier 14</span>
                </div>
              </div>
              <div className="mt-auto rounded-2xl bg-background/80 border border-card-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">M</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Marcus Rivera</p>
                  <p className="text-xs text-muted-foreground">Tesla Model 3 · RV-1245</p>
                </div>
                <span className="text-xs text-primary font-medium">★ 4.96</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} RUVIA · Built for cities that move.
      </footer>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5 text-muted-foreground">
      <span className="w-8 h-8 rounded-full bg-card border border-card-border flex items-center justify-center text-primary">
        {icon}
      </span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
