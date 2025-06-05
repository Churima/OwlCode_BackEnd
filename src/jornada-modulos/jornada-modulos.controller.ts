import { Controller, Post, Body } from '@nestjs/common';
import { JornadaModulosService } from './jornada-modulos.service';

@Controller('jornada-modulos')
export class JornadaModulosController {
  constructor(private readonly jornadaModulosService: JornadaModulosService) {}

  @Post()
  async criarModuloComTopicos(@Body() moduloDto: any) {
    await this.jornadaModulosService.adicionarModuloComTopicos(moduloDto);
    return { mensagem: 'Módulo e tópicos adicionados com sucesso' };
  }
}
