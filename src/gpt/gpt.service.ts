import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { SYSTEM_PROMPT } from './SYSTEM_PROMPT';

import { JornadaTopicosService } from '../jornada-topicos/jornada-topicos.service';
import { JornadasService } from '../jornadas/jornadas.service';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);

  /** prompt-system enviado em TODAS as requisições */
  private readonly baseMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  private openai: OpenAI;

  constructor(
    private readonly jornadaTopicosService: JornadaTopicosService,
    private readonly jornadasService: JornadasService,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
  }

  /* util */
  private limparResposta(raw: string): string {
    return raw.replace(/```json\s*/i, '').replace(/```/g, '').trim();
  }

  private validarEstrutura(json: any): any[] {
    if (!json || typeof json !== 'object' || !Array.isArray(json.resposta)) {
      throw new Error('Estrutura JSON inesperada');
    }
    json.resposta.forEach((m: any) => {
      if (!Array.isArray(m.topicos)) throw new Error('Módulo sem topicos');
      m.topicos.forEach((t: any) => {
        if (typeof t.titulo2 !== 'string' || !t.titulo2.trim()) {
          throw new Error(`Tópico ${t.id} sem titulo2`);
        }
      });
    });
    return json.resposta;
  }

  /* chama OpenAI */
  private async obterModulos(pergunta: string): Promise<any[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        ...this.baseMessages,
        { role: 'user', content: pergunta } as ChatCompletionMessageParam,
      ],
      temperature: 0,
      top_p: 1,
    });

    const raw   = completion.choices?.[0]?.message?.content ?? '';
    const limpa = this.limparResposta(raw);
    this.logger.debug('JSON extraído →', limpa);
    const parsed = JSON.parse(limpa);
    return this.validarEstrutura(parsed);
  }

  
  /* endpoint público */
  async perguntar(pergunta: string): Promise<{ status: string; topicosGravados: number }> {
    const modulos = await this.obterModulos(pergunta);
    let total = 0;

    for (const modulo of modulos) {
      const { titulo, detalhes, topicos } = modulo;

      const jornadaId = await this.jornadasService.adicionarJornada({ titulo, detalhes });

      for (const topico of topicos) {
        await this.jornadaTopicosService.adicionarTopico(jornadaId.toString(), {
          ...topico,
          finalizado: topico.finalizado ?? false,
        });
        total++;
      }
    }

    return { status: 'ok', topicosGravados: total };
  }
}