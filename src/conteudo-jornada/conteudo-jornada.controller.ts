import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ConteudoJornadaService } from './conteudo-jornada.service';

@Controller('conteudoJornada')
export class ConteudoJornadaController {
  constructor(private readonly conteudoJornadaService: ConteudoJornadaService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getConteudoJornada(@Req() req) {
    const userId = req.user.uid;
    return this.conteudoJornadaService.getConteudoJornada(userId);
  }
}