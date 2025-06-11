import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('perguntar')
  async perguntar(@Body('pergunta') pergunta: string, @Req() req) {
    const userId = req.user.uid; // ✅ Pegamos o ID do usuário autenticado
    return this.gptService.perguntar(pergunta, userId);
  }
}