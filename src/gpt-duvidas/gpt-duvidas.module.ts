import { Module } from '@nestjs/common';
import { GptDuvidasController } from './gpt-duvidas.controller';
import { GptDuvidasService } from './gpt-duvidas.service';

@Module({
  controllers: [GptDuvidasController],
  providers: [GptDuvidasService],
})
export class GptDuvidasModule {}
