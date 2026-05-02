import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

async function getUser(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> }; db: { query: (table: string) => { withIndex: (index: string, q: (q: { eq: (field: string, value: string) => unknown }) => unknown) => { unique: () => Promise<{ _id: string; role?: string } | null> } } } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ message: "Unauthenticated", code: "UNAUTHENTICATED" });
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
  return user;
}

export const getTimeCards = query({
  args: { pageNumber: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("timeCards")
      .withIndex("by_user_page", (q) => q.eq("userId", user._id).eq("pageNumber", args.pageNumber))
      .collect();
  },
});

export const upsertTimeCard = mutation({
  args: {
    pageNumber: v.number(),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Unauthenticated", code: "UNAUTHENTICATED" });
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });

    const existing = await ctx.db
      .query("timeCards")
      .withIndex("by_user_page", (q) => q.eq("userId", user._id).eq("pageNumber", args.pageNumber))
      .collect();
    const row = existing.find((r) => r.rowNumber === args.rowNumber);
    const { pageNumber, rowNumber, ...rest } = args;
    if (row) {
      await ctx.db.patch(row._id, rest);
    } else {
      await ctx.db.insert("timeCards", { userId: user._id, pageNumber, rowNumber, ...rest });
    }
  },
});

export const deleteTimeCard = mutation({
  args: { id: v.id("timeCards") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
