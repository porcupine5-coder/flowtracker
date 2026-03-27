import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

// Meal reminder action
export const sendMealReminder = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    let mealType = "";
    let message = "";
    let shouldSend = false;

    // Morning reminders
    if (!isWeekend && hour === 7 && minute === 0) {
      mealType = "Breakfast";
      message = "Good morning, Ms. Shreeya! 🌸 Time for a nourishing breakfast to start your beautiful day!";
      shouldSend = true;
    } else if (isWeekend && hour === 11 && minute === 0) {
      mealType = "Breakfast";
      message = "Good morning, Ms. Shreeya! 🌺 Weekend breakfast time! Enjoy a relaxing and nourishing meal!";
      shouldSend = true;
    }
    
    // Lunch reminders
    else if (!isWeekend && hour === 12 && minute === 30) {
      mealType = "Lunch";
      message = "Lunch time, Ms. Penguine! 🌷 Take a break and fuel your body with something delicious and healthy!";
      shouldSend = true;
    } else if (isWeekend && hour === 15 && minute === 0) {
      mealType = "Lunch";
      message = "Afternoon meal time, Ms. Penguine! 🌹 Perfect time for a lovely weekend lunch!";
      shouldSend = true;
    }
    
    // Afternoon snack (weekdays only)
    else if (!isWeekend && hour === 16 && minute === 45) {
      mealType = "Afternoon Snack";
      message = "Afternoon snack time, Ms. Penguine! 🌸 A little something to keep your energy up!";
      shouldSend = true;
    }
    
    // Dinner reminders (every day)
    else if (hour === 19 && minute === 0) {
      mealType = "Dinner";
      message = "Dinner time, Ms. Penguine! 🌺 Time for a wonderful evening meal to end your day beautifully!";
      shouldSend = true;
    }

    if (!shouldSend) return null;

    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%); border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #be185d; margin: 0; font-size: 28px;">🌸 FlowTracker Care 🌸</h1>
          <h2 style="color: #7c3aed; margin: 10px 0; font-size: 20px;">Meal Reminder for Ms. Shreeya</h2>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0; font-size: 24px; margin-bottom: 10px;">
              ${mealType} Time! 🍽️
            </h3>
            <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">
              ${message}
            </p>
          </div>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <p style="color: #16a34a; margin: 0; font-size: 14px;">
              <strong>💚 Wellness Tip:</strong> Remember to stay hydrated and choose foods that make you feel energized and happy!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              💝 Sent with care from your FlowTracker AI Assistant 💝
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              Taking care of Ms. Penguine's wellness journey
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "FlowTracker Care <care@flowtracker.app>",
        to: "ytsshrts@gmail.com",
        subject: `🌸 ${mealType} Reminder for Ms. Penguine`,
        html: emailContent,
      });
    } catch (error) {
      console.error("Failed to send meal reminder:", error);
    }

    return null;
  },
});

// Set up cron jobs for meal reminders
const crons = cronJobs();

// Check every minute for meal reminders
crons.interval("meal reminders", { minutes: 1 }, internal.mealReminders.sendMealReminder, {});

export default crons;
