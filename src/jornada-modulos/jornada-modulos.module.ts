import { Module, forwardRef } from '@nestjs/common';
import { JornadaModulosService } from './jornada-modulos.service';
import { JornadaModulosController } from './jornada-modulos.controller';
import { JornadaTopicosModule } from '../jornada-topicos/jornada-topicos.module';

@Module({
  imports: [forwardRef(() => JornadaTopicosModule)],
  controllers: [JornadaModulosController],
  providers: [JornadaModulosService],
})
export class JornadaModulosModule {}
