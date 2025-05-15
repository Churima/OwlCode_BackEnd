import { Injectable } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class LinguagensService {
  async getAllLinguagens() {
    const snapshot = await db.collection('linguagens').get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        nome: data.nome,
        cor: data.cor,
        url: data.url,
      };
    });
  }
}