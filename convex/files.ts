import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Unauthenticated", code: "UNAUTHENTICATED" });
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveUploadedFile = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    linkedTravelLogId: v.optional(v.id("travelLogs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Unauthenticated", code: "UNAUTHENTICATED" });
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
    const url = await ctx.storage.getUrl(args.storageId);
    return await ctx.db.insert("uploadedFiles", {
      userId: user._id,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      url: url ?? undefined,
      linkedTravelLogId: args.linkedTravelLogId,
    });
  },
});

export const getUploadedFiles = query({
  args: { fileType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];
    if (args.fileType) {
      return await ctx.db
        .query("uploadedFiles")
        .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("fileType", args.fileType ?? ""))
        .collect();
    }
    return await ctx.db
      .query("uploadedFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const deleteUploadedFile = mutation({
  args: { id: v.id("uploadedFiles") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (file) {
      await ctx.storage.delete(file.storageId);
      await ctx.db.delete(args.id);
    }
  },
});
