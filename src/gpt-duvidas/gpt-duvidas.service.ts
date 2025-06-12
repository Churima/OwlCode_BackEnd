import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { SYSTEM_PROMPT_DUVIDAS } from './system_prompt_duvidas';
import { db } from '../firebase/firebase-admin'; // Firebase Admin configurado

@Injectable()
export class GptDuvidasService {
  private readonly logger = new Logger(GptDuvidasService.name);
  private readonly firestore = db;

  private readonly baseMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT_DUVIDAS },
  ];

  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
  }

  async perguntar(pergunta: string, userId: string): Promise<{ status: string; duvidaId: string }> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        ...this.baseMessages,
        { role: 'user', content: pergunta },
      ],
      temperature: 0.7,
      top_p: 1,
    });

    const respostaIA = completion.choices?.[0]?.message?.content ?? '';

    // Salva no Firestore
    const docRef = this.firestore.collection('duvidas').doc();
    await docRef.set({
      duvida_id: docRef.id,
      user_id: userId,
      pergunta,
      resposta: respostaIA,
      criado_em: new Date().toISOString(),
    });

    return { status: 'ok', duvidaId: docRef.id };
  }
}
