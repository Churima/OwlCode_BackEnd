import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
  });

  async perguntar(pergunta: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: pergunta }],
        temperature: 0,
        top_p: 1,
      });

      let resposta = completion.choices?.[0]?.message?.content;
      if (!resposta) {
        throw new Error('Resposta vazia ou inesperada');
      }

      // Remove fences de Markdown e trim
      resposta = resposta
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')
        .trim();
        
      const data = JSON.parse(resposta);

      return data;
    } catch (error) {
      this.logger.error('Erro ao se comunicar com o GPT ou parsear JSON:', error);
      throw new Error('Erro interno ao processar resposta do GPT');
    }
  }
}
