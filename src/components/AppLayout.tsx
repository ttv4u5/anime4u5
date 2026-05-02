import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated } from "@/lib/auth-components.tsx";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { Clock, Car, Upload, LayoutDashboard, Shield, Zap, LogOut, Home, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", labelBM: "Papan Pemuka", icon: <LayoutDashboard size={18} /> },
  { path: "/time-card", label: "Time Card", labelBM: "Kad Waktu", icon: <Clock size={18} /> },
  { path: "/travel-log", label: "Travel Log", labelBM: "Log Perjalanan", icon: <Car size={18} /> },
  { path: "/files", label: "Files", labelBM: "Fail", icon: <Upload size={18} /> },
  { path: "/admin", label: "Admin", labelBM: "Admin", icon: <Shield size={18} /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { removeUser, user } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser, user ? {} : "skip");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Speed lines bg */}
      <div className="fixed inset-0 pointer-events-none speed-lines opacity-10 z-0" />

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border/50 bg-sidebar/80 backdrop-blur-sm fixed top-0 bottom-0 left-0 z-30">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Zap size={22} className="text-primary animate-energy-burst" />
          <span className="font-bold text-sm shimmer-text" style={{ fontFamily: "Orbitron, sans-serif" }}>SISTEM REKOD</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
          >
            <Home size={18} /> Laman Utama
          </button>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  active
                    ? "bg-primary/20 text-primary glow-box-orange border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className={active ? "text-primary" : ""}>{item.icon}</span>
                <span>{item.labelBM}</span>
                {active && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </button>
            );
          })}
        </nav>
        {/* User info */}
        <div className="p-3 border-t border-border/50">
          <Authenticated>
            <div className="flex items-center gap-2 mb-2">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-primary/40" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {currentUser?.name?.[0] ?? "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{currentUser?.name ?? "User"}</div>
                {currentUser?.role === "superadmin" && (
                  <div className="text-xs text-primary">Super Admin</div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeUser()}
              className="w-full text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut size={14} /> Log Keluar
            </Button>
          </Authenticated>
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-sidebar/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-primary" />
          <span className="font-bold text-sm shimmer-text" style={{ fontFamily: "Orbitron, sans-serif" }}>SISTEM REKOD</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground cursor-pointer">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <motion.div
          className="md:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur-sm pt-16 px-4"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <nav className="space-y-2">
            <button onClick={() => { navigate("/"); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer">
              <Home size={20} /> Laman Utama
            </button>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg cursor-pointer ${
                  location.pathname === item.path ? "bg-primary/20 text-primary" : "text-muted-foreground"
                }`}
              >
                {item.icon} {item.labelBM}
              </button>
            ))}
            <Authenticated>
              <Button variant="ghost" onClick={() => removeUser()} className="w-full text-destructive mt-4">
                <LogOut size={16} /> Log Keluar
              </Button>
            </Authenticated>
          </nav>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen z-10 relative">
        {children}
      </main>
    </div>
  );
}
