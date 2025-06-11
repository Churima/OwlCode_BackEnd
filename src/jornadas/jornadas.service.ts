import { Injectable, NotFoundException } from '@nestjs/common';
import admin from '../firebase/firebase-admin';

@Injectable()
export class JornadasService {
  private db = admin.firestore();

  async getJornadasByUserId(userUid: string) {
    const q = this.db.collection('jornada_bruta').where('user_id', '==', userUid);
    const snap = await q.get();

    if (snap.empty) {
      throw new NotFoundException('Nenhuma jornada encontrada para este usuário');
    }

    const linguagensTotais: { sigla: string; progresso_percent: number }[] = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      const sigla = data.linguagem; // agora usamos a "sigla", não o UID do doc
      linguagensTotais.push({
        sigla,
        progresso_percent: 0, // fixo por enquanto
      });
    }

    // Buscar documentos da coleção 'linguagens' por sigla
    const langDocsPromises = linguagensTotais.map(async (entry) => {
      const q = await this.db
        .collection('linguagens')
        .where('sigla', '==', entry.sigla)
        .limit(1)
        .get();

      if (q.empty) {
        console.warn(`Linguagem com sigla ${entry.sigla} não encontrada no Firestore.`);
        return null;
      }

      const langDoc = q.docs[0];
      const langData = langDoc.data();

      return {
        uid: langDoc.id,
        linguagem: {
          nome: langData.nome || null,
          cor: langData.cor || null,
          url: langData.url || null,
        },
        progresso_percent: entry.progresso_percent,
      };
    });

    const resultados = await Promise.all(langDocsPromises);
    return resultados.filter(Boolean);
  }

  async adicionarJornada(jornada: { titulo: string; detalhes: string }) {
    const jornadasRef = this.db.collection('jornadas');
    const snapshot = await jornadasRef.get();

    let maxId = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.id > maxId) maxId = data.id;
    });

    const novoId = maxId + 1;

    return novoId;
  }
}