import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sainthr API')
    .setDescription('API documentation for the Sainthr backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`API is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
