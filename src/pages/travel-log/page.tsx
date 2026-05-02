import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "@/lib/auth-components.tsx";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import AppLayout from "@/components/AppLayout.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Zap, Plus, Printer, Download, Car, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type TravelLog = Doc<"travelLogs">;

type LogColumnDef = {
  key: string;
  label: string;
  width: string;
  isNum?: boolean;
  readOnly?: boolean;
};

const LOG_COLUMNS: LogColumnDef[] = [
  { key: "tarikh", label: "TARIKH", width: "90px" },
  { key: "masaPergi", label: "MASA PERGI", width: "90px" },
  { key: "masaBalik", label: "MASA BALIK", width: "90px" },
  { key: "pemandu", label: "PEMANDU", width: "100px" },
  { key: "tujuanLokasi", label: "TUJUAN & LOKASI PENUH", width: "180px" },
  { key: "pelulus", label: "PELULUS", width: "100px" },
  { key: "pengguna", label: "PENGGUNA", width: "100px" },
  { key: "odoAkhir", label: "ODO AKHIR", width: "90px", isNum: true },
  { key: "jarak", label: "JARAK (km)", width: "80px", isNum: true, readOnly: true },
  { key: "kos", label: "KOS (RM)", width: "80px", isNum: true },
  { key: "noResit", label: "KOS & RESIT", width: "90px" },
  { key: "liter", label: "LITER", width: "70px", isNum: true },
  { key: "nota", label: "NOTA", width: "120px" },
];

function emptyRow(): Partial<TravelLog> {
  return {};
}

