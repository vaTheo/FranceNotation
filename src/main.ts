import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { RootModule } from './server/root/root.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';


//Nest server management
async function bootstrap() {
  try {
    const app = await NestFactory.create(RootModule);
    app.enableCors(); // Enables CORS for all origins
    app.use(cookieParser());
    app.useGlobalPipes(// use to validate types on HTTP requests
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => new BadRequestException(errors),
      }),
    );
    const port = 3000;
    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}`); // Log when the server starts
  } catch (error) {
    console.error('Error during Nest application startup', error); // Log if there's an error
  }
}
bootstrap();
