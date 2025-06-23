import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { LinguagensModule } from './linguagens/linguagens.module';
import { JornadasModule } from './jornadas/jornadas.module';
import { ConteudoJornadaModule } from './conteudo-jornada/conteudo-jornada.module';
import { ConfigModule } from '@nestjs/config';
import { JornadaModulosModule } from './jornada-modulos/jornada-modulos.module';
import { JornadaTopicosModule } from './jornada-topicos/jornada-topicos.module';
import { ExercicioModule } from './exercicio/exercicio.module';
import { GptDuvidasModule } from './gpt-duvidas/gpt-duvidas.module';

@Module({
  imports: [
    GptModule,
    LinguagensModule,
    JornadasModule,
    ConteudoJornadaModule,
    JornadaModulosModule,
    JornadaTopicosModule, 
    ExercicioModule,
    GptDuvidasModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
