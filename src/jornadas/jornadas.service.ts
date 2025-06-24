import { Injectable, NotFoundException } from '@nestjs/common';
import admin from '../firebase/firebase-admin';
import { CreateJornadaDto } from '../dto/create-jornada.dto';
import axios from 'axios';

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
          uid: jornadaId,
          uid_linguagem: langDoc.id,
          linguagem: {
            nome: langData.nome || null,
            cor: langData.cor || null,
            url: langData.url || null,
          },
          progresso_percent: data.progresso_percent || 0,
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

    topico.finalizado = !topico.finalizado;

    let totalTopicos = 0;
    let topicosConcluidos = 0;

    resposta.forEach((mod: any) => {
      mod.topicos.forEach((top: any) => {
        totalTopicos++;
        if (top.finalizado) topicosConcluidos++;
      });
    });

    const progresso_percent = totalTopicos > 0
      ? Math.round((topicosConcluidos / totalTopicos) * 100)
      : 0;

    await jornadaRef.update({
      resposta,
      progresso_percent
    });

    const topicosDoModulo = modulo.topicos.map((t: any) => ({
      topico_id: t.topico_id,
      finalizado: !!t.finalizado
    }));

    return {
      sucesso: true,
      mensagem: topico.finalizado
        ? 'Tópico marcado como concluído'
        : 'Tópico desmarcado como concluído',
      progresso_percent,
      topicos_status: {
        modulo_id: moduloId,
        topicos: topicosDoModulo
      }
    };
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

    const todosFinalizados = modulo.topicos.every((t: any) => t.finalizado === true);

    modulo.topicos.forEach((t: any) => {
      t.finalizado = !todosFinalizados;
    });

    let totalTopicos = 0;
    let topicosConcluidos = 0;

    resposta.forEach((mod: any) => {
      mod.topicos.forEach((top: any) => {
        totalTopicos++;
        if (top.finalizado) topicosConcluidos++;
      });
    });

    const progresso_percent = totalTopicos > 0
      ? Math.round((topicosConcluidos / totalTopicos) * 100)
      : 0;

    await jornadaRef.update({
      resposta,
      progresso_percent
    });

    const topicosDoModulo = modulo.topicos.map((t: any) => ({
      topico_id: t.topico_id,
      finalizado: !!t.finalizado
    }));

    return {
      sucesso: true,
      mensagem: todosFinalizados
        ? 'Todos os tópicos do módulo foram desmarcados como concluídos'
        : 'Todos os tópicos do módulo foram marcados como concluídos',
      progresso_percent,
      topicos_status: {
        modulo_id: moduloId,
        topicos: topicosDoModulo
      }
    };
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

  async criarJornada(userId: string, data: CreateJornadaDto, token: string) {
  const textoFormatado = this.montarTextoJornada(data);

  // Enviar texto para /gpt/perguntar (usando axios com cookies)
  const { data: respostaGerada } = await axios.post(
    'http://localhost:3000/gpt/perguntar',
    { pergunta: textoFormatado },
    {
      headers: {
        Cookie: `auth_token=${token}` 
      }
    }
  );

  const jornadaRef = this.db.collection('jornada_bruta').doc(); // cria doc com ID manual
const jornadaId = jornadaRef.id;

  await jornadaRef.set({
    jornada_id: jornadaId, // salva o ID no próprio documento
    user_id: userId,
    linguagem: respostaGerada.linguagem,
    resposta: respostaGerada.resposta,
    progresso_percent: 0,
    criado_em: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    sucesso: true,
    jornada_id: jornadaRef.id,
    mensagem: 'Jornada criada com sucesso',
    texto_gerado: textoFormatado // opcional, para debug
  };
}

  montarTextoJornada(data: CreateJornadaDto): string {
    return `Olá! Gostaria de compartilhar um pouco sobre minha situação atual e minhas expectativas em relação aos meus estudos de programação.
        Tenho interesse em aprender ${data.linguagem} e gostaria que meu plano de estudos fosse focado nessa linguagem.
        Atualmente, sinto que minhas maiores dificuldades são: ${data.dificuldades.join(', ')}.
        Em relação à minha disponibilidade, consigo dedicar aproximadamente ${data.disponibilidade} por semana aos estudos.
        Sobre meus estilos de aprendizagem, me identifico com: ${data.estilos_aprendizagem.join(', ')}, pois acredito que esses formatos me ajudam a absorver melhor o conteúdo.
        Minha experiência específica com a linguagem é de: ${data.experiencia_linguagem}.
        Falando sobre meu conhecimento em lógica de programação, atualmente me sinto confortável com: ${data.conhecimento_logica.join(', ')}.
        Tenho como meta de projeto ou desafio pessoal: ${data.meta_pessoal.join(', ')}.
        Meu nível geral de programação é: ${data.nivel_programacao}.
        Com a minha jornada de aprendizado, o que desejo alcançar é: ${data.objetivo_final}.
        ${data.complemento ? 'Gostaria de acrescentar: ' + data.complemento + '.' : ''}
        Gostaria que, a partir dessas informações, fosse elaborado um roadmap que me ajudasse a evoluir de forma prática e organizada, respeitando minhas preferências, dificuldades e objetivos.`;
  }
}
