import { Body, Controller, Get, Patch, Req, UseGuards, Post } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { JornadasService } from './jornadas.service';

@Controller('jornadas')
export class JornadasController {
  constructor(private readonly jornadasService: JornadasService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getJornadas(@Req() req) {
    const userId = req.user.uid;
    return this.jornadasService.getJornadasByUserId(userId);
  }

@UseGuards(FirebaseAuthGuard)
@Patch('topico')
async marcarTopicoComoConcluido(
  @Req() req,
  @Body() body: { jornada_id: string, modulo_id: number | string, topico_id: number | string }
) {
  const userId = req.user.uid;
  return this.jornadasService.marcarTopicoComoConcluido(
    userId,
    body.jornada_id,
    Number(body.modulo_id),
    Number(body.topico_id)
  );
}

@UseGuards(FirebaseAuthGuard)
@Patch('modulo')
async marcarModuloComoConcluido(
  @Req() req,
  @Body() body: { jornada_id: string, modulo_id: number | string }
) {
  const userId = req.user.uid;
  return this.jornadasService.marcarModuloComoConcluido(
    userId,
    body.jornada_id,
    Number(body.modulo_id)
  );
}

@UseGuards(FirebaseAuthGuard)
  @Post('criarJornada')
  async criarJornada(
    @Req() req,
    @Body() body: {
      linguagem: string,
      dificuldades: string[],
      disponibilidade: string,
      estilos_aprendizagem: string[],
      experiencia_linguagem: string,
      conhecimento_logica: string[],
      meta_pessoal: string[],
      nivel_programacao: string,
      objetivo_final: string,
      complemento?: string
    }
  ) {
    const userId = req.user.uid;
    return this.jornadasService.criarJornada(userId, body);
  }
}