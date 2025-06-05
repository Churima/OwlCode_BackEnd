import { Module, forwardRef } from '@nestjs/common';
import { JornadaTopicosService } from './jornada-topicos.service';
import { JornadaModulosModule } from '../jornada-modulos/jornada-modulos.module';

@Module({
  imports: [forwardRef(() => JornadaModulosModule)],
  providers: [JornadaTopicosService],
  exports: [JornadaTopicosService],
})
export class JornadaTopicosModule {}
