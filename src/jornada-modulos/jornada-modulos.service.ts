import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';
import { JornadaTopicosService } from '../jornada-topicos/jornada-topicos.service';

@Injectable()
export class JornadaModulosService {
  constructor(
    @Inject(forwardRef(() => JornadaTopicosService))
    private readonly jornadaTopicosService: JornadaTopicosService,
  ) {}

  async adicionarModuloComTopicos(modulo: any) {
    const { ID, titulo, detalhes, topicos } = modulo;

    // Salva módulo
    await db.collection('jornada_modulos').doc(ID.toString()).set({
      id: ID,
      titulo,
      detalhes,
    });

    // Salva os tópicos vinculados ao módulo
    if (Array.isArray(topicos)) {
      for (const topico of topicos) {
        await this.jornadaTopicosService.adicionarTopico(ID.toString(), topico);
      }
    }
  }
}
