import { Injectable } from '@nestjs/common';
import { db } from '../firebase/firebase-admin';

@Injectable()
export class JornadaModulosService {
  async adicionarModuloComTopicos(modulo: any) {
    const { ID, titulo, detalhes, topicos } = modulo;

    if (!ID || !titulo || !detalhes) {
      console.warn('❌ Módulo inválido recebido:', modulo);
      return;
    }

    const moduloRef = db.collection('jornada_modulos').doc(ID.toString());

    // Grava o módulo
    await moduloRef.set({
      id: ID,
      titulo,
      detalhes,
    });

    console.log(`✅ Módulo gravado: ${ID} - ${titulo}`);

    // Grava os tópicos como subcoleção do módulo
    if (Array.isArray(topicos)) {
      const topicosRef = moduloRef.collection('topicos');

      for (const topico of topicos) {
        const { id, titulo, titulo2, detalhes, anexos, exemplos, finalizado } = topico;

        await topicosRef.doc(id.toString()).set({
          id,
          titulo,
          titulo2,
          detalhes,
          anexos: anexos || [],
          exemplos: exemplos || [],
          finalizado: finalizado ?? false,
        });

        console.log(`✅ Tópico gravado: ${id} - ${titulo}`);
      }
    }
  }
}
