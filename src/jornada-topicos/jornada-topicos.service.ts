import { Injectable } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class JornadaTopicosService {
  async adicionarTopico(modulo_id: string, topico: any) {
    // Gera id automático com Firestore para evitar conflitos
    const novoDoc = db.collection('jornada_topicos').doc();

    // Campos no Firestore conforme sua estrutura
    await novoDoc.set({
      modulo_id,
      id: topico.id,
      titulo: topico.titulo,
      titulo2: topico.titulo2,
      detalhes: topico.detalhes,
      finalizado: topico.finalizado,
      anexos: topico.anexos || [],
      exemplos: topico.exemplos || [],
    });
  }
}
