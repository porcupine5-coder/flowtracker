import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD8Ojblr-8Kc-eOQGVXyk4IXb5Pr0UFHQM";
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
