// src/gpt/gpt.module.ts
import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { JornadaTopicosModule } from '../jornada-topicos/jornada-topicos.module'; // <-- ajuste o caminho se estiver diferente

@Module({
  imports: [JornadaTopicosModule], // <-- adicione isso aqui
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
