import { Injectable, NotFoundException } from '@nestjs/common';
import admin from '../firebase/firebase-admin';

@Injectable()
export class ConteudoJornadaService {
  private db = admin.firestore();

  async getConteudoJornadaPorId(userUid: string, jornadaId: string) {
  const jornadaRef = this.db.collection('jornada_bruta').doc(jornadaId);
  const jornadaSnap = await jornadaRef.get();

  if (!jornadaSnap.exists) {
    throw new NotFoundException('Jornada não encontrada');
  }

  const jornadaData = jornadaSnap.data() as FirebaseFirestore.DocumentData;

  // Valida se pertence ao usuário autenticado
  if (jornadaData.user_id !== userUid) {
    throw new NotFoundException('Jornada não pertence ao usuário');
  }

  const linguagemSigla = jornadaData.linguagem;
  const resposta = jornadaData.resposta;

  // Busca os dados da linguagem
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

  const roadmap = resposta.map((modulo: any) => ({
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
      progresso_percent: 0 // calcular depois se quiser
    },
    roadmap
  };
}

}