import { Module } from '@nestjs/common';
import { LinguagensController } from './linguagens.controller';
import { LinguagensService } from './linguagens.service';

@Module({
  controllers: [LinguagensController],
  providers: [LinguagensService],
})
export class LinguagensModule {}
