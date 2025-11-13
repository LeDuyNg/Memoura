import { promises as fs } from 'fs';
import path from 'path';

/**
 * Recursively scans a directory, collecting folder and file objects.
 *
 * @param {string} directoryPath - The current directory to scan.
 * @param {string} vaultPath - The root vault path, for calculating relative paths.
 * @param {Array} foldersList - An array to store folder objects (passed by reference).
 * @param {Array} filesList - An array to store file objects (passed by reference).
 */
async function scanDirectoryRecursive(directoryPath, vaultPath, foldersList, filesList) {
  try {
    const items = await fs.readdir(directoryPath);

    for (const item of items) {
      // Get the full path
      const fullPath = path.join(directoryPath, item);
      
      // Calculate the path relative to the vault root
      const relativePath = path.relative(vaultPath, fullPath);

      // Skip all hidden files/folders (e.g., .obsidian, .git)
      if (item.startsWith('.')) {
        continue;
      }

      // Get item stats
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        // --- This is a FOLDER ---
        // Create the folder object
        const folderObj = {
          name: item,
          filepath: relativePath,
        };
        // Add it to the list
        foldersList.push(folderObj);
        // Recurse into the folder
        await scanDirectoryRecursive(fullPath, vaultPath, foldersList, filesList);
        
      } else if (stats.isFile()) {
        // --- This is a FILE ---
        // Create the file object
        const fileObj = {
          name: item,
          filepath: relativePath,
          filetype: path.extname(item),
        };
        // Add it to the list
        filesList.push(fileObj);
      }
    }
  } catch (error) {
    console.error(`Could not scan directory ${directoryPath}: ${error.message}`);
  }
}

/**
 * Scans a vault directory and returns an object containing
 * lists of all folder and file objects.
 *
 * @param {string} vaultPath - The absolute path to the vault directory.
 * @returns {Promise<{folders: Array, files: Array}>} A promise that resolves to an object.
 */
export async function scanVault(vaultPath) {
  // Arrays to hold all our objects
  const allFolders = [];
  const allFiles = [];

  console.log(`Starting scan of vault at: ${vaultPath}...`);
  
  //    Pass vaultPath twice: once as the starting dir, 
  //    and once as the root for calculating relative paths.
  await scanDirectoryRecursive(vaultPath, vaultPath, allFolders, allFiles);

  console.log(`...Scan Complete. Found ${allFolders.length} folders and ${allFiles.length} files.`);

  // Return the final structured object
  return {
    folders: allFolders,
    files: allFiles
  };
}