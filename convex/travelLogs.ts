import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getTravelLogs = query({
  args: { bulanRekod: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];
    if (args.bulanRekod) {
      return await ctx.db
        .query("travelLogs")
        .withIndex("by_user_bulan", (q) => q.eq("userId", user._id).eq("bulanRekod", args.bulanRekod))
        .collect();
    }
    return await ctx.db
      .query("travelLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const createTravelLog = mutation({
  args: {
    bulanRekod: v.optional(v.string()),
    noPendaftaranKereta: v.optional(v.string()),
    modelKereta: v.optional(v.string()),
    odoPermulaan: v.optional(v.number()),
    bahagianUnit: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Unauthenticated", code: "UNAUTHENTICATED" });
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
    return await ctx.db.insert("travelLogs", { userId: user._id, ...args });
  },
});

export const updateTravelLog = mutation({
  args: {
    id: v.id("travelLogs"),
    bulanRekod: v.optional(v.string()),
    noPendaftaranKereta: v.optional(v.string()),
    modelKereta: v.optional(v.string()),
    odoPermulaan: v.optional(v.number()),
    bahagianUnit: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteTravelLog = mutation({
  args: { id: v.id("travelLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
