import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

// Daily messages action for Shreeya
export const sendDailyMessage = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    let messageType = "";
    let message = "";
    let shouldSend = false;

    // Good morning message at 7:00 AM
    if (hour === 7 && minute === 0) {
      messageType = "Good Morning";
      const morningMessages = [
        "Good morning, my beautiful sleepyhead! 🌸 Rise and shine, the world is waiting for your amazing energy! 💕",
        "Morning sunshine! 🌅 I hope you slept well, my love. Ready to conquer this beautiful day? 🌸",
        "Wake up, gorgeous! ☀️ Another day to be the incredible woman you are. I love you! 💖",
        "Good morning, Ms. Shreeya! 🌺 Time to bloom like the beautiful flower you are! 🌸",
        "Rise and shine, my darling! 🌟 Your smile can light up the entire world today! 💕"
      ];
      message = morningMessages[Math.floor(Math.random() * morningMessages.length)];
      shouldSend = true;
    }
    
    // Good night message at 10:00 PM
    else if (hour === 22 && minute === 0) {
      messageType = "Good Night";
      const nightMessages = [
        "Good night, my sleepyhead! 🌙 Sweet dreams and rest well. I love you so much! 💕",
        "Time for bed, beautiful! 🌸 May your dreams be as lovely as you are. Sleep tight! 💖",
        "Good night, Ms. Shreeya! 🌺 Rest your beautiful soul and wake up refreshed tomorrow! 🌙",
        "Sweet dreams, my love! ✨ Thank you for being the amazing person you are. Sleep well! 💕",
        "Night night, gorgeous! 🌟 Close your eyes and let the stars watch over you! 🌙💖"
      ];
      message = nightMessages[Math.floor(Math.random() * nightMessages.length)];
      shouldSend = true;
    }

    if (!shouldSend) return null;

    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%); border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #be185d; margin: 0; font-size: 28px;">🌸 FlowTracker Love 🌸</h1>
          <h2 style="color: #7c3aed; margin: 10px 0; font-size: 20px;">${messageType} Message for Ms. Shreeya</h2>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 15px;">
              ${messageType === "Good Morning" ? "🌅" : "🌙"}
            </div>
            <p style="color: #374151; font-size: 18px; margin: 0; line-height: 1.6;">
              ${message}
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="color: #d97706; margin: 0; font-size: 14px;">
              <strong>💛 Daily Reminder:</strong> You are loved, you are beautiful, and you are capable of amazing things!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              💝 Sent with endless love from your FlowTracker AI 💝
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              Always here for Ms. Shreeya with love and care
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "FlowTracker Love <love@flowtracker.app>",
        to: "ytsshrts@gmail.com",
        subject: `💕 ${messageType}, Ms. Shreeya!`,
        html: emailContent,
      });
    } catch (error) {
      console.error("Failed to send daily message:", error);
    }

    return null;
  },
});

// Set up cron jobs for daily messages
const crons = cronJobs();

// Check every minute for daily messages
crons.interval("daily messages", { minutes: 1 }, internal.dailyMessages.sendDailyMessage, {});

export default crons;
