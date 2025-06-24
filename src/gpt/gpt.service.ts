import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { SYSTEM_PROMPT } from './SYSTEM_PROMPT';

// Importe a instância 'db' do Firestore que já foi inicializada
// com as suas credenciais no arquivo firebase-admin.ts.
import { db } from '../firebase/firebase-admin'; // Ajuste o caminho se necessário

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  // Agora 'firestore' usa a instância pré-configurada do Firebase Admin SDK.
  private readonly firestore = db;

  private readonly baseMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
    // Não é necessário inicializar o Firestore aqui, pois 'db' já está configurado.
  }

  private limparResposta(raw: string): string {
    return raw.replace(/```json\s*/i, '').replace(/```/g, '').trim();
  }

  private validarEstrutura(json: any): void {
    if (!json || typeof json !== 'object' || !Array.isArray(json.resposta)) {
      throw new Error('Estrutura JSON inesperada');
    }
    json.resposta.forEach((modulo: any) => {
      if (!Array.isArray(modulo.topicos)) {
        throw new Error('Módulo sem topicos');
      }
      modulo.topicos.forEach((topico: any) => {
        if (typeof topico.topico_subtitulo !== 'string' || !topico.topico_subtitulo.trim()) {
          throw new Error('Tópico sem subtítulo');
        }
      });
    });
  }

private async salvarJornadaBruta(jsonCompleto: any, userId: string): Promise<string> {
  const docRef = this.firestore.collection('jornada_bruta').doc();
  await docRef.set({
    jornada_id: docRef.id,
    user_id: userId, // <- salvar no Firestore
    ...jsonCompleto,
    criado_em: new Date().toISOString(),
  });
  return docRef.id;
}

  async perguntar(pergunta: string, userId: string): Promise<any> {
  const completion = await this.openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      ...this.baseMessages,
      { role: 'user', content: pergunta },
    ],
    temperature: 0,
    top_p: 1,
  });

  const raw = completion.choices?.[0]?.message?.content ?? '';
  const limpa = this.limparResposta(raw);

  this.logger.debug('Resposta da IA limpa:', limpa);

  const jsonCompleto = JSON.parse(limpa);
  this.validarEstrutura(jsonCompleto);

  return jsonCompleto; // 👈 retornando o conteúdo esperado
}
}