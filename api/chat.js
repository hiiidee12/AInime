export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, max_tokens, temperature } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  const API_URL = process.env.AI_API_URL;
  const API_KEY = process.env.AI_API_KEY;
  const API_MODEL = process.env.AI_API_MODEL || 'mimo-v2.5';

  if (!API_URL || !API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages,
        max_tokens: max_tokens || 800,
        temperature: temperature || 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
