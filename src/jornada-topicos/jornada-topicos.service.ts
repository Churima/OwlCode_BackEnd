// src/jornada-topicos/jornada-topicos.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class JornadaTopicosService {
  async adicionarTopico(idJornada: string, topico: any) {
  const topicosRef = db
    .collection('jornada_topicos')
    .where('idJornada', '==', idJornada);

  const snapshot = await topicosRef.get();

  let maxId = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.id > maxId) {
      maxId = data.id;
    }
  });

  const novoId = maxId + 1;

  await db
    .collection('jornada_topicos')
    .doc(novoId.toString())
    .set({
      ...topico,
      idJornada,
      id: novoId,
    });
}

}
