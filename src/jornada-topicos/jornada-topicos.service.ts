// src/jornada-topicos/jornada-topicos.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class JornadaTopicosService {
  async adicionarTopico(idJornada: string, topico: any) {
    const topicosRef = db
      .collection('jornadas')
      .doc(idJornada)
      .collection('topicos');

    await topicosRef.doc(topico.id.toString()).set(topico);
  }
}
