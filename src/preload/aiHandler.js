import { Ollama } from "@langchain/ollama";
import fs from 'fs';
import path from 'path';

// Initialize the model
const llm = new Ollama({
  model: "gemma3:1b", 
  temperature: 0,
  maxRetries: 2,
});

/**
 * Generates flashcards from text and saves them to a JSON file.
 * @param {string} text - The source text to process.
 * @param {string} vaultPath - The user's vault path (where to save the file).
 * @param {string} [originalFilePath] - The path of the source file (optional).
 */
async function generateFlashcards(text, vaultPath, originalFilePath) {
  console.log("Starting Flashcard Generation...");

  const prompt = `Turn the following content into flashcards in .JSON format for me. 
  Only give me the .JSON. Don't include markdown formatting like \`\`\`json.
  The structure should be an array of objects, where each object has a "question" and "answer".
  
  Content:
  ${text}`;

  try {
    const completion = await llm.invoke(prompt);
    const rawJsonString = completion.replace(/```json|```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(rawJsonString);
    } catch (parseError) {
      throw new Error("AI did not return valid JSON.");
    }

    const cardsArray = Array.isArray(parsedData) ? parsedData : parsedData.flashcards || [];

    if (cardsArray.length === 0) {
      throw new Error("No flashcards were generated.");
    }

    const cleanedCards = cardsArray.map(card => ({
      question: card.question ? card.question.replace(/\s+/g, ' ').trim() : "Error",
      answer: card.answer ? card.answer.replace(/\s+/g, ' ').trim() : "Error"
    }));

    const finalObject = { 
      title: "Generated Flashcards",
      created_at: new Date().toISOString(),
      flashcards: cleanedCards 
    };

    const finalFileContent = JSON.stringify(finalObject, null, 2);
    const outputDir = path.join(vaultPath, 'Flashcards');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // --- MODIFIED NAMING LOGIC ---
    let filename;
    if (originalFilePath) {
      const ext = path.extname(originalFilePath);
      const basename = path.basename(originalFilePath, ext); // Get name without extension
      filename = `${basename}-flashcard.json`;
    } else {
      // Fallback if no file was selected (e.g., pasted text)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `flashcards_${timestamp}.json`;
    }

    const filePath = path.join(outputDir, filename);

    await fs.promises.writeFile(filePath, finalFileContent);
    return { success: true, filePath, count: cleanedCards.length };

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return { error: error.message };
  }
}

/**
 * Generates a summary from text and saves it to a new .txt file.
 */
async function generateSummary(text, originalFilePath) {
  console.log("Starting Summary Generation...");

  const prompt = `Please summarize the following text. Capture the main points and key details concisely.
  
  Text:
  ${text}`;

  try {
    const summary = await llm.invoke(prompt);
    
    if (!originalFilePath) {
        return { error: "No original file path provided for summary." };
    }

    const dir = path.dirname(originalFilePath);
    const ext = path.extname(originalFilePath);
    const basename = path.basename(originalFilePath, ext);
    
    const newFilename = `${basename}-summarize.txt`;
    const newFilePath = path.join(dir, newFilename);

    await fs.promises.writeFile(newFilePath, summary, 'utf-8');
    
    console.log(`Successfully wrote summary to ${newFilePath}`);
    return { success: true, filePath: newFilePath };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: error.message };
  }
}

/**
 * Register the handlers for the main process
 */
export function registerAIHandler(ipcMain) {
  // --- UPDATED HANDLER ---
  ipcMain.handle('generate-flashcards', async (event, { text, vaultPath, originalFilePath }) => {
    return await generateFlashcards(text, vaultPath, originalFilePath);
  });

  ipcMain.handle('summarize-text', async (event, { text, originalFilePath }) => {
    return await generateSummary(text, originalFilePath);
  });
}