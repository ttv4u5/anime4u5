import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "@/lib/auth-components.tsx";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import AppLayout from "@/components/AppLayout.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Zap, Upload, Trash2, Eye, Image, FileText, Fuel } from "lucide-react";
import { toast } from "sonner";

type UploadedFile = Doc<"uploadedFiles">;

const FILE_TYPES = [
  { value: "resit_minyak", label: "Resit Minyak", labelEN: "Fuel Receipt", icon: <Fuel size={16} /> },
  { value: "resit_tng", label: "Resit TNG", labelEN: "TNG Receipt", icon: <FileText size={16} /> },
  { value: "gambar_odo", label: "Gambar Odometer", labelEN: "Odometer Photo", icon: <Image size={16} /> },
  { value: "other", label: "Lain-lain", labelEN: "Other", icon: <FileText size={16} /> },
];

function UploadZone({ onUpload }: { onUpload: (file: File, type: string) => Promise<void> }) {
  const [dragging, setDragging] = useState(false);
  const [selectedType, setSelectedType] = useState("resit_minyak");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await onUpload(file, selectedType);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {FILE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setSelectedType(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedType === t.value
                ? "bg-primary/20 border-primary text-primary glow-box-orange"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? "border-primary bg-primary/10 glow-box-orange" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload size={40} className={`mx-auto mb-3 ${dragging ? "text-primary animate-energy-burst" : "text-muted-foreground"}`} />
        <p className="font-bold text-sm">
          {uploading ? "Mengupload... • Uploading..." : "Seret & lepas fail atau klik untuk pilih"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Drop files or click to select • Imej & PDF disokong
        </p>
        <p className="text-xs text-primary mt-1 font-bold">
          Jenis fail terpilih: {FILE_TYPES.find((t) => t.value === selectedType)?.label}
        </p>
      </div>
    </div>
  );
}

function FileCard({ file, onDelete }: { file: UploadedFile; onDelete: (id: typeof file._id) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const typeInfo = FILE_TYPES.find((t) => t.value === file.fileType) ?? FILE_TYPES[3];

  return (
    <>
      <motion.div
        className="bg-card/70 border border-border rounded-xl p-4 space-y-2 hover:border-primary/40 transition-all"
        whileHover={{ scale: 1.02 }}
      >
        {isImage && file.url ? (
          <div
            className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setShowPreview(true)}
          >
            <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/20 hover:bg-background/10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <Eye size={24} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg bg-muted/30 flex items-center justify-center">
            <FileText size={32} className="text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="text-xs font-bold text-foreground truncate">{file.fileName}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-primary text-xs">{typeInfo.icon}</span>
            <span className="text-xs text-primary">{typeInfo.label}</span>
          </div>
          {file.fileSize && (
            <div className="text-xs text-muted-foreground">{(file.fileSize / 1024).toFixed(1)} KB</div>
          )}
        </div>
        <div className="flex gap-2">
          {file.url && (
            <a href={file.url} target="_blank" rel="noreferrer">
              <Button size="sm" variant="secondary" className="text-xs h-7">
                <Eye size={12} /> Lihat
              </Button>
            </a>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(file._id)}
            className="text-destructive hover:bg-destructive/10 text-xs h-7"
          >
            <Trash2 size={12} /> Padam
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPreview && file.url && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <img src={file.url} alt={file.fileName} className="w-auto h-auto max-w-[90vw] max-h-[90vh] rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilesInner() {
  const [filter, setFilter] = useState<string>("all");
  const files = useQuery(api.files.getUploadedFiles, filter === "all" ? {} : { fileType: filter }) ?? [];
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveUploadedFile);
  const deleteFile = useMutation(api.files.deleteUploadedFile);

  const handleUpload = async (file: File, type: string) => {
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json() as { storageId: string };
      await saveFile({
        storageId,
        fileName: file.name,
        fileType: type,
        fileSize: file.size,
      });
      toast.success(`Fail berjaya diupload • File uploaded: ${file.name}`);
    } catch {
      toast.error("Gagal upload • Upload failed");
    }
  };

  const handleDelete = async (id: Parameters<typeof deleteFile>[0]["id"]) => {
    try {
      await deleteFile({ id });
      toast.success("Fail dipadam • File deleted");
    } catch {
      toast.error("Gagal padam • Failed to delete");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold shimmer-text flex items-center gap-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
          <Upload size={24} /> UPLOAD & PENGURUSAN FAIL
        </h1>
        <p className="text-muted-foreground text-sm">File Management • Resit Minyak, TNG, Gambar Odometer</p>
      </div>

      {/* Upload zone */}
      <div className="bg-card/70 border border-border rounded-xl p-4">
        <h3 className="font-bold text-accent mb-3 text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
          UPLOAD FAIL BARU
        </h3>
        <UploadZone onUpload={handleUpload} />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${filter === "all" ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"}`}
        >
          Semua ({files.length})
        </button>
        {FILE_TYPES.map((t) => {
          const count = files.filter((f) => f.fileType === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filter === t.value ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {t.icon} {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* File grid */}
      {files.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Upload size={48} className="mx-auto mb-3 opacity-30" />
          <p>Tiada fail diupload • No files uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {files.map((f) => (
            <FileCard key={f._id} file={f} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilesPage() {
  return (
    <AppLayout>
      <Authenticated>
        <FilesInner />
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
