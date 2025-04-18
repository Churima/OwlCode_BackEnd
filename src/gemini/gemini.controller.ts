import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('perguntar')
  async perguntar(@Body('pergunta') pergunta: string) {
    if (!pergunta) {
      return { erro: 'Campo "pergunta" é obrigatório.' };
    }

    const resposta = await this.geminiService.perguntar(pergunta);
    return { resposta };
  }
}
