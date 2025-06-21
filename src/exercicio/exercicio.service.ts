import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { SYSTEM_EXERCICIO } from './SYSTEM_EXERCICIO';
import { SYSTEM_CORRECAO } from './SYSTEM_CORRECAO';
import { db } from '../firebase/firebase-admin';
import { CreateExercicioDto } from '../dto/create-exercicio.dto';
import { CorrigirExercicioDto } from '../dto/corrigir-exercicio.dto';

@Injectable()
export class ExercicioService {
  private readonly openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
  private readonly firestore = db;

  async gerarExercicio(dto: CreateExercicioDto, userId: string) {
    const jornadaSnap = await this.firestore.collection('jornada_bruta').doc(dto.jornada_id).get();
    const jornadaData = jornadaSnap.data();

    if (!jornadaData || jornadaData.user_id !== userId) {
      throw new NotFoundException('Jornada não encontrada ou não pertence ao usuário');
    }

    const modulo = jornadaData.resposta.find((m: any) => m.modulo_id === dto.modulo_id);
    if (!modulo) throw new NotFoundException('Módulo não encontrado');

    const topico = modulo.topicos.find((t: any) => t.topico_id === dto.topico_id);
    if (!topico) throw new NotFoundException('Tópico não encontrado');

    const linguagem = jornadaData.linguagem?.toLowerCase() ?? 'desconhecida';

    // Verifica se já existe exercício salvo
    const exercicioDoc = await this.firestore
      .collection('exercicios_gerados')
      .doc(`${dto.jornada_id}_${dto.modulo_id}_${dto.topico_id}`)
      .get();

    if (exercicioDoc.exists) {
      const data = exercicioDoc.data();
      return {
        status: 'ok',
        linguagem,
        exercicio_id: exercicioDoc.id,
        exercicio_gerado: data?.exercicio,
        dica: topico.topico_detalhes || null,
        reutilizado: true
      };
    }

    const promptUsuario = `
    Gere um exercício prático sobre o tópico: "${topico.topico_titulo}"
    Descrição detalhada: ${topico.topico_detalhes}
    Linguagem: ${linguagem}
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: SYSTEM_EXERCICIO },
        { role: 'user', content: promptUsuario }
      ],
      temperature: 0.7
    });

    const content = response.choices?.[0]?.message?.content ?? '';

    const docRef = this.firestore
    .collection('exercicios_gerados')
    .doc(`${dto.jornada_id}_${dto.modulo_id}_${dto.topico_id}`);

    await docRef.set({
    jornada_id: dto.jornada_id,
    modulo_id: dto.modulo_id,
    topico_id: dto.topico_id,
    user_id: userId,
    linguagem,
    exercicio: content,
    criado_em: new Date().toISOString()
    });

    return {
    status: 'ok',
    linguagem,
    exercicio_id: exercicioDoc.id,
    exercicio_gerado: content,
    dica: topico.topico_detalhes || null,
    reutilizado: false
    };
  }

  async corrigirExercicio(dto: CorrigirExercicioDto, userId: string) {
  let docSnap;
  if (dto.exercicio_id) {
    docSnap = await this.firestore.collection('exercicios_gerados').doc(dto.exercicio_id).get();
    if (!docSnap.exists) throw new NotFoundException('Exercício não encontrado');
  } else {
    const query = this.firestore.collection('exercicios_gerados')
      .where('user_id', '==', userId)
      .where('jornada_id', '==', dto.jornada_id)
      .where('modulo_id', '==', dto.modulo_id)
      .where('topico_id', '==', dto.topico_id)
      .limit(1);

    const querySnap = await query.get();
    if (querySnap.empty) throw new NotFoundException('Exercício não encontrado');
    docSnap = querySnap.docs[0];
  }

    const exercicio = docSnap.data();

    const respostaLimpa = dto.resposta_usuario?.trim();
    const promptUsuario = !respostaLimpa
        ? "O usuário não respondeu ao exercício."
        : `Exercício: ${exercicio.exercicio.descricao}
        Código do usuário:\n${respostaLimpa}
        Linguagem: ${exercicio.linguagem}
        Tópico: ${exercicio.titulo_topico}
        Detalhes: ${exercicio.topico_detalhes}
        Avalie o código do usuário com base nisso.`;    

    const respostaIA = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
        { role: 'system', content: SYSTEM_CORRECAO },
        { role: 'user', content: promptUsuario }
        ],
        temperature: 0.7
    });

    const conteudo = respostaIA.choices?.[0]?.message?.content ?? '';
    let jsonCorrecao: any;

    try {
    jsonCorrecao = JSON.parse(conteudo);
    } catch (e) {
    // Em caso de erro, ainda retorna algo amigável
    return {
        status: 'erro',
        mensagem: 'A resposta da IA não pôde ser interpretada como JSON.',
        resposta_bruta: conteudo
    };
    }

    return {
    status: 'ok',
    correcao: jsonCorrecao
    };
    }
}