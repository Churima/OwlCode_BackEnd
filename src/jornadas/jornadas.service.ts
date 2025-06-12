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
      const sigla = data.linguagem;
      linguagensTotais.push({
        sigla,
        progresso_percent: 0,
      });
    }

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