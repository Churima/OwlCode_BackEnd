import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly API_KEY = 'AIzaSyAMfDfBDZ0ZItF6thrkRjlKGKDffc-jRxM';
  private readonly URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.API_KEY}`;

  async perguntar(pergunta: string): Promise<string> {
    const body = {
      contents: [
        {
          parts: [{ text: pergunta }],
        },
      ],
    };

    try {
      const response = await axios.post(this.URL, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error('Erro na API do Gemini:', err.response?.data || err.message);
      throw new Error('Falha ao consultar o Gemini');
    }
  }
}
