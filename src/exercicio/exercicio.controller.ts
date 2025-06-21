import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ExercicioService } from './exercicio.service';
import { CreateExercicioDto } from '../dto/create-exercicio.dto';
import { CorrigirExercicioDto } from '../dto/corrigir-exercicio.dto';

@Controller('exercicio')
export class ExercicioController {
  constructor(private readonly service: ExercicioService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('gerar')
  async gerar(@Req() req, @Body() dto: CreateExercicioDto) {
    const userId = req.user.uid;
    return this.service.gerarExercicio(dto, userId);
  }

  @Post('corrigir')
  @UseGuards(FirebaseAuthGuard)
  async corrigir(@Req() req, @Body() dto: CorrigirExercicioDto) {
    const userId = req.user.uid;
    return this.service.corrigirExercicio(dto, userId);
  }
}