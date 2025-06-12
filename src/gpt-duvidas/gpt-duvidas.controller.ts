import { Controller, Post, Req, Body, UnauthorizedException } from '@nestjs/common';
import { GptDuvidasService } from './gpt-duvidas.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Controller('gpt-duvidas')
export class GptDuvidasController {
  constructor(private readonly gptDuvidasService: GptDuvidasService) {}

  @Post()
  async perguntar(@Req() req: Request, @Body('pergunta') pergunta: string) {
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Token não encontrado nos cookies');
    }

    const decoded = jwt.decode(token) as { userId: string };

    if (!decoded?.userId) {
      throw new UnauthorizedException('Token inválido');
    }

    const userId = decoded.userId;
    return this.gptDuvidasService.perguntar(pergunta, userId);
  }
}
