import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimiter } from "./rateLimiter";

const GEMINI_API_KEY =process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Public action available to all users
export const askAgent = action({
  args: {
    question: v.string(),
    userEmail: v.string(),
    botName: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    isShreeya: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<string> => {
    const limiterKey = args.userEmail.trim().toLowerCase();
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "sendMessage", {
      key: limiterKey,
    });
    if (!ok) {
      const retryIn = typeof retryAfter === "number" ? Math.ceil(retryAfter) : 60;
      return `Rate limit exceeded. Please try again in about ${retryIn} seconds.`;
    }

    let systemPrompt =
      args.systemPrompt ||
      "You are a helpful, knowledgeable wellness assistant specializing in menstrual health, cycle tracking, and general wellbeing. Be concise, empathetic, and evidence-based. Provide practical advice and always recommend consulting a healthcare provider for medical concerns.";

    if (args.isShreeya) {
      try {
        const recentLogs: any = await ctx.runAction(
          internal.aiAgent.getRecentLogsForContext,
          {}
        );
        if (recentLogs && recentLogs.length > 0) {
          systemPrompt += `\n\nRecent cycle data for context: ${JSON.stringify(recentLogs)}`;
        }
      } catch {
        // Ignore context errors
      }
    }

    try {
      if (!genAI) {
        return "GEMINI_API_KEY is not configured. Please set it in your environment.";
      }
      // Use gemini-2.5-flash (most stable/recent flash model)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(args.question);
      const response = result.response;
      return response.text() || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Gemini AI error:", error);
      return "I'm having trouble responding right now. Please try again in a moment.";
    }
  },
});

// Keep the old Shreeya-specific action for backward compatibility
export const askShreeyaAgent = action({
  args: {
    question: v.string(),
    userEmail: v.string(),
    botName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runAction(internal.aiAgent.askAgentInternal, {
      question: args.question,
      userEmail: args.userEmail,
      botName: args.botName,
      isShreeya: args.userEmail === "metheotakj@gmail.com",
    });
  },
});

export const askAgentInternal = internalAction({
  args: {
    question: v.string(),
    userEmail: v.string(),
    botName: v.optional(v.string()),
    isShreeya: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<string> => {
    let systemPrompt =
      "You are a helpful, knowledgeable wellness assistant specializing in menstrual health, cycle tracking, and general wellbeing. Be concise, empathetic, and evidence-based.";

    if (args.isShreeya) {
      try {
        const recentLogs: any = await ctx.runAction(
          internal.aiAgent.getRecentLogsForContext,
          {}
        );
        if (recentLogs && recentLogs.length > 0) {
          systemPrompt += `\n\nRecent cycle data: ${JSON.stringify(recentLogs)}`;
        }
      } catch { /* ignore context errors */ }
    }

    try {
      if (!genAI) {
        return "GEMINI_API_KEY is not configured. Please set it in your environment.";
      }
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(args.question);
      const response = result.response;
      return response.text() || "I couldn't generate a response. Please try again.";
    } catch {
      return "I'm having trouble responding right now. Please try again.";
    }
  },
});

export const getRecentLogsForContext = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    try {
      const logs: any = await ctx.runQuery(internal.cycles.getRecentLogsForAI, {
        startDate: sevenDaysAgo.toISOString().split("T")[0],
      });
      return logs.map((log: any) => ({
        date: log.date,
        flow: log.flow,
        symptoms: log.symptoms,
        mood: log.mood,
        phase: log.phase,
        temperature: log.temperature,
      }));
    } catch {
      return null;
    }
  },
});
