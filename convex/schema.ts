import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(v.string()), // "superadmin" | "user"
  }).index("by_token", ["tokenIdentifier"]),

  // Kad Mencatat Waktu (Time Card)
  timeCards: defineTable({
    userId: v.id("users"),
    pageNumber: v.number(), // 1 or 2
    rowNumber: v.number(),
    nama: v.optional(v.string()),
    kemJab: v.optional(v.string()),
    bahagianSeksyen: v.optional(v.string()),
    bulan: v.optional(v.string()),
    tarikh: v.optional(v.string()),
    masuk1: v.optional(v.string()),
    keluar1: v.optional(v.string()),
    masuk2: v.optional(v.string()),
    keluar2: v.optional(v.string()),
    kenyataan: v.optional(v.string()),
    ttandatangan: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_page", ["userId", "pageNumber"]),

  // Log Perjalanan Kerajaan (Government Travel Log)
  travelLogs: defineTable({
    userId: v.id("users"),
    bulanRekod: v.optional(v.string()),
    noPendaftaranKereta: v.optional(v.string()),
    modelKereta: v.optional(v.string()),
    odoPermulaan: v.optional(v.number()),
    bahagianUnit: v.optional(v.string()),
    // Row data
    tarikh: v.optional(v.string()),
    masaPergi: v.optional(v.string()),
    masaBalik: v.optional(v.string()),
    pemandu: v.optional(v.string()),
    tujuanLokasi: v.optional(v.string()),
    pelulus: v.optional(v.string()),
    pengguna: v.optional(v.string()),
    odoAkhir: v.optional(v.number()),
    jarak: v.optional(v.number()),
    kos: v.optional(v.number()),
    noResit: v.optional(v.string()),
    liter: v.optional(v.number()),
    nota: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_bulan", ["userId", "bulanRekod"]),

  // File uploads
  uploadedFiles: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(), // "resit_minyak" | "resit_tng" | "gambar_odo" | "other"
    fileSize: v.optional(v.number()),
    url: v.optional(v.string()),
    linkedTravelLogId: v.optional(v.id("travelLogs")),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "fileType"]),
});
