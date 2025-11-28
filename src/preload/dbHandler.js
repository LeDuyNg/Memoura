import path from 'path';
import { app } from 'electron';
import fs from 'fs';

// Defines where the file is stored.
// app.getPath('userData') is a safe folder created by Electron for your app's data.
const getDbPath = () => path.join(app.getPath('userData'), 'memoura_events.json');

/**
 * Initialize the "database" (JSON file).
 * If the file doesn't exist, create it with an empty array.
 */
export function initDB() {
  const dbPath = getDbPath();
  console.log("Initializing JSON DB at:", dbPath);

  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([]), 'utf-8');
      console.log("Created new events database file.");
    } else {
      console.log("Events database file found.");
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

/**
 * Get all events from the JSON file
 */
export function getEvents() {
  try {
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) return [];
    
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent) || [];
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}

/**
 * Add a new event
 */
export function addEvent(eventData) {
  try {
    const events = getEvents();
    
    // Create a new event object with a unique ID
    const newEvent = {
      ...eventData,
      id: Date.now(), // Simple unique ID using timestamp
      created_at: new Date().toISOString()
    };

    events.push(newEvent);
    
    // Save back to file
    fs.writeFileSync(getDbPath(), JSON.stringify(events, null, 2), 'utf-8');
    
    return { success: true, id: newEvent.id };
  } catch (err) {
    console.error("Error adding event:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing event
 */
export function updateEvent(updatedEvent) {
  try {
    const events = getEvents();
    const index = events.findIndex(e => e.id === updatedEvent.id);
    
    if (index !== -1) {
      // Merge existing event with updates
      events[index] = { ...events[index], ...updatedEvent };
      
      // Save back to file
      fs.writeFileSync(getDbPath(), JSON.stringify(events, null, 2), 'utf-8');
      return { success: true };
    }
    return { success: false, error: "Event not found" };
  } catch (err) {
    console.error("Error updating event:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete an event by ID
 */
export function deleteEvent(id) {
  try {
    const events = getEvents();
    
    // Filter out the event with the matching ID
    const filteredEvents = events.filter(event => event.id !== id);
    
    // Write the new list back to the file
    fs.writeFileSync(getDbPath(), JSON.stringify(filteredEvents, null, 2), 'utf-8');
    
    return { success: true };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Register IPC handlers for the main process
 */
export function registerDBHandlers(ipcMain) {
  // Initialize DB file immediately
  initDB();

  ipcMain.handle('db-get-events', () => getEvents());
  
  ipcMain.handle('db-add-event', (_, eventData) => {
    return addEvent(eventData);
  });

  // --- NEW HANDLER FOR EDITING ---
  ipcMain.handle('db-update-event', (_, eventData) => {
    return updateEvent(eventData);
  });
  
  ipcMain.handle('db-delete-event', (_, id) => {
    return deleteEvent(id);
  });
}