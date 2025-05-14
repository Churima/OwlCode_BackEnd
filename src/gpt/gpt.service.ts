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

  private async obterResposta(pergunta: string): Promise<any> {
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

      // Limpeza da resposta (remover possíveis blocos de código)
      resposta = resposta
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')
        .trim();

      // Tenta fazer o parse da resposta
      let modulos;
      try {
        const parsedResposta = JSON.parse(resposta);
        modulos = parsedResposta.resposta;
      } catch (error) {
        this.logger.error('Erro ao parsear a resposta do GPT:', error);
        throw new Error('Erro ao processar a resposta JSON');
      }

      // Verifica se modulos é um array
      if (!Array.isArray(modulos)) {
        this.logger.error('A chave "resposta" não contém um array ou está mal formatada');
        throw new Error('A resposta não contém um array válido de módulos');
      }

      return modulos;
    } catch (error) {
      this.logger.error('Erro ao obter resposta do GPT:', error);
      throw new Error('Erro ao fazer a requisição ao GPT');
    }
  }

  // Função para lidar com a gravação dos tópicos
  async perguntar(pergunta: string): Promise<any> {
    try {
      // Tenta obter a resposta do GPT
      const modulos = await this.obterResposta(pergunta);

      let totalGravados = 0;

      for (const modulo of modulos) {
        const { ID, titulo, detalhes, topicos } = modulo;

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
    } catch (error) {
      this.logger.error('Erro ao salvar tópicos:', error);
      throw new Error('Erro ao salvar tópicos');
    }
  }
}
