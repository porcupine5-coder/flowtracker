import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  cycles: defineTable({
    userId: v.id("users"),
    startDate: v.string(), // ISO date string
    endDate: v.optional(v.string()), // ISO date string, optional for current cycle
    length: v.optional(v.number()), // cycle length in days
    periodLength: v.optional(v.number()), // period length in days
    ovulationDate: v.optional(v.string()), // predicted ovulation date
  })
    .index("by_user", ["userId"])
    .index("by_user_and_start_date", ["userId", "startDate"]),

  dailyLogs: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    flow: v.optional(v.union(v.literal("none"), v.literal("light"), v.literal("medium"), v.literal("heavy"))),
    symptoms: v.optional(v.array(v.string())), // Legacy symptom names
    symptomDetails: v.optional(v.array(v.object({
      name: v.string(),
      severity: v.number(), // 1-5
    }))),
    mood: v.optional(v.union(
      v.literal("happy"),
      v.literal("sad"),
      v.literal("anxious"),
      v.literal("irritated"),
      v.literal("energetic"),
      v.literal("tired")
    )),
    notes: v.optional(v.string()),
    otherSymptoms: v.optional(v.string()), // Free-text for additional symptoms
    emergencyFlag: v.optional(v.boolean()), // True if severe symptoms are detected
    phase: v.optional(v.union(
      v.literal("menstrual"),
      v.literal("follicular"),
      v.literal("ovulation"),
      v.literal("luteal")
    )),
    temperature: v.optional(v.number()),
    cervicalMucus: v.optional(v.union(
      v.literal("dry"),
      v.literal("sticky"),
      v.literal("creamy"),
      v.literal("watery"),
      v.literal("egg-white")
    )),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  userSettings: defineTable({
    userId: v.id("users"),
    averageCycleLength: v.number(),
    averagePeriodLength: v.number(),
    lastPeriodStart: v.optional(v.string()), // ISO date string
    partnerEmail: v.optional(v.string()), // Partner's email for sharing logs
    enablePartnerSharing: v.optional(v.boolean()),
    themeName: v.optional(v.string()), // Preferred color palette name
  })
    .index("by_user", ["userId"]),

  partnerRequests: defineTable({
    fromUserId: v.id("users"),
    toEmail: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    requestDate: v.string(),
  })
    .index("by_email", ["toEmail"])
    .index("by_user", ["fromUserId"]),

  recommendationInteractions: defineTable({
    userId: v.id("users"),
    recommendationId: v.string(),
    action: v.union(v.literal("view"), v.literal("like"), v.literal("dismiss")),
    timestamp: v.string(),
  })
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
