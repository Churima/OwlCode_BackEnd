import { Module } from '@nestjs/common';
import { JornadasController } from './jornadas.controller';
import { JornadasService } from './jornadas.service';

@Module({
  controllers: [JornadasController],
  providers: [JornadasService],
  exports: [JornadasService]
})
export class JornadasModule {}