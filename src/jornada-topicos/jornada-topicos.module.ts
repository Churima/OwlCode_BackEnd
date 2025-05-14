// jornada-topicos.module.ts
import { Module } from '@nestjs/common';
import { JornadaTopicosService } from './jornada-topicos.service';

@Module({
  providers: [JornadaTopicosService],
  exports: [JornadaTopicosService], // <-- isso é essencial
})
export class JornadaTopicosModule {}
