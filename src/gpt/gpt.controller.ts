// src/gpt/gpt.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('perguntar')
  async perguntar(@Body('pergunta') pergunta: string) {
    const resposta = await this.gptService.perguntar(pergunta);
    return { resposta };
  }
}
