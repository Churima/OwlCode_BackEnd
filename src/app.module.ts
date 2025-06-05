import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { LinguagensModule } from './linguagens/linguagens.module';
import { JornadasModule } from './jornadas/jornadas.module';
import { ConfigModule } from '@nestjs/config';
import { JornadaModulosModule } from './jornada-modulos/jornada-modulos.module';
import { JornadaTopicosModule } from './jornada-topicos/jornada-topicos.module';

@Module({
  imports: [
    GptModule,
    LinguagensModule,
    JornadasModule,
    JornadaModulosModule,  // <-- aqui
    JornadaTopicosModule,  // <-- aqui
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
