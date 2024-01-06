import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';

import {
  CustomLoggerService,
  HttpExceptionFilter,
  SuccessInterceptor,
} from '@/common';
import { corsConfig, swaggerConfig } from '@/configs';
import { API_URL, APP, CONFIG } from '@/constants';

import { AppModule } from './app.module';

class Application {
  private logger = new Logger(Application.name);
  private HOST: string;
  private PORT: number;
  private DB_HOST: string;
  private DB_PORT: number;
  private DEV_MODE: boolean;

  constructor(private app: NestExpressApplication) {
    this.app = app;
    this.HOST = process.env.HOST;
    this.PORT = Number(process.env.PORT);
    this.DB_HOST = process.env.DB_HOST;
    this.DB_PORT = Number(process.env.DB_PORT);
    this.DEV_MODE = process.env.NODE_ENV === CONFIG.NODE_ENV.DEVELOPMENT;
  }

  private async setUpOpenAPI() {
    const document = SwaggerModule.createDocument(this.app, swaggerConfig);
    SwaggerModule.setup(
      `${APP.GLOBAL_PREFIX}${API_URL.SWAGGER.DOCS}`,
      this.app,
      document,
    );
  }

  private async setUpGlobalMiddleware() {
    this.app.enableCors(corsConfig(this.DEV_MODE));
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // Request로 넘어온 데이터 형변환
        whitelist: true, // Request에서 Validation 데코레이터가 붙어있지 않은 속성 제거
        forbidNonWhitelisted: true, // Whitelist 조건에 맞지 않는 속성이 있으면 400 에러 (Bad Request)
      }),
    );

    this.app.useGlobalInterceptors(new SuccessInterceptor());
    this.app.useGlobalFilters(new HttpExceptionFilter());

    this.setUpOpenAPI();
    this.app.use(cookieParser(process.env.COOKIE_SECRET));
  }

  dbConnectionLog(dataSource: DataSource) {
    try {
      if (dataSource.isInitialized) {
        this.logger.log(
          `✅ 데이터베이스 연결: ${dataSource.options.database} 🚀`,
        );
        this.logger.log(
          `✅ 데이터베이스 호스트: ${this.DB_HOST}:${this.DB_PORT}`,
        );
      } else {
        this.logger.error('❌ 데이터베이스 연결 실패');
      }
    } catch (error) {
      this.logger.error('❌ 데이터베이스 연결에 문제가 발생했습니다: ', error);
    }
  }

  async bootstrap() {
    this.app.setGlobalPrefix(APP.GLOBAL_PREFIX);
    await this.setUpGlobalMiddleware();
    await this.app.listen(this.PORT);
  }

  startLog() {
    this.logger.log(`✅ 서버 수신중: ${this.HOST}:${this.PORT} 🚀`);
  }
}

async function init() {
  const server = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: CustomLoggerService,
    bufferLogs: true,
  });

  const dataSource = server.get(DataSource);
  const app = new Application(server);
  await app.bootstrap();

  app.dbConnectionLog(dataSource);
  app.startLog();
}

init();
