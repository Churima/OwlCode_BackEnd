// src/jornadas/jornadas.service.ts
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
    // 1. Buscar o documento de jornada do usuário
    const q = this.db
      .collection('jornadas')
      .where('user_id', '==', userUid)
      .limit(1);
    const snap = await q.get();

    if (snap.empty) {
      throw new NotFoundException('Nenhuma jornada encontrada para este usuário');
    }

    const jornadaDoc = snap.docs[0];
    const jornadaData = jornadaDoc.data();
    const linguagensJornada: JornadaLangEntry[] = jornadaData.linguagens || [];

    if (linguagensJornada.length === 0) {
      return []; // Nenhuma linguagem associada
    }

    // 2. Carregar todos os dados das linguagens em lote (batch)
    const langRefs = linguagensJornada.map((l) =>
      this.db.collection('linguagens').doc(l.uid)
    );
    const langSnaps = await this.db.getAll(...langRefs);

    // 3. Mesclar progresso com dados da linguagem
    const resultado = linguagensJornada.map((entry) => {
      const langSnap = langSnaps.find((s) => s.id === entry.uid);
      const langData = langSnap?.data();

      if (!langData) {
        return null; // ignora linguagens que não existem
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

    return resultado.filter(Boolean); // remove nulos
  }

  async adicionarJornada(jornada: { titulo: string; detalhes: string }) {
  const jornadasRef = this.db.collection('jornadas');
  const snapshot = await jornadasRef.get();

  let maxId = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.id > maxId) maxId = data.id;
  });

  const novoId = maxId + 1;

  await jornadasRef.doc(novoId.toString()).set({
    id: novoId,
    titulo: jornada.titulo,
    detalhes: jornada.detalhes,
  });

  return novoId;
}
}
