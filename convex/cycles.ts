import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimiter";

// Helper function to calculate phase
function calculatePhase(
  lastPeriodStart: string,
  currentDate: string,
  cycleLength: number,
  periodLength: number
): "menstrual" | "follicular" | "ovulation" | "luteal" | null {
  const lastPeriodDate = new Date(lastPeriodStart);
  const date = new Date(currentDate);
  const daysSinceLastPeriod = Math.floor((date.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastPeriod < 0) return null;
  
  // Determine phase
  if (daysSinceLastPeriod < periodLength) {
    return "menstrual";
  } else if (daysSinceLastPeriod < Math.floor(cycleLength / 2) - 2) {
    return "follicular";
  } else if (daysSinceLastPeriod < Math.floor(cycleLength / 2) + 2) {
    return "ovulation";
  } else {
    return "luteal";
  }
}

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!settings) {
      // Return default settings if none exist
      return {
        userId,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        enablePartnerSharing: false,
        lastPeriodStart: undefined,
        partnerEmail: undefined,
        _id: null as any,
        _creationTime: Date.now(),
      };
    }

    return settings;
  },
});

export const updateUserSettings = mutation({
  args: {
    averageCycleLength: v.number(),
    averagePeriodLength: v.number(),
    lastPeriodStart: v.optional(v.string()),
    partnerEmail: v.optional(v.string()),
    enablePartnerSharing: v.optional(v.boolean()),
    themeName: v.optional(v.string()),
    calendarMode: v.optional(v.union(v.literal("full"), v.literal("border"))),
  },
  handler: async (ctx, args) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "freeTrialSignUp");
    if (!ok) {
      const retryIn = typeof retryAfter === "number" ? Math.ceil(retryAfter) : 60;
      throw new Error(`Too many setup attempts. Please retry in about ${retryIn} seconds.`);
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        ...args,
      });
    }
  },
});

export const getCycles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("cycles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(12); // Last 12 cycles
  },
});

export const startNewCycle = mutation({
  args: {
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // End the current cycle if it exists
    const currentCycle = await ctx.db
      .query("cycles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (currentCycle && !currentCycle.endDate) {
      const startDate = new Date(currentCycle.startDate);
      const endDate = new Date(args.startDate);
      const cycleLength = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      await ctx.db.patch(currentCycle._id, {
        endDate: args.startDate,
        length: cycleLength,
      });
    }

    // Create new cycle with predicted ovulation
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const cycleLength = settings?.averageCycleLength || 28;
    const ovulationDate = new Date(args.startDate);
    ovulationDate.setDate(ovulationDate.getDate() + Math.floor(cycleLength / 2));

    await ctx.db.insert("cycles", {
      userId,
      startDate: args.startDate,
      ovulationDate: ovulationDate.toISOString().split('T')[0],
    });

    // Update user settings
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastPeriodStart: args.startDate,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        lastPeriodStart: args.startDate,
      });
    }
  },
});

export const getDailyLog = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .unique();
  },
});

export const getCurrentPhase = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!settings?.lastPeriodStart) return null;

    return calculatePhase(
      settings.lastPeriodStart,
      args.date,
      settings.averageCycleLength,
      settings.averagePeriodLength
    );
  },
});

