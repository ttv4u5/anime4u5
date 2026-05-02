import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "@/lib/auth-components.tsx";
import { motion, AnimatePresence } from "motion/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Clock, FileText, Car, Upload, Shield, ChevronRight, Zap, Star } from "lucide-react";

// Particle component
function Particle({ index }: { index: number }) {
  const style = {
    left: `${Math.random() * 100}%`,
    bottom: `-10px`,
    width: `${2 + Math.random() * 4}px`,
    height: `${2 + Math.random() * 4}px`,
    animationDuration: `${4 + Math.random() * 8}s`,
    animationDelay: `${Math.random() * 5}s`,
    backgroundColor: index % 3 === 0
      ? "oklch(0.75 0.28 30)"
      : index % 3 === 1
        ? "oklch(0.7 0.3 220)"
        : "oklch(0.75 0.25 185)",
    borderRadius: "50%",
    position: "absolute" as const,
    opacity: 0,
  };
  return <div className="animate-float-particle" style={style} />;
}

// Realtime Clock
function RealtimeClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PTG/MLM" : "PG";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");
  const day = time.toLocaleDateString("ms-MY", { weekday: "long" });
  const date = time.toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-2">
        <span className="text-5xl md:text-7xl font-bold neon-orange tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
          {displayHours}:{minutes}
        </span>
        <span className="text-3xl md:text-5xl font-bold text-primary mb-1 animate-pulse-glow">:{seconds}</span>
        <span className="text-xl md:text-2xl font-bold text-accent mb-2 ml-1">{ampm}</span>
      </div>
      <div className="text-sm text-muted-foreground tracking-wider uppercase">{day}, {date}</div>
    </div>
  );
}

