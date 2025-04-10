const axios = require('axios');

const API_KEY = 'AIzaSyAMfDfBDZ0ZItF6thrkRjlKGKDffc-jRxM';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function perguntarAoGemini(pergunta) {
  const body = {
    contents: [
      {
        parts: [{ text: pergunta }]
      }
    ]
  };

  try {
    const resposta = await axios.post(URL, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    return resposta.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('Erro ao enviar pergunta para o Gemini:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { perguntarAoGemini };
