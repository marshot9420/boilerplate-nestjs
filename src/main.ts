import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';

class Application {
  private logger = new Logger(Application.name);
  private HOST: string;
  private PORT: number;

  constructor(private app: INestApplication) {
    this.app = app;
    this.HOST = process.env.HOST;
    this.PORT = Number(process.env.PORT);
  }

  async bootstrap() {
    this.app = await NestFactory.create(AppModule);
    await this.app.listen(this.PORT);
  }

  startLog() {
    this.logger.log(`✅ Server on ${this.HOST}:${this.PORT}`);
  }
}

async function init() {
  const server = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const app = new Application(server);
  await app.bootstrap();
  app.startLog();
}

init();
