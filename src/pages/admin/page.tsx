import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "@/lib/auth-components.tsx";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import AppLayout from "@/components/AppLayout.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shield, UserCog, Star, Zap } from "lucide-react";
import { toast } from "sonner";

type User = Doc<"users">;

function AdminInner() {
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const allUsers = useQuery(api.users.getAllUsers, currentUser?.role === "superadmin" ? {} : "skip");
  const setRole = useMutation(api.users.setUserRole);

  if (currentUser?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
        <Shield size={64} className="text-muted-foreground opacity-30" />
        <h2 className="text-xl font-bold text-muted-foreground">Akses Ditolak • Access Denied</h2>
        <p className="text-sm text-muted-foreground">Halaman ini hanya untuk Super Admin</p>
        <p className="text-xs text-muted-foreground">This page is for Super Admin only</p>
      </div>
    );
  }

  const handleSetRole = async (userId: Id<"users">, role: string) => {
    try {
      await setRole({ targetUserId: userId, role });
      toast.success(`Peranan dikemas kini • Role updated to ${role}`);
    } catch {
      toast.error("Gagal kemas kini peranan • Failed to update role");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold shimmer-text flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
          <Shield size={24} /> PANEL SUPER ADMIN
        </h1>
        <p className="text-muted-foreground text-sm">Super Admin Panel • Pengurusan Pengguna</p>
      </div>

      {/* Current user badge */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3 glow-box-orange">
        <Star size={20} className="text-primary" />
        <div>
          <div className="font-bold text-primary text-sm">Anda adalah Super Admin • You are Super Admin</div>
          <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-card/70 border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <UserCog size={18} className="text-accent" />
          <h3 className="font-bold text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
            SEMUA PENGGUNA • ALL USERS ({allUsers?.length ?? 0})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="anime-table w-full">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama</th>
                <th>Emel</th>
                <th>Peranan</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {(allUsers ?? []).map((u: User, i: number) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="text-center text-muted-foreground">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                          {u.name?.[0] ?? "U"}
                        </div>
                      )}
                      <span>{u.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="text-xs text-muted-foreground">{u.email ?? "—"}</td>
                  <td>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      u.role === "superadmin"
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {u.role === "superadmin" ? "Super Admin" : "Pengguna"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {u._id !== currentUser?._id && (
                        <>
                          {u.role !== "superadmin" ? (
                            <Button
                              size="sm"
                              onClick={() => handleSetRole(u._id, "superadmin")}
                              className="text-xs h-7 glow-box-orange"
                            >
                              <Shield size={12} /> Jadikan Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetRole(u._id, "user")}
                              className="text-xs h-7"
                            >
                              Tukar ke Pengguna
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="text-xs text-muted-foreground border border-border/50 rounded-lg p-3 bg-card/30 space-y-1">
        <div className="font-bold text-primary">Nota Super Admin:</div>
        <div>• Super Admin boleh melihat dan mengurus semua pengguna</div>
        <div>• Super Admin boleh menambah Super Admin baru</div>
        <div>• Pengguna biasa hanya boleh lihat data mereka sendiri</div>
        <div>• Untuk menjadi Super Admin pertama: hubungi administrator sistem</div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AppLayout>
      <Authenticated>
        <AdminInner />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
          <Zap size={48} className="text-primary animate-energy-burst" />
          <h2 className="text-xl font-bold">Sila Log Masuk • Please Sign In</h2>
          <SignInButton />
        </div>
      </Unauthenticated>
    </AppLayout>
  );
}
