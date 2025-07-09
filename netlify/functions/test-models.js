// FINAL, CORRECTED, AND SIMPLIFIED CODE for: netlify/functions/test-models.js

// No complex imports needed, just the built-in fetch
require('dotenv').config();
exports.handler = async function(event) {
  try {
    const API_KEY =process.env.PARCEL_GOOGLE_API_KEY;
    if (!API_KEY) {
      throw new Error("Google API key is not set in environment variables.");
    }

    // This is the direct URL to list all available models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    console.log("Fetching available models directly from Google API...");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Filter the models to find the ones that can generate content
    const availableModels = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name); // Get just the name

    console.log("✅ Models available to you:", availableModels);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success! Check your Netlify Dev terminal for the list of model names.",
        models: availableModels,
      }),
    };
  } catch (error) {
    console.error("❌ Error listing models:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};