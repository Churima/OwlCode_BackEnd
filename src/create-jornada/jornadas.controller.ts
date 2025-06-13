import { Body, Controller, Post } from '@nestjs/common';
import { CreateJornadaDto } from '../dto/create-jornada.dto';
import { JornadasService } from '../jornadas/jornadas.service';

@Controller()
export class JornadasController {
  constructor(private readonly jornadasService: JornadasService) {}

  @Post('criarJornada')
  async criarJornada(@Body() body: CreateJornadaDto) {
    const textoMontado = this.jornadasService.montarTextoJornada(body);
    return { texto: textoMontado };
  }
}