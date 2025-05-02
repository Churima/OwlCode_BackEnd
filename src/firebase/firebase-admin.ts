// src/firebase/firebase-admin.ts
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config(); // carrega o .env

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

export const db = admin.firestore();
export default admin;