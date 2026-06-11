const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure your GEMINI_API_KEY is defined in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a professional server secretary. Your goal is to provide concise, structured summaries of Discord conversations. Use bold text for key points. Keep your tone helpful, objective, and efficient." 
});

async function getAIResponse(prompt, history = []) {
    try {
        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error communicating with AI Service:", error);
        throw new Error("AI Service unavailable");
    }
}

module.exports = { getAIResponse };
