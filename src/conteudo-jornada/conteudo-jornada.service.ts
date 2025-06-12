import { Injectable, NotFoundException } from '@nestjs/common';
import admin from '../firebase/firebase-admin';

@Injectable()
export class ConteudoJornadaService {
  private db = admin.firestore();

  async getConteudoJornada(userUid: string) {
  // 1. Buscar jornada_bruta (dados da IA com resposta completa)
  const snap = await this.db
    .collection('jornada_bruta')
    .where('user_id', '==', userUid)
    .limit(1)
    .get();

  if (snap.empty) {
    throw new NotFoundException('Nenhuma jornada encontrada para este usuário');
  }

  const jornadaDoc = snap.docs[0];
  const jornadaData = jornadaDoc.data();

  const linguagemSigla = jornadaData.linguagem;
  const resposta = jornadaData.resposta;

  // 2. Buscar dados da linguagem correspondente
  const linguagemSnap = await this.db
    .collection('linguagens')
    .where('sigla', '==', linguagemSigla)
    .limit(1)
    .get();

  if (linguagemSnap.empty) {
    throw new NotFoundException('Linguagem não encontrada');
  }

  const linguagemDoc = linguagemSnap.docs[0];
  const linguagemData = linguagemDoc.data();

  // 3. Transformar os módulos e tópicos no formato esperado pelo frontend
  const roadmap = resposta.map((modulo: any, moduloIndex: number) => ({
    uid: `roadmap-${modulo.modulo_id}`,
    title: modulo.modulo_titulo,
    concluido: modulo.topicos.every((t: any) => t.finalizado),
    subtopicos: modulo.topicos.map((topico: any) => ({
      title: topico.topico_titulo,
      concluido: topico.finalizado,
      conteudo: {
        topico: topico.topico_subtitulo,
        detalhes: topico.topico_detalhes,
        anexos: topico.anexos || [],
        exemplos: (topico.exemplos || []).map((ex: any) => ({
          titulo: ex.titulo_exemplo,
          codigo: ex.codigo
        }))
      }
    }))
  }));

  return {
    uid: linguagemDoc.id,
    jornada: {
      linguagem: {
        cor: linguagemData.cor || null,
        nome: linguagemData.nome || null,
        url: linguagemData.url || null
      },
      progresso_percent: 0 // pode ajustar se quiser calcular progresso real
    },
    roadmap
  };
}

}