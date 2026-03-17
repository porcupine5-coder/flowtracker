import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Use gemini-2.5-flash (most stable/recent flash model)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });  

async function main() {
  try {
    console.log("--- Starting Gemini API call ---");
    const result = await model.generateContent("Explain how AI works in a few words");
    const response = await result.response;
    const text = response.text();
    console.log("Response:", text);
    console.log("\n--- Verification Successful ---");
  } catch (error) {
    console.error("Critical Error in Gemini integration:", error.message);
    process.exit(1);
  }
}

main();
