import { Controller, Get, UseGuards } from '@nestjs/common';
import { LinguagensService } from './linguagens.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('linguagens')
export class LinguagensController {
  constructor(private readonly linguagensService: LinguagensService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getAll() {
    return this.linguagensService.getAllLinguagens();
  }
}