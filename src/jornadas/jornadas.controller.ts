import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { JornadasService } from './jornadas.service';

@Controller('jornadas')
export class JornadasController {
  constructor(private readonly jornadasService: JornadasService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getJornadas(@Req() req) {
    const userId = req.user.uid;
    const jornadas = await this.jornadasService.getJornadasByUserId(userId);
    return jornadas;
  }
}
