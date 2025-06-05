import { Controller, Post, Body } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('perguntar')
  perguntar(@Body('pergunta') pergunta: string) {
    return this.gptService.perguntar(pergunta);
  }
}
