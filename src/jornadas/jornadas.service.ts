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

  const jornadaDocs = snap.docs;

  const resultados = await Promise.all(
    jornadaDocs.map(async (doc) => {
      const data = doc.data();
      const sigla = data.linguagem;
      const jornadaId = doc.id;

      // Busca a linguagem pela sigla
      const langSnap = await this.db
        .collection('linguagens')
        .where('sigla', '==', sigla)
        .limit(1)
        .get();

      if (langSnap.empty) {
        console.warn(`Linguagem com sigla ${sigla} não encontrada no Firestore.`);
        return null;
      }

      const langDoc = langSnap.docs[0];
      const langData = langDoc.data();

      return {
        uid: jornadaId, // <- agora é o UID da jornada
        uid_linguagem: langDoc.id, // <- novo campo
        linguagem: {
          nome: langData.nome || null,
          cor: langData.cor || null,
          url: langData.url || null,
        },
        progresso_percent: 0,
      };
    })
  );

  return resultados.filter(Boolean);
}

  async marcarTopicoComoConcluido(userId: string, jornadaId: string, moduloId: number, topicoId: number) {
  const jornadaRef = this.db.collection('jornada_bruta').doc(jornadaId);
  const jornadaDoc = await jornadaRef.get();

  if (!jornadaDoc.exists) {
    throw new NotFoundException('Jornada não encontrada');
  }

  const jornada = jornadaDoc.data();
  if (!jornada || jornada.user_id !== userId) {
    throw new NotFoundException('Jornada não pertence a este usuário');
  }

  const resposta = jornada.resposta;

  const modulo = resposta.find((m: any) => m.modulo_id === moduloId);
  if (!modulo) {
    throw new NotFoundException('Módulo não encontrado');
  }

  const topico = modulo.topicos.find((t: any) => t.topico_id === topicoId);
  if (!topico) {
    throw new NotFoundException('Tópico não encontrado');
  }

  topico.finalizado = true;

  await jornadaRef.update({ resposta });

  return { sucesso: true, mensagem: 'Tópico marcado como concluído' };
}

  async marcarModuloComoConcluido(userId: string, jornadaId: string, moduloId: number) {
  const jornadaRef = this.db.collection('jornada_bruta').doc(jornadaId);
  const jornadaDoc = await jornadaRef.get();

  if (!jornadaDoc.exists) {
    throw new NotFoundException('Jornada não encontrada');
  }

  const jornada = jornadaDoc.data();
  if (!jornada || jornada.user_id !== userId) {
    throw new NotFoundException('Jornada não pertence a este usuário');
  }

  const resposta = jornada.resposta;

  const modulo = resposta.find((m: any) => m.modulo_id === moduloId);
  if (!modulo) {
    throw new NotFoundException('Módulo não encontrado');
  }

  modulo.topicos.forEach((topico: any) => {
    topico.finalizado = true;
  });

  await jornadaRef.update({ resposta });

  return { sucesso: true, mensagem: 'Todos os tópicos do módulo foram marcados como concluídos' };
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