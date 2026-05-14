import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // --- Swagger Configuration Starts Here ---
  const config = new DocumentBuilder()
    .setTitle('Ticket Booking System')
    .setDescription('API documentation for the movie and event ticketing app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // This builds the actual document based on the config above
  const document = SwaggerModule.createDocument(app, config);

  // This sets up the webpage at localhost:3000/api
  SwaggerModule.setup('/api', app, document);
  // --- Swagger Configuration Ends Here ---

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
