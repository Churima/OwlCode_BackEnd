import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { JornadaTopicosService } from '../jornada-topicos/jornada-topicos.service';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);

  private openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
  });

  constructor(private readonly jornadaTopicosService: JornadaTopicosService) {}

  private limparResposta(raw: string): string {
    return raw
      .replace(/```json\s*/i, '')
      .replace(/```/g, '')
      .trim();
  }

  private validarEstrutura(respostaJson: any): any[] {
    if (!respostaJson || typeof respostaJson !== 'object') {
      throw new Error('Resposta JSON inválida');
    }

    if (!Array.isArray(respostaJson.resposta)) {
      throw new Error('A chave "resposta" deve conter um array de módulos');
    }

    return respostaJson.resposta;
  }

  private async obterResposta(pergunta: string): Promise<any[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: pergunta }],
        temperature: 0,
        top_p: 1,
      });

      let rawResposta = completion.choices?.[0]?.message?.content;

      if (!rawResposta) {
        throw new Error('Resposta vazia do modelo');
      }

      const limpa = this.limparResposta(rawResposta);
      console.log('Resposta limpa do GPT:', limpa);
      const parsed = JSON.parse(limpa);
      const modulos = this.validarEstrutura(parsed);

      return modulos;
    } catch (err) {
      this.logger.error('Erro ao processar resposta do GPT:', err.message || err);
      throw new Error('Erro ao interpretar resposta do GPT');
    }
  }

  async perguntar(pergunta: string): Promise<{ status: string; topicosGravados: number }> {
    try {
      const modulos = await this.obterResposta(pergunta);

      let totalGravados = 0;

      for (const modulo of modulos) {
        const { ID, titulo, detalhes, topicos } = modulo;

        if (!ID || !Array.isArray(topicos)) {
          this.logger.warn(`Módulo inválido ignorado: ${JSON.stringify(modulo)}`);
          continue;
        }

        for (const topico of topicos) {
          await this.jornadaTopicosService.adicionarTopico(ID.toString(), {
            id: topico.id,
            titulo: topico.titulo,
            detalhes: topico.detalhes,
            finalizado: topico.finalizado || false,
            anexos: topico.anexos || [],
            exemplos: topico.exemplos || [],
          });


          totalGravados++;
        }
      }

      return { status: 'ok', topicosGravados: totalGravados };
    } catch (err) {
      this.logger.error('Erro ao salvar tópicos:', err.message || err);
      throw new Error('Erro ao salvar tópicos');
    }
  }
}
