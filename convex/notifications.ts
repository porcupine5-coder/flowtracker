import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendLogNotification = internalAction({
  args: {
    date: v.string(),
    flow: v.optional(v.union(v.literal("none"), v.literal("light"), v.literal("medium"), v.literal("heavy"))),
    symptoms: v.optional(v.array(v.string())),
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
    phase: v.optional(v.union(
      v.literal("menstrual"),
      v.literal("follicular"),
      v.literal("ovulation"),
      v.literal("luteal")
    )),
    userEmail: v.string(),
    partnerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const flowEmoji = {
      none: "⚪",
      light: "🌸",
      medium: "🌺",
      heavy: "🌹"
    };

    const moodEmoji = {
      happy: "😊",
      sad: "😢",
      anxious: "😰",
      irritated: "😤",
      energetic: "⚡",
      tired: "😴"
    };

    const phaseEmoji = {
      menstrual: "🌹",
      follicular: "🌱",
      ovulation: "🌟",
      luteal: "🌙"
    };

    const isShreeya = args.userEmail === "metheotakj@gmail.com";
    const recipientEmail = isShreeya ? "ytsshrts@gmail.com" : args.userEmail;

    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%); border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #be185d; margin: 0; font-size: 28px;">🌸 FlowTracker Update 🌸</h1>
          <h2 style="color: #7c3aed; margin: 10px 0; font-size: 20px;">
            ${isShreeya ? "Ms. Shreeya's Daily Log" : "Daily Log Update"}
          </h2>
          ${isShreeya ? '<p style="color: #ec4899; font-size: 14px; margin: 5px 0;">💕 I love you sleepyhead! 💕</p>' : ''}
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: #374151; margin-top: 0; font-size: 18px; border-bottom: 2px solid #f3e8ff; padding-bottom: 10px;">
            📅 ${formatDate(args.date)}
          </h3>
          
          <div style="margin: 20px 0;">
    `;

    if (args.phase) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <strong style="color: #0369a1;">Cycle Phase:</strong> 
          <span style="color: #374151;">${phaseEmoji[args.phase]} ${args.phase.charAt(0).toUpperCase() + args.phase.slice(1)}</span>
        </div>
      `;
    }

    if (args.flow) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #fdf2f8; border-radius: 8px; border-left: 4px solid #ec4899;">
          <strong style="color: #be185d;">Flow:</strong> 
          <span style="color: #374151;">${flowEmoji[args.flow]} ${args.flow.charAt(0).toUpperCase() + args.flow.slice(1)}</span>
        </div>
      `;
    }

    if (args.temperature) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <strong style="color: #d97706;">Temperature:</strong> 
          <span style="color: #374151;">🌡️ ${args.temperature}°F</span>
        </div>
      `;
    }

    if (args.cervicalMucus) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
          <strong style="color: #059669;">Cervical Mucus:</strong> 
          <span style="color: #374151;">💧 ${args.cervicalMucus.charAt(0).toUpperCase() + args.cervicalMucus.slice(1)}</span>
        </div>
      `;
    }

    if (args.symptoms && args.symptoms.length > 0) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #f5f3ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <strong style="color: #7c3aed;">Symptoms:</strong>
          <ul style="margin: 8px 0; padding-left: 20px; color: #374151;">
            ${args.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (args.mood) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <strong style="color: #1d4ed8;">Mood:</strong> 
          <span style="color: #374151;">${moodEmoji[args.mood]} ${args.mood.charAt(0).toUpperCase() + args.mood.slice(1)}</span>
        </div>
      `;
    }

    if (args.notes) {
      emailContent += `
        <div style="margin: 15px 0; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
          <strong style="color: #16a34a;">Notes:</strong>
          <p style="margin: 8px 0; color: #374151; font-style: italic;">"${args.notes}"</p>
        </div>
      `;
    }

    emailContent += `
          </div>
          
          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              💝 Sent with care from FlowTracker 💝
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              ${isShreeya ? "Tracking Ms. Shreeya's wellness journey with love" : "Tracking your wellness journey"}
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      // Send to main recipient
      await resend.emails.send({
        from: "FlowTracker <notifications@flowtracker.app>",
        to: recipientEmail,
        subject: `🌸 ${isShreeya ? "Ms. Shreeya's" : "Your"} Daily Log - ${formatDate(args.date)}`,
        html: emailContent,
      });

      // Send to partner if enabled and email provided
      if (args.partnerEmail && !isShreeya) {
        await resend.emails.send({
          from: "FlowTracker <notifications@flowtracker.app>",
          to: args.partnerEmail,
          subject: `💕 Your Partner's Daily Log - ${formatDate(args.date)}`,
          html: emailContent.replace("Daily Log Update", "Your Partner's Daily Log"),
        });
      }
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }

    return null;
  },
});