export const updateDailyLog = mutation({
  args: {
    date: v.string(),
    flow: v.optional(v.union(v.literal("none"), v.literal("light"), v.literal("medium"), v.literal("heavy"))),
    symptoms: v.optional(v.array(v.string())),
    symptomDetails: v.optional(v.array(v.object({
      name: v.string(),
      severity: v.number(),
    }))),
    otherSymptoms: v.optional(v.string()),
    emergencyFlag: v.optional(v.boolean()),
    mood: v.optional(v.union(
      v.literal("happy"),
      v.literal("sad"),
      v.literal("anxious"),
      v.literal("irritated"),
      v.literal("energetic"),
      v.literal("tired")
    )),
    notes: v.optional(v.string()),
    temperature: v.optional(v.number()),
    cervicalMucus: v.optional(v.union(
      v.literal("dry"),
      v.literal("sticky"),
      v.literal("creamy"),
      v.literal("watery"),
      v.literal("egg-white")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user info for email notification
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Get user settings to calculate phase
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Calculate current phase
    let phase: "menstrual" | "follicular" | "ovulation" | "luteal" | null = null;
    if (settings?.lastPeriodStart) {
      phase = calculatePhase(
        settings.lastPeriodStart,
        args.date,
        settings.averageCycleLength,
        settings.averagePeriodLength
      );
    }

    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .unique();

    const logData = {
      userId,
      date: args.date,
      flow: args.flow,
      symptoms: args.symptoms,
      symptomDetails: args.symptomDetails,
      otherSymptoms: args.otherSymptoms,
      emergencyFlag: args.emergencyFlag,
      mood: args.mood,
      notes: args.notes,
      temperature: args.temperature,
      cervicalMucus: args.cervicalMucus,
      phase: phase || undefined,
    };

    let logId;
    if (existing) {
      await ctx.db.patch(existing._id, logData);
      logId = existing._id;
    } else {
      logId = await ctx.db.insert("dailyLogs", logData);
    }

    // Schedule email notification
    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendLogNotification, {
        date: args.date,
        flow: args.flow,
        symptoms: args.symptoms,
        mood: args.mood,
        notes: args.notes,
        temperature: args.temperature,
        cervicalMucus: args.cervicalMucus,
        phase: phase || undefined,
        userEmail: user.email || "",
        partnerEmail: settings?.enablePartnerSharing ? settings.partnerEmail : undefined,
      });
    } catch (error) {
      console.error("Failed to schedule email notification:", error);
      // Don't fail the mutation if email scheduling fails
    }

    return logId;
  },
});

export const manualEndCurrentCycle = mutation({
  args: {
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentCycle = await ctx.db
      .query("cycles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!currentCycle) throw new Error("No active cycle found");

    const startDate = new Date(currentCycle.startDate);
    const endDate = new Date(args.endDate);
    const cycleLength = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    await ctx.db.patch(currentCycle._id, {
      endDate: args.endDate,
      length: cycleLength,
    });
  },
});

/**
 * Records an early period termination.
 *
 * Unlike manualEndCurrentCycle (which ends the full cycle), this only updates
 * the cycle's periodLength so the calendar stops showing period-day indicators
 * on days after the actual last flow day.  The cycle itself continues (the user
 * moves into follicular/ovulation/luteal phases as normal).
 *
 * The updated periodLength is immediately picked up by getPeriodDay in
 * calendarUtils.ts, triggering a full calendar redraw via Convex reactivity.
 */
export const endPeriodEarly = mutation({
  args: {
    periodEndDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activeCycle = await ctx.db
      .query("cycles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!activeCycle) throw new Error("No active cycle found");
    if (activeCycle.endDate) throw new Error("Current cycle has already ended");

    const startDate = new Date(activeCycle.startDate);
    const endDate = new Date(args.periodEndDate);
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 0) {
      throw new Error("Period end date cannot be before cycle start date");
    }

    // endDate is the last flow day (inclusive), so actual period length = daysDiff + 1
    const actualPeriodLength = daysDiff + 1;

    await ctx.db.patch(activeCycle._id, {
      periodLength: actualPeriodLength,
    });
  },
});

export const getRecentLogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30); // Last 30 days
  },
});

export const trackRecommendationInteraction = mutation({
  args: {
    recommendationId: v.string(),
    action: v.union(v.literal("view"), v.literal("like"), v.literal("dismiss")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("recommendationInteractions", {
      userId,
      recommendationId: args.recommendationId,
      action: args.action,
      timestamp: new Date().toISOString(),
    });
  },
});

// Internal query for AI agent to get recent logs for context
export const getRecentLogsForAI = internalQuery({
  args: {
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    // This is an internal query, so we need to find Penguine's user ID
    const PenguineUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "metheotakj@gmail.com"))
      .unique();
    
    if (!PenguineUser) return [];

    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_user", (q) => q.eq("userId", PenguineUser._id))
      .filter((q) => q.gte(q.field("date"), args.startDate))
      .order("desc")
      .take(7); // Last 7 days
  },
});

