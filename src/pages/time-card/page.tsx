import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "@/lib/auth-components.tsx";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import AppLayout from "@/components/AppLayout.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Zap, Plus, Printer, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type TimeCardRow = Partial<Doc<"timeCards">> & {
  rowNumber: number;
  pageNumber: number;
  isNew?: boolean;
};

type ColumnDef = {
  key: string;
  label: string;
  width: string;
  readOnly?: boolean;
  isTime?: boolean;
};

const COLUMNS: ColumnDef[] = [
  { key: "rowNumber", label: "No.", width: "40px", readOnly: true },
  { key: "nama", label: "NAMA", width: "120px" },
  { key: "kemJab", label: "KEM./JAB.", width: "100px" },
  { key: "bahagianSeksyen", label: "BAHAGIAN/SEKSYEN", width: "130px" },
  { key: "bulan", label: "BULAN", width: "80px" },
  { key: "tarikh", label: "TARIKH", width: "80px" },
  { key: "masuk1", label: "MASUK", width: "70px", isTime: true },
  { key: "keluar1", label: "KELUAR", width: "70px", isTime: true },
  { key: "masuk2", label: "MASUK", width: "70px", isTime: true },
  { key: "keluar2", label: "KELUAR", width: "70px", isTime: true },
  { key: "kenyataan", label: "KENYATAAN", width: "120px" },
  { key: "ttandatangan", label: "T/T", width: "80px" },
];

