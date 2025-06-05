import { Module } from '@nestjs/common';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { JornadaTopicosModule } from '../jornada-topicos/jornada-topicos.module';
import { JornadasModule } from '../jornadas/jornadas.module';
import { JornadaModulosModule } from '../jornada-modulos/jornada-modulos.module';  // novo

@Module({
  imports: [
    JornadaTopicosModule,
    JornadasModule,
    JornadaModulosModule,   // <-- importa para injeção
  ],
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