const features = [
  {
    icon: <Clock size={28} />,
    titleBM: "Kad Mencatat Waktu",
    titleEN: "Time Card",
    descBM: "Rekod masuk/keluar, OT otomatik, highlight merah lewat",
    descEN: "Auto OT detection, late highlight, WFB government hours",
    color: "orange",
    path: "/time-card",
  },
  {
    icon: <Car size={28} />,
    titleBM: "Log Perjalanan",
    titleEN: "Travel Log",
    descBM: "Odometer automatik, kos bahan api, rekod perjalanan kerajaan",
    descEN: "Auto odometer calc, fuel cost, gov travel records",
    color: "blue",
    path: "/travel-log",
  },
  {
    icon: <Upload size={28} />,
    titleBM: "Upload Fail",
    titleEN: "File Upload",
    descBM: "Resit minyak, TNG, gambar odometer – tersimpan selamat",
    descEN: "Fuel receipts, TNG, odometer photos – securely stored",
    color: "cyan",
    path: "/files",
  },
  {
    icon: <FileText size={28} />,
    titleBM: "Eksport Data",
    titleEN: "Data Export",
    descBM: "Export CSV, Excel, cetak rekod – sokong Office 365",
    descEN: "Export CSV, Excel, print records – Office 365 support",
    color: "purple",
    path: "/dashboard",
  },
  {
    icon: <Shield size={28} />,
    titleBM: "Super Admin",
    titleEN: "Super Admin",
    descBM: "Kawal semua data pengguna, tambah admin baru",
    descEN: "Manage all user data, add new admins",
    color: "orange",
    path: "/admin",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [introComplete, setIntroComplete] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const particlesRef = useRef<number[]>([...Array(30)].map((_, i) => i));

  useEffect(() => {
    const t = setTimeout(() => setIntroComplete(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const glowColors: Record<string, string> = {
    orange: "glow-box-orange",
    blue: "glow-box-blue",
    cyan: "glow-box-cyan",
    purple: "glow-box-blue",
  };
  const textColors: Record<string, string> = {
    orange: "text-primary neon-orange",
    blue: "text-blue-400 neon-blue",
    cyan: "text-accent neon-cyan",
    purple: "text-purple-400",
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Animated particle background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particlesRef.current.map((i) => <Particle key={i} index={i} />)}
        {/* Speed lines */}
        <div className="absolute inset-0 speed-lines opacity-30" />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />
        <div
          className="absolute top-0 left-0 right-0 h-96 opacity-20"
          style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.7 0.28 30 / 40%), transparent 70%)" }}
        />
      </div>

      {/* Anime intro screen */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "oklch(0.04 0.02 265)" }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-8xl mb-6"
              >
                <Zap size={80} className="text-primary mx-auto" style={{ filter: "drop-shadow(0 0 20px oklch(0.75 0.28 30))" }} />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold shimmer-text mb-2"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                SISTEM REKOD
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-accent text-lg tracking-widest"
              >
                KERAJAAN MALAYSIA
              </motion.p>
              <motion.div
                className="mt-8 flex gap-1 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-40">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: introComplete ? 1 : 0, x: introComplete ? 0 : -20 }}
            transition={{ duration: 0.5 }}
          >
            <Zap size={28} className="text-primary animate-energy-burst" />
            <span className="font-bold text-lg shimmer-text hidden sm:block" style={{ fontFamily: "Orbitron, sans-serif" }}>
              SISTEM REKOD
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: introComplete ? 1 : 0, x: introComplete ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
            <Authenticated>
              <Button onClick={() => navigate("/dashboard")} className="glow-box-orange">
                Dashboard <ChevronRight size={16} />
              </Button>
            </Authenticated>
            <AuthLoading>
              <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
            </AuthLoading>
          </motion.div>
        </nav>

        {/* Main hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-10">
          {/* Clock */}
          <motion.div
            className="scan-overlay bg-card/60 border border-primary/30 rounded-2xl px-8 py-6 backdrop-blur-sm glow-box-orange text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : -30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <RealtimeClock />
          </motion.div>

          {/* Hero image + title */}
          <div className="flex flex-col lg:flex-row items-center gap-8 max-w-6xl w-full">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: introComplete ? 1 : 0, x: introComplete ? 0 : -50 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: "Orbitron, sans-serif" }}>
                <span className="shimmer-text">SISTEM REKOD</span>
                <br />
                <span className="neon-cyan text-accent">KERAJAAN</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                <span className="text-primary font-semibold">Kad Waktu • Log Perjalanan • Pengurusan Fail</span>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Government Record System • Time Card • Travel Log • File Management
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Unauthenticated>
                  <SignInButton />
                </Unauthenticated>
                <Authenticated>
                  <Button size="lg" onClick={() => navigate("/dashboard")} className="glow-box-orange text-lg px-8">
                    <Zap size={20} /> Masuk Dashboard
                  </Button>
                </Authenticated>
                <Button size="lg" variant="secondary" onClick={() => navigate("/time-card")}>
                  Lihat Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: introComplete ? 1 : 0, x: introComplete ? 0 : 50 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative rounded-2xl overflow-hidden glow-box-orange">
                <img
                  src="https://hercules-cdn.com/file_e55JXl75WZFzBKhtJrq3y26a"
                  alt="Anime characters"
                  className="w-full object-cover rounded-2xl"
                  style={{ maxHeight: "400px" }}
                />
                {/* Overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 flex-wrap">
                    {["MASA TEPAT", "DATA SELAMAT", "EXPORT MUDAH"].map((tag) => (
                      <span key={tag} className="text-xs bg-primary/20 border border-primary/40 text-primary px-2 py-1 rounded-full font-bold">
                        ⚡ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating stars */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${10 + i * 18}%`,
                    right: i % 2 === 0 ? "-15px" : "auto",
                    left: i % 2 === 1 ? "-15px" : "auto",
                  }}
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                >
                  <Star size={16} className="text-primary opacity-60" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 40 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {features.map((f, i) => (
              <motion.button
                key={f.path}
                className={`relative bg-card/70 border border-border rounded-xl p-4 text-left cursor-pointer transition-all duration-300 hover:scale-105 ${hoveredFeature === i ? glowColors[f.color] : ""}`}
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                onClick={() => navigate(f.path)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`mb-3 ${textColors[f.color]}`}>{f.icon}</div>
                <div className={`font-bold text-sm mb-1 ${textColors[f.color]}`} style={{ fontFamily: "Orbitron, sans-serif" }}>
                  {f.titleBM}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{f.titleEN}</div>
                <div className="text-xs text-foreground/70">{f.descBM}</div>
                {hoveredFeature === i && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: `radial-gradient(circle at center, oklch(0.7 0.28 30 / 10%), transparent)`,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Sistem Rekod Kerajaan Malaysia • </span>
          <span>Government Record System</span>
        </footer>
      </div>
    </div>
  );
}