// Get symptom suggestions
export const getSymptomSuggestions = query({
  args: { 
    symptom: v.string(),
    severity: v.optional(v.union(v.literal("mild"), v.literal("moderate"), v.literal("severe")))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const symptomSuggestions: Record<string, Record<string, string[]>> = {
      "Cramps": {
        mild: [
          "Apply a heating pad to your lower abdomen for 15-20 minutes",
          "Try gentle stretching or yoga poses like child's pose",
          "Take a warm bath with Epsom salts",
          "Stay hydrated and drink herbal teas like chamomile"
        ],
        moderate: [
          "Take over-the-counter pain relievers like ibuprofen",
          "Use a heating pad and gentle massage",
          "Try light exercise like walking or swimming",
          "Practice deep breathing exercises",
          "Consider magnesium supplements (consult your doctor first)"
        ],
        severe: [
          "Consult your healthcare provider if pain is debilitating",
          "Take prescribed pain medication as directed",
          "Rest and avoid strenuous activities",
          "Apply heat therapy consistently",
          "Consider hormonal birth control options (discuss with doctor)"
        ]
      },
      "Headache": {
        mild: [
          "Stay well-hydrated throughout the day",
          "Apply a cold compress to your forehead",
          "Practice relaxation techniques",
          "Ensure you're getting enough sleep"
        ],
        moderate: [
          "Take over-the-counter pain relievers",
          "Try peppermint or lavender essential oils",
          "Reduce screen time and bright lights",
          "Maintain regular meal times to stabilize blood sugar"
        ],
        severe: [
          "Consult your doctor about hormonal headaches",
          "Keep a headache diary to identify triggers",
          "Consider preventive medications",
          "Rest in a dark, quiet room"
        ]
      },
      "Bloating": {
        mild: [
          "Reduce sodium intake",
          "Drink plenty of water",
          "Eat smaller, more frequent meals",
          "Try gentle abdominal massage"
        ],
        moderate: [
          "Avoid carbonated drinks and gassy foods",
          "Take probiotics to support gut health",
          "Try herbal teas like ginger or fennel",
          "Wear loose, comfortable clothing"
        ],
        severe: [
          "Consider keeping a food diary",
          "Consult a healthcare provider about digestive issues",
          "Try over-the-counter anti-gas medications",
          "Avoid trigger foods completely"
        ]
      },
      "Breast tenderness": {
        mild: [
          "Wear a well-fitting, supportive bra",
          "Apply cold compresses for relief",
          "Avoid caffeine and excess salt",
          "Try gentle breast massage"
        ],
        moderate: [
          "Take over-the-counter pain relievers",
          "Use warm compresses alternating with cold",
          "Consider evening primrose oil supplements",
          "Wear a sports bra for extra support"
        ],
        severe: [
          "Consult your healthcare provider",
          "Consider hormonal evaluation",
          "Avoid tight clothing",
          "Track symptoms to identify patterns"
        ]
      },
      "Acne": {
        mild: [
          "Maintain a gentle skincare routine",
          "Use non-comedogenic products",
          "Avoid touching your face",
          "Stay hydrated and eat a balanced diet"
        ],
        moderate: [
          "Use salicylic acid or benzoyl peroxide products",
          "Consider zinc supplements",
          "Change pillowcases frequently",
          "Avoid dairy and high-glycemic foods"
        ],
        severe: [
          "Consult a dermatologist",
          "Consider hormonal treatments",
          "Use prescription topical treatments",
          "Avoid picking or squeezing blemishes"
        ]
      },
      "Fatigue": {
        mild: [
          "Ensure 7-9 hours of quality sleep",
          "Take short power naps if needed",
          "Eat iron-rich foods",
          "Stay hydrated throughout the day"
        ],
        moderate: [
          "Consider iron supplements if deficient",
          "Maintain regular exercise routine",
          "Limit caffeine and alcohol",
          "Practice stress management techniques"
        ],
        severe: [
          "Consult your doctor about underlying causes",
          "Get blood work to check for deficiencies",
          "Consider hormonal evaluation",
          "Prioritize rest and recovery"
        ]
      },
      "Nausea": {
        mild: [
          "Eat small, frequent meals",
          "Try ginger tea or ginger candies",
          "Avoid strong smells and spicy foods",
          "Stay hydrated with small sips of water"
        ],
        moderate: [
          "Use acupressure wristbands",
          "Try peppermint tea or aromatherapy",
          "Eat bland foods like crackers or toast",
          "Rest in a well-ventilated area"
        ],
        severe: [
          "Consult your healthcare provider",
          "Consider anti-nausea medications",
          "Stay hydrated and monitor for dehydration",
          "Avoid triggers completely"
        ]
      },
      "Back pain": {
        mild: [
          "Apply heat or cold therapy",
          "Try gentle stretching exercises",
          "Maintain good posture",
          "Use a supportive pillow while sleeping"
        ],
        moderate: [
          "Take over-the-counter pain relievers",
          "Try yoga or physical therapy exercises",
          "Use a heating pad regularly",
          "Consider massage therapy"
        ],
        severe: [
          "Consult a healthcare provider or physical therapist",
          "Consider prescription pain management",
          "Avoid heavy lifting and strenuous activities",
          "Use proper ergonomics at work"
        ]
      },
      "Mood swings": {
        mild: [
          "Practice mindfulness and meditation",
          "Maintain regular exercise routine",
          "Get adequate sleep",
          "Talk to supportive friends or family"
        ],
        moderate: [
          "Keep a mood diary to track patterns",
          "Try stress-reduction techniques",
          "Consider counseling or therapy",
          "Maintain stable blood sugar levels"
        ],
        severe: [
          "Consult a mental health professional",
          "Consider hormonal evaluation",
          "Explore therapy options",
          "Discuss medication options with your doctor"
        ]
      },
      "Loss of appetite": {
        mild: [
          "Eat small, nutrient-dense meals",
          "Try smoothies or liquid nutrition",
          "Eat at regular times even if not hungry",
          "Focus on foods you enjoy"
        ],
        moderate: [
          "Add healthy fats and proteins to meals",
          "Try appetite-stimulating herbs like ginger",
          "Eat with others when possible",
          "Consider nutritional supplements"
        ],
        severe: [
          "Consult your healthcare provider",
          "Monitor weight and nutritional status",
          "Consider medical evaluation for underlying causes",
          "Work with a nutritionist if needed"
        ]
      },
      "Insomnia": {
        mild: [
          "Maintain a consistent sleep schedule",
          "Create a relaxing bedtime routine",
          "Avoid screens before bedtime",
          "Try herbal teas like chamomile"
        ],
        moderate: [
          "Practice relaxation techniques before bed",
          "Keep your bedroom cool and dark",
          "Avoid caffeine after 2 PM",
          "Try melatonin supplements (consult doctor first)"
        ],
        severe: [
          "Consult a sleep specialist",
          "Consider cognitive behavioral therapy for insomnia",
          "Discuss sleep medications with your doctor",
          "Address underlying anxiety or stress"
        ]
      },
      "Anxiety": {
        mild: [
          "Practice deep breathing exercises",
          "Try progressive muscle relaxation",
          "Engage in regular physical activity",
          "Limit caffeine intake"
        ],
        moderate: [
          "Practice mindfulness meditation",
          "Consider counseling or therapy",
          "Try journaling to process emotions",
          "Maintain social connections"
        ],
        severe: [
          "Consult a mental health professional",
          "Consider therapy or counseling",
          "Discuss medication options with your doctor",
          "Create a strong support system"
        ]
      }
    };

    const severity = args.severity || "mild";
    const suggestions = symptomSuggestions[args.symptom]?.[severity] || [];

    return {
      symptom: args.symptom,
      severity,
      suggestions,
      generalTips: [
        "Track your symptoms to identify patterns",
        "Maintain a healthy diet rich in nutrients",
        "Stay hydrated throughout your cycle",
        "Get regular exercise appropriate for your energy levels",
        "Practice stress management techniques",
        "Consult healthcare providers for persistent or severe symptoms"
      ]
    };
  },
});

