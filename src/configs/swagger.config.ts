import { DocumentBuilder } from '@nestjs/swagger';

import { APP } from '@/constants';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('[애플리케이션 이름] - API')
  .setDescription('[애플리케이션 이름] API 문서')
  .setVersion(APP.VERSION)
  .build();
