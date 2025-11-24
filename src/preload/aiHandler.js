import { Ollama } from "@langchain/ollama";
import fs from 'fs';
import path from 'path';

// Initialize the model
const llm = new Ollama({
  model: "gemma3:1b", // Ensure you have run `ollama pull gemma3:1b`
  temperature: 0,
  maxRetries: 2,
});

/**
 * Generates flashcards from text and saves them to a JSON file.
 * @param {string} text - The source text to process.
 * @param {string} vaultPath - The user's vault path (where to save the file).
 */
async function generateFlashcards(text, vaultPath) {
  console.log("Starting Flashcard Generation...");

  const prompt = `Turn the following content into flashcards in .JSON format for me. 
  Only give me the .JSON. Don't include markdown formatting like \`\`\`json.
  The structure should be an array of objects, where each object has a "question" and "answer".
  
  Content:
  ${text}`;

  try {
    // 1. Call Ollama
    const completion = await llm.invoke(prompt);
    console.log("AI Response received.");

    // 2. Clean up the response
    // Remove Markdown artifacts if the model ignores the instruction
    const rawJsonString = completion.replace(/```json|```/g, '').trim();

    // 3. Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(rawJsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", rawJsonString);
      throw new Error("AI did not return valid JSON.");
    }

    // 4. Normalize structure (handle Array vs Object wrapper)
    const cardsArray = Array.isArray(parsedData) ? parsedData : parsedData.flashcards || [];

    if (cardsArray.length === 0) {
      throw new Error("No flashcards were generated.");
    }

    // 5. Cleanup whitespace
    const cleanedCards = cardsArray.map(card => ({
      question: card.question ? card.question.replace(/\s+/g, ' ').trim() : "Error",
      answer: card.answer ? card.answer.replace(/\s+/g, ' ').trim() : "Error"
    }));

    // 6. Prepare Final Object
    const finalObject = { 
      title: "Generated Flashcards",
      created_at: new Date().toISOString(),
      flashcards: cleanedCards 
    };

    const finalFileContent = JSON.stringify(finalObject, null, 2);

    // 7. Ensure 'Flashcards' directory exists in the vault
    const outputDir = path.join(vaultPath, 'Flashcards');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 8. Generate a filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `flashcards_${timestamp}.json`;
    const filePath = path.join(outputDir, filename);

    // 9. Write to disk
    await fs.promises.writeFile(filePath, finalFileContent);
    console.log(`Successfully wrote ${filename}`);

    return { success: true, filePath, count: cleanedCards.length };

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return { error: error.message };
  }
}

/**
 * Register the handler for the main process
 */
export function registerAIHandler(ipcMain) {
  ipcMain.handle('generate-flashcards', async (event, { text, vaultPath }) => {
    return await generateFlashcards(text, vaultPath);
  });
}