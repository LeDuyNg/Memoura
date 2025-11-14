/**
 * A reusable helper function to make a single, authenticated API call to Canvas.
 * @param {string} endpoint - The API endpoint
 */
async function fetchFromCanvas(endpoint) {
  // Get the constants from environment variables (process.env)
  const CANVAS_API_KEY = process.env.CANVAS_API_KEY;
  const CANVAS_DOMAIN = process.env.CANVAS_DOMAIN;
  
  if (!CANVAS_API_KEY || !CANVAS_DOMAIN) {
    console.error('Error: CANVAS_API_KEY or CANVAS_DOMAIN is not set in .env file.');
    throw new Error('API Key or Domain not configured.');
  }

  // Build the URL with the access token
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${CANVAS_DOMAIN}${endpoint}${separator}access_token=${CANVAS_API_KEY}`;  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Canvas API Error for ${url}: ${response.status} ${response.statusText}`);
      throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
    }    
    // Get the raw JSON as text
    const text = await response.text();
    if (!text) {
      console.warn(`Canvas API: Empty response for ${url}`);
      return []; // Return an empty array for empty responses
    }

    // Use a regular expression to find numbers with 10 or more digits
    // that follow a colon, comma, or open bracket (i.e., JSON values)
    // and wrap them in quotes.
    const safeText = text.replace(/([:\[,]\s*)(\d{10,})/g, '$1"$2"');

    const data = JSON.parse(safeText);
    return data;

  } catch (error) {
    console.error(`Failed to fetch from Canvas API: ${error.message}`);
    throw error;
  }
}

/**
 * Registers the 'fetch-canvas-data' handler with ipcMain.
 * @param {import('electron').IpcMain} ipcMain
 */
export function registerCanvasHandler(ipcMain) {
  
  ipcMain.handle('fetch-canvas-data', async (event, coursesEndpoint) => {
    
    let courses = [];
    try {
      // Fetch the list of courses
      const endpoint = `${coursesEndpoint}?enrollment_state=active`;
      courses = await fetchFromCanvas(endpoint);
      
      if (!Array.isArray(courses)) {
        console.warn('Courses response is not an array:', courses);
        return courses.error ? courses : [];
      }
    } catch (error) {
      console.error(error.message);
      return { error: error.message };
    }

    try {
      // Create a list of "promises" to fetch assignments for EACH course
      const assignmentPromises = courses.map(course => {
        const assignmentEndpoint = `/api/v1/courses/${course.id}/assignments`;
        return fetchFromCanvas(assignmentEndpoint);
      });
      const assignmentResults = await Promise.allSettled(assignmentPromises);

      // Attach assignments back to their courses
      assignmentResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          courses[index].assignments = result.value;
        } else {
          console.error(`Failed to get assignments for course ${courses[index].name}:`, result.reason.message);
          courses[index].assignments = [];
        }
      });
      return courses;

    } catch (error) {
      console.error(error.message);
      return { error: error.message };
    }
  });
}