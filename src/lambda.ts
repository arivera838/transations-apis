import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (!cachedServer) {
    const expressApp = express();

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    nestApp.setGlobalPrefix('api/v1');

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    nestApp.useGlobalFilters(new HttpExceptionFilter());
    nestApp.useGlobalInterceptors(new ResponseInterceptor());

    nestApp.enableCors();

    await nestApp.init();

    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
