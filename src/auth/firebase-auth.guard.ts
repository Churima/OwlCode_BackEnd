// src/auth/firebase-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import admin from '../firebase/firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['cookie'];

    if (!authHeader || !authHeader.startsWith('auth_token=')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split('auth_token=')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req['user'] = { uid: decodedToken.uid, email: decodedToken.email }; // Aqui você salva apenas o necessário
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
