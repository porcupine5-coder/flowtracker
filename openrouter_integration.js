/**
 * Fixed OpenRouter AI-assistant integration module.
 * Confirmed: openai/gpt-5.4-pro is a valid model on OpenRouter with reasoning capabilities.
 */

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OPENROUTER_HTTP_REFERER = process.env.OPENROUTER_HTTP_REFERER || "https://flowtracker.ai";
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || "FlowTracker AI Integration Test";

/**
 * Executes a conversation with the AI assistant about counting r's in 'strawberry'.
 * Demonstrates preserved reasoning between turns.
 */
export async function runStrawberryTest() {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY. Set it in .env.");
    }

    console.log("--- Starting first API call ---");

    // First API call with reasoning
    const response1 = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": OPENROUTER_HTTP_REFERER, // Required by some models/accounts
        "X-Title": OPENROUTER_TITLE
      },
      body: JSON.stringify({
        "model": "google/gemma-3-27b-it:free",
        "messages": [
          {
            "role": "user",
            "content": "How many r's are in the word 'strawberry'?"
          }
        ],
        "reasoning": { "enabled": true }
      })
    });

    // Surface HTTP 4xx/5xx responses
    if (!response1.ok) {
      const errorText = await response1.text();
      throw new Error(`First API call failed with status ${response1.status}: ${errorText}`);
    }

    const result1 = await response1.json();
    const assistantMessage1 = result1.choices[0].message;

    console.log("Assistant Reply 1:", assistantMessage1.content);
    if (assistantMessage1.reasoning_details) {
      console.log("(Reasoning details preserved)");
    }

    // Preserve the assistant message with reasoning_details for the second call
    const messages = [
      {
        role: 'user',
        content: "How many r's are in the word 'strawberry'?",
      },
      {
        role: 'assistant',
        content: assistantMessage1.content,
        reasoning_details: assistantMessage1.reasoning_details, // Pass back unmodified
      },
      {
        role: 'user',
        content: "Are you sure? Think carefully.",
      },
    ];

    console.log("\n--- Starting second API call (continuing reasoning) ---");

    // Second API call - model continues reasoning from where it left off
    const response2 = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-3-27b-it:free",
        "messages": messages  // Includes preserved reasoning_details
      })
    });

    if (!response2.ok) {
      const errorText = await response2.text();
      throw new Error(`Second API call failed with status ${response2.status}: ${errorText}`);
    }

    const result2 = await response2.json();
    const assistantMessage2 = result2.choices[0].message;

    console.log("Assistant Reply 2:", assistantMessage2.content);
    
    return {
      reply1: assistantMessage1.content,
      reply2: assistantMessage2.content
    };

  } catch (error) {
    console.error("Critical Error in AI integration:", error.message);
    process.exit(1);
  }
}

// Minimal test to run when executed directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('openrouter_integration.js')) {
  runStrawberryTest();
}
