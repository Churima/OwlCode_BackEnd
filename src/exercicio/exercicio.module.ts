import { Module } from '@nestjs/common';
import { ExercicioService } from './exercicio.service';
import { ExercicioController } from './exercicio.controller';

@Module({
  controllers: [ExercicioController],
  providers: [ExercicioService],
})
export class ExercicioModule {}