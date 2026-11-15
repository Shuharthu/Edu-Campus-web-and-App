import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { buildOpenApiDocument } from '../src/openapi.setup';

async function exportOpenApi() {
  loadRootEnv();
  // Ensure required env vars exist for metadata extraction even without DB boot
  process.env.DATABASE_URL ??= 'postgresql://smartedu:smartedu_dev_pw@localhost:5433/smartedu';
  process.env.JWT_ACCESS_SECRET ??= 'openapi_export_placeholder_access_secret_32chars';
  process.env.JWT_REFRESH_SECRET ??= 'openapi_export_placeholder_refresh_secret_32chars';
  process.env.MFA_ENCRYPTION_KEY ??=
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  process.env.ENABLE_LOCAL_NO_REDIS_DEV ??= 'true';
  process.env.OPENAPI_EXPORT_ONLY = 'true';

  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  const document = buildOpenApiDocument(app);

  const outPath = path.resolve(process.cwd(), 'openapi.json');
  fs.writeFileSync(outPath, JSON.stringify(document, null, 2) + '\n', 'utf8');
  console.log(`Exported OpenAPI spec to ${outPath}`);
  await app.close();
}

exportOpenApi()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
