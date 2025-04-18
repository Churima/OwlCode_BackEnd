import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class GptService {
  private openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
  });

  async perguntar(pergunta: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',  // ou outro modelo como gpt-3.5-turbo
        messages: [
          { role: 'user', content: pergunta },
        ],
      });

      const resposta = completion.choices?.[0]?.message?.content;

      if (!resposta) {
        throw new Error('Resposta vazia ou inesperada');
      }

      return resposta;
    } catch (error) {
      console.error('Erro ao se comunicar com o GPT:', error);
      throw new Error('Erro ao se comunicar com o GPT');
    }
  }
}
