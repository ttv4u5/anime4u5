import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated } from "@/lib/auth-components.tsx";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import AppLayout from "@/components/AppLayout.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Clock, Car, Upload, FileText, Zap, ChevronRight } from "lucide-react";

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
    <div>
      <div className="flex items-end gap-2">
        <span className="text-4xl md:text-5xl font-bold neon-orange" style={{ fontFamily: "Orbitron, sans-serif" }}>
          {displayHours}:{minutes}
        </span>
        <span className="text-2xl md:text-3xl font-bold text-primary mb-1 animate-pulse-glow">:{seconds}</span>
        <span className="text-lg text-accent mb-2">{ampm}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{day}, {date}</div>
    </div>
  );
}

function DashboardInner() {
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const timeCards1 = useQuery(api.timeCards.getTimeCards, { pageNumber: 1 });
  const timeCards2 = useQuery(api.timeCards.getTimeCards, { pageNumber: 2 });
  const travelLogs = useQuery(api.travelLogs.getTravelLogs, {});
  const files = useQuery(api.files.getUploadedFiles, {});

  const totalTravelCost = travelLogs?.reduce((sum, log) => sum + (log.kos ?? 0), 0) ?? 0;
  const totalDistance = travelLogs?.reduce((sum, log) => sum + (log.jarak ?? 0), 0) ?? 0;

  const stats = [
    { label: "Rekod Masa", labelEN: "Time Records", value: (timeCards1?.length ?? 0) + (timeCards2?.length ?? 0), icon: <Clock size={22} />, color: "orange", path: "/time-card" },
    { label: "Log Perjalanan", labelEN: "Travel Logs", value: travelLogs?.length ?? 0, icon: <Car size={22} />, color: "blue", path: "/travel-log" },
    { label: "Fail Diupload", labelEN: "Files Uploaded", value: files?.length ?? 0, icon: <Upload size={22} />, color: "cyan", path: "/files" },
    { label: "Jumlah Kos", labelEN: "Total Cost", value: `RM ${totalTravelCost.toFixed(2)}`, icon: <FileText size={22} />, color: "purple", path: "/travel-log" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold shimmer-text" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Papan Pemuka
          </h1>
          <p className="text-muted-foreground text-sm">Selamat datang, {currentUser?.name ?? "Pengguna"} • Dashboard</p>
        </div>
        <div className="scan-overlay bg-card/60 border border-primary/30 rounded-xl px-5 py-3 glow-box-orange">
          <RealtimeClock />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.button
            key={s.path + s.label}
            className="bg-card/70 border border-border rounded-xl p-4 text-left cursor-pointer hover:scale-105 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(s.path)}
          >
            <div className={`mb-2 ${s.color === "orange" ? "text-primary" : s.color === "blue" ? "text-blue-400" : s.color === "cyan" ? "text-accent" : "text-purple-400"}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-primary font-semibold">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.labelEN}</div>
          </motion.button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-primary" style={{ fontFamily: "Orbitron, sans-serif" }}>
          Tindakan Pantas • Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Tambah Rekod Masa", labelEN: "Add Time Record", path: "/time-card", color: "orange" },
            { label: "Tambah Log Perjalanan", labelEN: "Add Travel Log", path: "/travel-log", color: "blue" },
            { label: "Upload Fail", labelEN: "Upload File", path: "/files", color: "cyan" },
          ].map((a) => (
            <Button
              key={a.path}
              onClick={() => navigate(a.path)}
              className={`h-16 text-left justify-start gap-3 ${a.color === "orange" ? "glow-box-orange" : a.color === "blue" ? "glow-box-blue" : "glow-box-cyan"}`}
            >
              <Zap size={18} />
              <div>
                <div className="font-bold text-sm">{a.label}</div>
                <div className="text-xs opacity-70">{a.labelEN}</div>
              </div>
              <ChevronRight size={16} className="ml-auto" />
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/70 border border-border rounded-xl p-4">
          <h3 className="font-bold text-primary mb-3 text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Ringkasan Perjalanan • Travel Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Perjalanan</span>
              <span className="font-bold text-foreground">{travelLogs?.length ?? 0} rekod</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Jarak</span>
              <span className="font-bold text-foreground">{totalDistance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Kos Bahan Api</span>
              <span className="font-bold text-primary">RM {totalTravelCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="bg-card/70 border border-border rounded-xl p-4">
          <h3 className="font-bold text-accent mb-3 text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Maklumat Akaun • Account Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-bold">{currentUser?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emel</span>
              <span className="font-bold text-xs">{currentUser?.email ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peranan</span>
              <span className={`font-bold ${currentUser?.role === "superadmin" ? "text-primary" : "text-accent"}`}>
                {currentUser?.role === "superadmin" ? "Super Admin" : "Pengguna"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <Authenticated>
        <DashboardInner />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
          <Zap size={48} className="text-primary animate-energy-burst" />
          <h2 className="text-xl font-bold text-center">Sila Log Masuk • Please Sign In</h2>
          <SignInButton />
        </div>
      </Unauthenticated>
    </AppLayout>
  );
}
