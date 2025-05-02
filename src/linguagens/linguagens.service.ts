import { Injectable } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class LinguagensService {
  async getAllLinguagens() {
    const snapshot = await db.collection('linguagens').get();
    const linguagens = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        linguagem: {
          cor: data.cor,
          nome: data.nome,
          url: data.url,
        },
        progresso_percent: data.progresso_percent,
      };
    });

    return linguagens;
  }
}
