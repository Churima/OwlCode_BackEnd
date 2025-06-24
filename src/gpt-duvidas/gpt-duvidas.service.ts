import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { db } from '../firebase/firebase-admin';
import admin from '../firebase/firebase-admin';
import { SYSTEM_PROMPT_DUVIDAS } from './system_prompt_duvidas';
import { Request } from 'express';

@Injectable()
export class GptDuvidasService {
  private readonly logger = new Logger(GptDuvidasService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
  }

  private async buscarJornadaBruta(jornadaId: string): Promise<any> {
    const snapshot = await db.collection('jornada_bruta')
      .where('jornada_id', '==', jornadaId)
      .get();

    if (snapshot.empty) {
      throw new Error(`Nenhuma jornada encontrada com jornada_id: ${jornadaId}`);
    }

    return snapshot.docs[0].data();
  }

  private async extrairUserIdDoToken(req: Request): Promise<string> {
    const token = req.cookies['auth_token'];
    if (!token) throw new Error('Token JWT não encontrado nos cookies');

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      throw new Error('Token JWT inválido');
    }
  }

  async perguntarSobreJornada(jornadaId: string, pergunta: string, req: Request): Promise<any> {
    const jornadaBruta = await this.buscarJornadaBruta(jornadaId);
    const userId = await this.extrairUserIdDoToken(req);

    const contexto = JSON.stringify(jornadaBruta);

    // Buscar o histórico de dúvidas/respostas anteriores da mesma jornada e mesmo usuário
    const historicoSnapshot = await db.collection('gpt-duvidas')
      .where('jornada_id', '==', jornadaId)
      .where('user_id', '==', userId)
      .orderBy('criado_em')
      .limit(10) // Limite opcional, ajuste se quiser
      .get();

    const mensagensHistoricas: ChatCompletionMessageParam[] = [];

    historicoSnapshot.forEach(doc => {
      const data = doc.data();
      mensagensHistoricas.push({ role: 'user', content: data.pergunta });
      mensagensHistoricas.push({ role: 'assistant', content: data.resposta_gpt });
    });

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT_DUVIDAS },
      { role: 'user', content: `Contexto da Jornada:\n${contexto}` },
      ...mensagensHistoricas,
      { role: 'user', content: pergunta },
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
    });

    const respostaGpt = completion.choices[0]?.message?.content ?? 'Sem resposta gerada.';

    await db.collection('gpt-duvidas').add({
      jornada_id: jornadaId,
      user_id: userId,
      pergunta,
      resposta_gpt: respostaGpt,
      criado_em: new Date().toISOString(),
    });

    return { status: 'ok', resposta: respostaGpt };
  }
}
