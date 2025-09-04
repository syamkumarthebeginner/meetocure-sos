export async function convertToWhat3Words(latitude, longitude) {
  const apiKey = import.meta.env.VITE_W3W_API_KEY;
  if (!apiKey) {
    console.warn('VITE_W3W_API_KEY is not set. Skipping what3words conversion.');
    return null;
  }

  try {
    const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${latitude},${longitude}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`what3words API error: ${response.status}`);
    }
    const data = await response.json();
    return data?.words ?? null;
  } catch (error) {
    console.error('Failed to convert coordinates to what3words:', error);
    return null;
  }
}

