const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
  try {
    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log("SUCCESS (gemini-1.5-flash):", result.response.text());
  } catch (e) {
    console.error("FAIL (gemini-1.5-flash):", e.message);
  }

  try {
    console.log("Testing gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Say hello");
    console.log("SUCCESS (gemini-pro):", result.response.text());
  } catch (e) {
    console.error("FAIL (gemini-pro):", e.message);
  }

  try {
    console.log("Listing models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    const data = await response.json();
    console.log("Available models:", data.models ? data.models.map(m => m.name) : "No models found or error");
  } catch (e) {
    console.error("FAIL (list models):", e.message);
  }
}

run();
