import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuração global do Multer para uploads de até 12MB
  app.use((req, res, next) => {
    res.setHeader('Content-Length', '12582912'); // 12MB em bytes
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Bitbook API')
    .setDescription('API para o sistema Bitbook')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: "Content-Type, Authorization, X-Requested-With, Accept",
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.APP_PORT || 3000;
  const php = process.env.PHPMYADMIN_PORT || 8081;
  await app.listen(port, '0.0.0.0');

  console.log('\x1b[32m%s\x1b[0m', '🚀 Servidor iniciado com sucesso!');
  console.log('\x1b[36m%s\x1b[0m', `📡 Servidor rodando em: http://localhost:${port}`);
  console.log('\x1b[35m%s\x1b[0m', `📖 Documentação disponível em: http://localhost:${php}`);
  console.log('\x1b[33m%s\x1b[0m', `📚 Documentação Swagger disponível em: http://localhost:${port}/api`);
  console.log('\x1b[35m%s\x1b[0m', `📖 Documentação disponível em: http://localhost:${port}/summary`);
}

bootstrap(); 