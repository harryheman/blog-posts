import { NestFactory } from '@nestjs/core';
// swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  // swagger
  const config = new DocumentBuilder()
    .setTitle('Title')
    .setDescription('Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
