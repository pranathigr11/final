// FINAL AND CORRECTED CODE for: netlify/functions/ask-ai.js
require('dotenv').config();
 //const API_KEY =process.env.PARCEL_GOOGLE_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { question, recipeTitle } = JSON.parse(event.body);
    
    // This now correctly matches your .env file variable name
   const API_KEY =process.env.PARCEL_GOOGLE_API_KEY;

    if (!API_KEY) {
      throw new Error("Google API key is not set. Check your .env file and Netlify environment variables.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    // This is the new, correct line
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-latest" });

    const prompt = `You are a helpful and concise recipe assistant. A user is making a recipe called "${recipeTitle}". They have a question. User's question: "${question}". Provide a direct and helpful answer in 2-3 sentences.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ answer: answer.trim() }),
    };
  } catch (error) {
    console.error("Error in ask-ai function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'There was an internal error processing your request.' }),
    };
  }
};