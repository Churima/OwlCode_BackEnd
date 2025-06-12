import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ConteudoJornadaService } from './conteudo-jornada.service';

@Controller('conteudoJornada')
export class ConteudoJornadaController {
  constructor(private readonly conteudoJornadaService: ConteudoJornadaService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get(':jornada_id')
  async getConteudoPorId(@Param('jornada_id') jornadaId: string, @Req() req) {
    const userUid = req.user.uid;
    return this.conteudoJornadaService.getConteudoJornadaPorId(userUid, jornadaId);
  }
}