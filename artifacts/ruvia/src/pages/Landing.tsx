import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Zap } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      {/* Dynamic Glows */}
      <div className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <BrandLogo size="md" />
        <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all px-5 py-2 rounded-full border border-white/5 hover:bg-white/5">
          Sign in
        </Link>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-primary mb-8 font-semibold">
            <span className="h-px w-10 bg-primary/50" />
            Rethinking Urban Mobility
          </span>
          <h1 className="text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight">
            The ride your
            <br />
            <span className="gradient-text">city deserves.</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground max-w-lg leading-relaxed font-light">
            RUVIA is the fair alternative for drivers and riders. No commissions per trip, 
            just a fixed subscription for a more sustainable and just city.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all shadow-[0_10px_40px_rgba(255,215,0,0.3)] group"
              data-testid="button-get-started"
            >
              Get started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full glass hover:bg-white/10 transition-all font-semibold"
            >
              I'm a driver
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md">
            <Feature icon={<Zap className="w-5 h-5" />} label="Live ETAs" />
            <Feature icon={<MapPin className="w-5 h-5" />} label="Tap to book" />
            <Feature icon={<ShieldCheck className="w-5 h-5" />} label="Safe-Link" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative perspective-1000 hidden lg:block"
        >
          <div className="aspect-[4/5] rounded-[40px] glass-dark p-8 relative overflow-hidden shadow-2xl animate-float border-white/10">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.2),transparent_70%)]" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Arrival</p>
                  <p className="text-4xl font-bold mt-1">4 min</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Fixed Fare</p>
                  <p className="text-4xl font-bold text-primary mt-1">$12.40</p>
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-primary glow-primary" />
                  <span className="text-lg font-light">Calle 100, Bogota</span>
                </div>
                <div className="ml-[5px] h-10 border-l border-dashed border-white/20" />
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <span className="text-lg font-light">Centro Comercial Andino</span>
                </div>
              </div>

              <div className="mt-auto glass p-6 rounded-3xl flex items-center gap-4 border-white/5">
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xl border border-primary/30">R</div>
                <div className="flex-1">
                  <p className="text-lg font-semibold">Rodrigo Mendoza</p>
                  <p className="text-xs text-muted-foreground font-medium">Tesla Model S · RUV-882</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-primary font-bold">★ 4.98</span>
                  <p className="text-[10px] text-muted-foreground">Top Rated</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center border-t border-white/5 mt-12 gap-4">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} RUVIA · Built for cities that move.</p>
        <div className="flex gap-8">
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-semibold">Privacy</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-semibold">Terms</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-semibold">Safety</a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-3 p-4 rounded-2xl glass hover:bg-white/5 transition-all group">
      <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

