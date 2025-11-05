import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envSchema } from './config/env.validation';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // или true для всех (небезопасно в продакшене)
    credentials: true, // если используете куки или авторизацию
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      // Безопасность
      whitelist: true,
      // forbidNonWhitelisted: true,
      forbidUnknownValues: true,

      // Обработка свойств
      skipMissingProperties: false,
      skipUndefinedProperties: false,
      skipNullProperties: false,

      // Преобразование
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
        exposeDefaultValues: true,
      },

      // Обработка ошибок
      // dismissDefaultMessages: false,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      validationError: {
        target: false,
        value: true,
      },

      // Дополнительно
      validateCustomDecorators: true,
      always: false,
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
