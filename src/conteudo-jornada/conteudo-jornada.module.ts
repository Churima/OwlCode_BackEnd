import { Module } from '@nestjs/common';
import { ConteudoJornadaService } from './conteudo-jornada.service';
import { ConteudoJornadaController } from './conteudo-jornada.controller';

@Module({
  controllers: [ConteudoJornadaController],
  providers: [ConteudoJornadaService]
})
export class ConteudoJornadaModule {}