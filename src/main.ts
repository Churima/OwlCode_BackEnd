// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotenv.config(); // Garante que as variáveis de ambiente sejam carregadas cedo.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // <--- Adiciona o cookie-parser para ler cookies nas requisições

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
