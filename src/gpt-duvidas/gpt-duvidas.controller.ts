import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { GptDuvidasService } from './gpt-duvidas.service';
import { Request } from 'express';

@Controller('gpt-duvidas')
export class GptDuvidasController {
  constructor(private readonly gptDuvidasService: GptDuvidasService) {}

  @Post(':jornadaId/duvida')
  async perguntar(
    @Param('jornadaId') jornadaId: string,
    @Body('pergunta') pergunta: string,
    @Req() req: Request,
  ) {
    return this.gptDuvidasService.perguntarSobreJornada(jornadaId, pergunta, req);
  }
}