function TravelLogInner() {
  const [headerInfo, setHeaderInfo] = useState({
    bulanRekod: "",
    noPendaftaranKereta: "",
    modelKereta: "",
    odoPermulaan: "",
    bahagianUnit: "",
  });
  const [newRow, setNewRow] = useState<Partial<TravelLog>>(emptyRow());
  const [editId, setEditId] = useState<Id<"travelLogs"> | null>(null);
  const [editData, setEditData] = useState<Partial<TravelLog>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const logs = useQuery(api.travelLogs.getTravelLogs, {}) ?? [];
  const createLog = useMutation(api.travelLogs.createTravelLog);
  const updateLog = useMutation(api.travelLogs.updateTravelLog);
  const deleteLog = useMutation(api.travelLogs.deleteTravelLog);

  const odoPermulaan = Number(headerInfo.odoPermulaan) || 0;
  const totalKos = logs.reduce((s, l) => s + (l.kos ?? 0), 0);
  const totalLiter = logs.reduce((s, l) => s + (l.liter ?? 0), 0);
  const totalJarak = logs.reduce((s, l) => s + (l.jarak ?? 0), 0);

  const computeJarak = useCallback(
    (odoAkhir: number | undefined): number => {
      if (!odoAkhir || !odoPermulaan) return 0;
      const prev = logs.length > 0 ? (logs[logs.length - 1].odoAkhir ?? odoPermulaan) : odoPermulaan;
      return Math.max(0, odoAkhir - prev);
    },
    [logs, odoPermulaan]
  );

  const handleCreate = async () => {
    const jarak = computeJarak(newRow.odoAkhir);
    try {
      await createLog({
        ...headerInfo,
        odoPermulaan: odoPermulaan || undefined,
        ...newRow,
        jarak,
      });
      setNewRow(emptyRow());
      setShowAddForm(false);
      toast.success("Rekod berjaya ditambah • Record added!");
    } catch {
      toast.error("Gagal tambah • Failed to add");
    }
  };

  const handleUpdate = async (id: Id<"travelLogs">) => {
    try {
      await updateLog({ id, ...editData });
      setEditId(null);
      setEditData({});
      toast.success("Dikemas kini • Updated!");
    } catch {
      toast.error("Gagal kemas kini • Failed to update");
    }
  };

  const handleDelete = async (id: Id<"travelLogs">) => {
    try {
      await deleteLog({ id });
      toast.success("Dipadam • Deleted!");
    } catch {
      toast.error("Gagal padam • Failed to delete");
    }
  };

  const getLogVal = (log: TravelLog, key: string): unknown => (log as unknown as Record<string, unknown>)[key];

  const handleExportCSV = () => {
    const headers = ["No.", ...LOG_COLUMNS.map((c) => c.label)].join(",");
    const rows = logs.map((l, i) =>
      [i + 1, ...LOG_COLUMNS.map((c) => `"${getLogVal(l, c.key) ?? ""}"`)].join(",")
    );
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "log-perjalanan.csv";
    a.click();
  };

  const handleExportExcel = () => {
    const data = logs.map((l, i) => {
      const obj: Record<string, unknown> = { "No.": i + 1 };
      LOG_COLUMNS.forEach((c) => { obj[c.label] = getLogVal(l, c.key) ?? ""; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Log Perjalanan");
    XLSX.writeFile(wb, "log-perjalanan.xlsx");
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold shimmer-text flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
          <Car size={24} /> LOG PERJALANAN KERAJAAN
        </h1>
        <p className="text-muted-foreground text-sm">Government Travel Log • Rekod Perjalanan Rasmi</p>
      </div>

      {/* Header info form */}
      <div className="bg-card/70 border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-accent text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
          MAKLUMAT KENDERAAN / UNIT
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: "bulanRekod", label: "Bulan Rekod" },
            { key: "noPendaftaranKereta", label: "No. Pendaftaran" },
            { key: "modelKereta", label: "Model Kereta" },
            { key: "odoPermulaan", label: "Odo Permulaan" },
            { key: "bahagianUnit", label: "Bahagian/Unit" },
          ].map((f) => (
            <div key={f.key}>
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                value={headerInfo[f.key as keyof typeof headerInfo]}
                onChange={(e) => setHeaderInfo((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="h-8 text-sm bg-input/50"
                placeholder={f.label}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Button onClick={() => setShowAddForm(!showAddForm)} className="glow-box-orange">
          <Plus size={16} /> Tambah Rekod Baru
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" onClick={handleExportCSV}><Download size={14} /> CSV</Button>
          <Button size="sm" variant="secondary" onClick={handleExportExcel}><Download size={14} /> Excel</Button>
          <Button size="sm" variant="secondary" onClick={() => window.print()}><Printer size={14} /> Cetak</Button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="bg-card/80 border border-primary/30 rounded-xl p-4 space-y-4 glow-box-orange"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-bold text-primary text-sm">Tambah Rekod Baharu • Add New Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LOG_COLUMNS.filter((c) => !c.readOnly).map((col) => (
                <div key={col.key}>
                  <Label className="text-xs text-muted-foreground">{col.label}</Label>
                  <Input
                    type={col.isNum ? "number" : "text"}
                    value={(newRow[col.key as keyof typeof newRow] as string | number | undefined) ?? ""}
                    onChange={(e) => {
                      const val = col.isNum ? Number(e.target.value) : e.target.value;
                      setNewRow((prev) => ({ ...prev, [col.key]: val }));
                    }}
                    className="h-8 text-xs bg-input/50"
                    placeholder={col.label}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Jarak dikira automatik: ODO Akhir - ODO Terdahulu = <span className="text-primary font-bold">{computeJarak(newRow.odoAkhir)} km</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="glow-box-orange">
                <Check size={16} /> Simpan
              </Button>
              <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                <X size={16} /> Batal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="anime-table w-full">
          <thead>
            <tr>
              <th style={{ minWidth: "40px" }}>No.</th>
              {LOG_COLUMNS.map((col) => (
                <th key={col.key} style={{ minWidth: col.width }}>{col.label}</th>
              ))}
              <th style={{ minWidth: "80px" }}>TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={LOG_COLUMNS.length + 2} className="text-center py-8 text-muted-foreground">
                  Tiada rekod • No records yet
                </td>
              </tr>
            )}
            {logs.map((log, i) => (
              <tr key={log._id}>
                <td className="text-center font-bold text-muted-foreground">{i + 1}</td>
                {LOG_COLUMNS.map((col) => (
                  <td key={col.key}>
                    {editId === log._id && !col.readOnly ? (
                      <input
                        type={col.isNum ? "number" : "text"}
                        value={(editData[col.key as keyof typeof editData] as string | number | undefined) ?? (getLogVal(log, col.key) as string | number | undefined) ?? ""}
                        onChange={(e) => {
                          const val = col.isNum ? Number(e.target.value) : e.target.value;
                          setEditData((prev) => ({ ...prev, [col.key]: val }));
                        }}
                        style={{ minWidth: col.width }}
                      />
                    ) : (
                      <span>{String(getLogVal(log, col.key) ?? "—")}</span>
                    )}
                  </td>
                ))}
                <td>
                  <div className="flex gap-1">
                    {editId === log._id ? (
                      <>
                        <button onClick={() => handleUpdate(log._id)} className="text-primary hover:text-green-400 cursor-pointer p-1"><Check size={14} /></button>
                        <button onClick={() => { setEditId(null); setEditData({}); }} className="text-muted-foreground cursor-pointer p-1"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(log._id); setEditData({}); }} className="text-accent hover:text-primary cursor-pointer p-1"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(log._id)} className="text-muted-foreground hover:text-destructive cursor-pointer p-1"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Jumlah Rekod", value: logs.length },
          { label: "Jumlah Jarak (km)", value: totalJarak.toFixed(1) },
          { label: "Jumlah Liter", value: totalLiter.toFixed(2) },
          { label: "Jumlah Kos Bahan Api", value: `RM ${totalKos.toFixed(2)}`, highlight: true },
        ].map((s) => (
          <div key={s.label} className={`bg-card/70 border rounded-xl p-3 ${s.highlight ? "border-primary/40 glow-box-orange" : "border-border"}`}>
            <div className={`text-xl font-bold ${s.highlight ? "text-primary neon-orange" : "text-foreground"}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TravelLogPage() {
  return (
    <AppLayout>
      <Authenticated>
        <TravelLogInner />
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
