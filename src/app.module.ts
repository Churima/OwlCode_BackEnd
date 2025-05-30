import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { LinguagensModule } from './linguagens/linguagens.module';
import { ConfigModule } from '@nestjs/config';
import { JornadasModule } from './jornadas/jornadas.module';
import { ConteudoJornadaModule } from './conteudo-jornada/conteudo-jornada.module';

@Module({
  imports: [
    GptModule, 
    LinguagensModule, 
    JornadasModule,
    ConteudoJornadaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
