import { Injectable, NotFoundException } from '@nestjs/common';
import admin from '../firebase/firebase-admin';

@Injectable()
export class ConteudoJornadaService {
  private db = admin.firestore();

  async getConteudoJornada(userUid: string) {
    // 1. Buscar a jornada do usuário
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

    // Assumimos que o usuário só possui uma jornada ativa
    const linguagensJornada = jornadaData.linguagens || [];

    if (linguagensJornada.length === 0) {
      throw new NotFoundException('Nenhuma linguagem associada à jornada');
    }

    const result = await Promise.all(
      linguagensJornada.map(async (entry) => {
        // Buscar dados da linguagem
        const langSnap = await this.db.collection('linguagens').doc(entry.uid).get();
        const langData = langSnap.data();

        if (!langData) {
          return null;
        }

        // Buscar roadmap relacionado
        const roadmapSnap = await this.db
          .collection('modulos')
          .where('linguagem_uid', '==', entry.uid)
          .get();

        const roadmap = roadmapSnap.docs.map((doc) => ({
          uid: doc.id,
          title: doc.data().title,
          concluido: false,  // Por padrão, ou se tiver um campo você pode ajustar
          subtopicos: []     // Subtópicos ainda não implementado
        }));

        return {
          uid: entry.uid,
          jornada: {
            linguagem: {
              cor: langData.cor || null,
              nome: langData.nome || null,
              url: langData.url || null
            },
            progresso_percent: entry.progresso_percent
          },
          roadmap
        };
      })
    );

    return result.filter(Boolean); // remove nulos
  }
}