/**
 * Permanently deletes all logs for the authenticated user.
 * This includes dailyLogs, recommendationInteractions, and cycles.
 * Also resets lastPeriodStart and periodLength in userSettings.
 * Updates the logsClearedAt timestamp in userSettings.
 */
export const clearAllLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user settings to update the logsClearedAt timestamp
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!settings) {
      throw new Error("User settings not found");
    }

    // Delete all daily logs for this user
    const dailyLogs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const log of dailyLogs) {
      await ctx.db.delete(log._id);
    }

    // Delete all recommendation interactions for this user
    const recommendationInteractions = await ctx.db
      .query("recommendationInteractions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const interaction of recommendationInteractions) {
      await ctx.db.delete(interaction._id);
    }

    // Delete all cycles for this user
    const cycles = await ctx.db
      .query("cycles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const cycle of cycles) {
      await ctx.db.delete(cycle._id);
    }

    // Update user settings:
    // - Reset lastPeriodStart to clear phase calculations
    // - Update logsClearedAt timestamp
    await ctx.db.patch(settings._id, {
      lastPeriodStart: undefined,
      logsClearedAt: new Date().toISOString(),
    });

    return {
      deletedLogsCount: dailyLogs.length,
      deletedInteractionsCount: recommendationInteractions.length,
      deletedCyclesCount: cycles.length,
      clearedAt: new Date().toISOString(),
    };
  },
});
