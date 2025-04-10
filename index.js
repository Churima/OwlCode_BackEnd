const express = require('express');
const app = express();
const PORT = 3000;

const { perguntarAoGemini } = require('./geminiService');

app.use(express.json());

// Rota simples
app.get('/', (req, res) => {
  res.send('OwlCode API voando alto! 🦉✨');
});

// Nova rota para enviar perguntas ao Gemini
app.post('/perguntar', async (req, res) => {
  const { pergunta } = req.body;

  if (!pergunta) {
    return res.status(400).json({ erro: 'Campo "pergunta" é obrigatório.' });
  }

  try {
    const resposta = await perguntarAoGemini(pergunta);
    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar o Gemini.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
