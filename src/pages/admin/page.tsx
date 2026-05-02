import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2, ShieldCheck, Users, Search } from "lucide-react";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    async function getInitialData() {
      // 1. Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        // 2. Check if current user is super_admin
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'super_admin') {
          setIsSuperAdmin(true);
          // 3. Fetch all users for admin to see
          const { data: allUsers } = await supabase
            .from('users')
            .select('*')
            .order('name', { ascending: true });
          setUsers(allUsers || []);
        }
      }
      setLoading(false);
    }

    getInitialData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ShieldCheck size={64} className="text-red-500 opacity-50" />
          <h2 className="text-2xl font-bold">Akses Disekat • Access Denied</h2>
          <p className="text-muted-foreground">Hanya Super Admin sahaja boleh mengakses halaman ini.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Orbitron, sans-serif" }}>Panel Pentadbiran</h1>
            <p className="text-muted-foreground text-sm">Urus maklumat pengguna dan peranan sistem</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20 flex gap-2 items-center">
            <Users size={18} />
            <span className="font-bold text-sm">{users.length} Pengguna</span>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-card/70 border border-border rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-primary font-bold">
              <tr>
                <th className="p-4 border-b border-border">Nama</th>
                <th className="p-4 border-b border-border">Emel</th>
                <th className="p-4 border-b border-border">Peranan</th>
                <th className="p-4 border-b border-border">ID Unik</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-primary/5 transition-colors border-b border-border/50">
                  <td className="p-4 font-semibold">{u.name}</td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'super_admin' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                      {u.role === 'super_admin' ? 'Super Admin' : 'Pengguna'}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono opacity-40">{u.id.substring(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}