function timeToMinutes(t: string): number {
  if (!t) return -1;
  const clean = t.replace(/\s*(pg|am|ptg|pm|mlm)\s*/i, "");
  const [h, m] = clean.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function detectTimeStatus(masuk1: string | undefined): "late" | "ot" | "normal" {
  if (!masuk1) return "normal";
  const mins = timeToMinutes(masuk1);
  const lower = masuk1.toLowerCase();
  const isBeforeWork = mins < 7 * 60; // before 7:00 AM
  const isAfterWork = lower.includes("ptg") || lower.includes("pm") || lower.includes("mlm") || mins >= 18 * 60;
  if (isBeforeWork || isAfterWork) return "ot";
  if (mins > 9 * 60) return "late";
  return "normal";
}

function buildEmptyRows(page: number, start: number, count: number): TimeCardRow[] {
  return Array.from({ length: count }, (_, i) => ({
    rowNumber: start + i,
    pageNumber: page,
    isNew: true,
  }));
}

function TimeCardTable({ page }: { page: 1 | 2 }) {
  const startRow = page === 1 ? 1 : 16;
  const endRow = page === 1 ? 15 : 31;
  const dbRows = useQuery(api.timeCards.getTimeCards, { pageNumber: page }) ?? [];
  const upsert = useMutation(api.timeCards.upsertTimeCard);
  const [localChanges, setLocalChanges] = useState<Record<number, Partial<TimeCardRow>>>({});

  const allRows: TimeCardRow[] = Array.from({ length: endRow - startRow + 1 }, (_, i) => {
    const rowNumber = startRow + i;
    const db = dbRows.find((r) => r.rowNumber === rowNumber);
    const local = localChanges[rowNumber] ?? {};
    return { rowNumber, pageNumber: page, ...db, ...local };
  });

  const handleChange = useCallback((rowNumber: number, field: string, value: string) => {
    setLocalChanges((prev) => ({
      ...prev,
      [rowNumber]: { ...prev[rowNumber], [field]: value },
    }));
  }, []);

  const handleBlur = useCallback(async (rowNumber: number) => {
    const changes = localChanges[rowNumber];
    if (!changes || Object.keys(changes).length === 0) return;
    const row = allRows.find((r) => r.rowNumber === rowNumber);
    if (!row) return;
    try {
      await upsert({
        pageNumber: page,
        rowNumber,
        nama: row.nama ?? changes.nama,
        kemJab: row.kemJab ?? changes.kemJab,
        bahagianSeksyen: row.bahagianSeksyen ?? changes.bahagianSeksyen,
        bulan: row.bulan ?? changes.bulan,
        tarikh: row.tarikh ?? changes.tarikh,
        masuk1: row.masuk1 ?? changes.masuk1,
        keluar1: row.keluar1 ?? changes.keluar1,
        masuk2: row.masuk2 ?? changes.masuk2,
        keluar2: row.keluar2 ?? changes.keluar2,
        kenyataan: row.kenyataan ?? changes.kenyataan,
        ttandatangan: row.ttandatangan ?? changes.ttandatangan,
        ...changes,
      });
    } catch {
      toast.error("Gagal menyimpan • Failed to save");
    }
  }, [localChanges, allRows, upsert, page]);

  const handleAddRow = useCallback(() => {
    toast.info("Baris baru sedia diisi • New row ready");
  }, []);

  const handleExportCSV = () => {
    const headers = COLUMNS.map((c) => c.label).join(",");
    const rows = allRows.map((r) =>
      COLUMNS.map((c) => {
        if (c.key === "rowNumber") return r.rowNumber;
        const val = r[c.key as keyof TimeCardRow];
        return `"${val ?? ""}"`;
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kad-waktu-muka${page}.csv`;
    a.click();
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      allRows.map((r) => {
        const obj: Record<string, unknown> = {};
        COLUMNS.forEach((c) => {
          if (c.key === "rowNumber") obj[c.label] = r.rowNumber;
          else obj[c.label] = r[c.key as keyof TimeCardRow] ?? "";
        });
        return obj;
      })
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Muka ${page}`);
    XLSX.writeFile(wb, `kad-waktu-muka${page}.xlsx`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-base font-bold text-primary" style={{ fontFamily: "Orbitron, sans-serif" }}>
          MUKA {page} — No. {startRow}–{endRow}
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" onClick={handleExportCSV}>
            <Download size={14} /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={handleExportExcel}>
            <Download size={14} /> Excel
          </Button>
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer size={14} /> Cetak
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-destructive/30 border border-destructive/50 rounded" /> Lewat (selepas 9:00 PG)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary/20 border border-primary/40 rounded" /> OT (sebelum 7 PG / selepas 6 PTG)</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="anime-table w-full">
          <thead>
            <tr>
              <th colSpan={6} className="text-center border-b-2 border-primary/50">MAKLUMAT PERIBADI</th>
              <th colSpan={4} className="text-center border-b-2 border-accent/50 text-accent">REKOD HADIR</th>
              <th colSpan={2} className="text-center border-b-2 border-border">LAIN-LAIN</th>
            </tr>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} style={{ minWidth: col.width }}>
                  {col.label}
                  {col.key === "masuk1" || col.key === "masuk2" ? (
                    <div className="text-xs text-muted-foreground font-normal">hh:mm</div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) => {
              const status = detectTimeStatus(row.masuk1);
              return (
                <tr key={row.rowNumber}>
                  {COLUMNS.map((col) => {
                    if (col.key === "rowNumber") {
                      return <td key={col.key} className="text-center font-bold text-muted-foreground">{row.rowNumber}</td>;
                    }
                    const val = (row[col.key as keyof TimeCardRow] as string) ?? "";
                    let cellClass = "";
                    if (col.key === "masuk1") {
                      if (status === "late") cellClass = "late";
                      else if (status === "ot") cellClass = "ot";
                    }
                    return (
                      <td key={col.key} className={cellClass}>
                        <input
                          type="text"
                          value={localChanges[row.rowNumber]?.[col.key as keyof TimeCardRow] !== undefined
                            ? (localChanges[row.rowNumber][col.key as keyof TimeCardRow] as string)
                            : val}
                          onChange={(e) => handleChange(row.rowNumber, col.key, e.target.value)}
                          onBlur={() => handleBlur(row.rowNumber)}
                          placeholder={col.isTime ? "7:30" : "—"}
                          style={{ minWidth: col.width, fontFamily: "inherit" }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* WFB Hours note */}
      <div className="text-xs text-muted-foreground border border-border/50 rounded-lg p-3 bg-card/30 space-y-1">
        <div className="font-bold text-accent">Waktu Pejabat Kerajaan (WFB):</div>
        <div>• Rasmi: 7:30 PG – 4:30 PTG | Maksimum: 9:00 PG – 6:00 PTG</div>
        <div>• Masuk selepas 9:00 PG → <span className="text-destructive font-bold">highlight MERAH (LEWAT)</span></div>
        <div>• Sebelum 7:00 PG atau selepas 6:00 PTG → <span className="text-primary font-bold">tandakan OT</span></div>
      </div>
    </div>
  );
}

function TimeCardInner() {
  const [activePage, setActivePage] = useState<1 | 2>(1);
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold shimmer-text flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
            <Clock size={24} /> KAD MENCATAT WAKTU
          </h1>
          <p className="text-muted-foreground text-sm">Time Card • Rekod Kehadiran Kakitangan Kerajaan</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setActivePage(1)}
            className={activePage === 1 ? "glow-box-orange" : ""}
            variant={activePage === 1 ? "default" : "secondary"}
          >
            Muka 1 (1–15)
          </Button>
          <Button
            size="sm"
            onClick={() => setActivePage(2)}
            className={activePage === 2 ? "glow-box-orange" : ""}
            variant={activePage === 2 ? "default" : "secondary"}
          >
            Muka 2 (16–31)
          </Button>
        </div>
      </div>

      <motion.div
        key={activePage}
        initial={{ opacity: 0, x: activePage === 1 ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TimeCardTable page={activePage} />
      </motion.div>
    </div>
  );
}

export default function TimeCardPage() {
  return (
    <AppLayout>
      <Authenticated>
        <TimeCardInner />
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
