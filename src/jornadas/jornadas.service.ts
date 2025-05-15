import { Injectable, NotFoundException } from '@nestjs/common';
import admin from '../firebase/firebase-admin';

interface JornadaLangEntry {
  uid: string;
  progresso_percent: number;
}

@Injectable()
export class JornadasService {
  private db = admin.firestore();

  async getJornadasByUserId(userUid: string) {
    const q = this.db.collection('jornadas').where('user_id', '==', userUid);
    const snap = await q.get();

    if (snap.empty) {
      throw new NotFoundException('Nenhuma jornada encontrada para este usuário');
    }

    const linguagensTotais: JornadaLangEntry[] = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      
      const linguagens = data.linguagens || [];
      linguagensTotais.push(...linguagens);
    }

    if (linguagensTotais.length === 0) {
      return [];
    }

    console.log('Total de linguagens encontradas:', linguagensTotais.length);

    // Se quiser permitir linguagens repetidas, mantenha esse array como está:
    const linguagensUsar = linguagensTotais;

    // Buscar os dados das linguagens no Firestore
    const langRefs = linguagensUsar.map((l) =>
      this.db.collection('linguagens').doc(l.uid)
    );
    const langSnaps = await this.db.getAll(...langRefs);

    const resultado = linguagensUsar.map((entry) => {
      const langSnap = langSnaps.find((s) => s.id === entry.uid);
      const langData = langSnap?.data();

      if (!langData) {
        console.warn(`Linguagem com UID ${entry.uid} não encontrada no Firestore.`);
        return null;
      }

      return {
        uid: entry.uid,
        linguagem: {
          nome: langData.nome || null,
          cor: langData.cor || null,
          url: langData.url || null,
        },
        progresso_percent: entry.progresso_percent,
      };
    });

    return resultado.filter(Boolean);
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

    /*
    await jornadasRef.doc(novoId.toString()).set({
      id: novoId,
      titulo: jornada.titulo,
      detalhes: jornada.detalhes,
    });
    */

    return novoId;
  }
}