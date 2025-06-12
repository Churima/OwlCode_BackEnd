import { Module } from '@nestjs/common';
import { GptDuvidasService } from './gpt-duvidas.service';
import { GptDuvidasController } from './gpt-duvidas.controller';

@Module({
  controllers: [GptDuvidasController],
  providers: [GptDuvidasService],
})
export class GptDuvidasModule {}
