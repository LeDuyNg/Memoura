# JS Snippets

## Get Unique Values from Array
Using a `Set` is the easiest way.

\`\`\`javascript
const numbers = [1, 2, 2, 3, 4, 5, 5, 1];
const uniqueNumbers = [...new Set(numbers)];
// uniqueNumbers is [1, 2, 3, 4, 5]
\`\`\`

## Async/Await Fetch
\`\`\`javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
\`\`\`