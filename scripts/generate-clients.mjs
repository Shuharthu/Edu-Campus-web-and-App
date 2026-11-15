import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const openApiPath = path.join(repoRoot, 'apps', 'api', 'openapi.json');
if (!fs.existsSync(openApiPath)) {
  console.error(`Missing ${openApiPath}. Run openapi:export first.`);
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));

function tsTypeFromSchema(schema, schemas) {
  if (!schema) return 'unknown';
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }
  if (schema.enum) {
    return schema.enum.map((v) => JSON.stringify(v)).join(' | ');
  }
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `Array<${tsTypeFromSchema(schema.items, schemas)}>`;
    case 'object':
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

function dartTypeFromSchema(schema) {
  if (!schema) return 'dynamic';
  if (schema.$ref) return schema.$ref.split('/').pop();
  switch (schema.type) {
    case 'string':
      return 'String';
    case 'integer':
      return 'int';
    case 'number':
      return 'double';
    case 'boolean':
      return 'bool';
    case 'array':
      return `List<${dartTypeFromSchema(schema.items)}>`;
    case 'object':
      return 'Map<String, dynamic>';
    default:
      return 'dynamic';
  }
}

function buildOperations(paths) {
  const ops = [];
  for (const [route, methods] of Object.entries(paths ?? {})) {
    for (const [method, meta] of Object.entries(methods)) {
      const lower = method.toLowerCase();
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(lower)) continue;
      const opId = meta.operationId || `${lower}_${route.replace(/[^a-zA-Z0-9]+/g, '_')}`;
      const cleanName = opId
        .replace(/Controller_/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
      const camel = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
      ops.push({
        method: lower.toUpperCase(),
        route,
        name: camel,
        summary: meta.summary || '',
        params: meta.parameters || [],
        requestBodyRef:
          meta.requestBody?.content?.['application/json']?.schema?.$ref?.split('/').pop() ?? null,
      });
    }
  }
  return ops;
}

export function generateClientOutputs() {
  const schemas = spec.components?.schemas ?? {};
  const ops = buildOperations(spec.paths);

  // 1. TypeScript Client
  const tsInterfaces = Object.entries(schemas)
    .map(([name, schema]) => {
      const required = new Set(schema.required ?? []);
      const props = Object.entries(schema.properties ?? {})
        .map(([prop, propSchema]) => {
          const opt = required.has(prop) ? '' : '?';
          return `  ${prop}${opt}: ${tsTypeFromSchema(propSchema, schemas)};`;
        })
        .join('\n');
      return `export interface ${name} {\n${props}\n}`;
    })
    .join('\n\n');

  const tsMethods = ops
    .map((op) => {
      const pathParams = op.params.filter((p) => p.in === 'path');
      const queryParams = op.params.filter((p) => p.in === 'query');
      const args = [];
      for (const p of pathParams) args.push(`${p.name}: string`);
      if (op.requestBodyRef) args.push(`body: ${op.requestBodyRef}`);
      if (queryParams.length > 0) args.push(`query?: Record<string, string | number | undefined>`);

      let urlExpr = `'${op.route}'`;
      for (const p of pathParams) {
        urlExpr = urlExpr.replace(`{${p.name}}`, `\${encodeURIComponent(${p.name})}`);
      }
      if (pathParams.length > 0) {
        urlExpr = '`' + urlExpr.slice(1, -1) + '`';
      }

      const qsLine =
        queryParams.length > 0
          ? `const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';\n    `
          : '';
      const finalUrl = queryParams.length > 0 ? `\`\${${urlExpr}}\${qs}\`` : urlExpr;
      const bodyArg = op.requestBodyRef ? ', body' : '';

      return `  async ${op.name}<T = unknown>(${args.join(', ')}): Promise<T> {\n    ${qsLine}return this.request<T>('${op.method}', ${finalUrl}${bodyArg});\n  }`;
    })
    .join('\n\n');

  const tsClient = `// AUTO-GENERATED FROM apps/api/openapi.json — DO NOT EDIT DIRECTLY
/* eslint-disable */

${tsInterfaces}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown,
  ) {
    super(message);
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class SmartEduApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const cleanPath = path.startsWith('/api/v1') ? path.slice(7) : path;
    const url = \`\${this.config.baseUrl.replace(/\\/$/, '')}\${cleanPath}\`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.config.getToken?.();
    if (token) {
      headers['Authorization'] = \`Bearer \${token}\`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const msg =
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message: unknown }).message)
          : \`Request failed with status \${res.status}\`;
      throw new ApiError(res.status, msg, data);
    }
    return data as T;
  }

${tsMethods}
}
`;

  // 2. Dart Client
  const dartModels = Object.entries(schemas)
    .map(([name, schema]) => {
      const required = new Set(schema.required ?? []);
      const props = Object.entries(schema.properties ?? {});
      const fields = props
        .map(([p, ps]) => {
          const dt = dartTypeFromSchema(ps);
          const nullable = required.has(p) ? '' : '?';
          return `  final ${dt}${nullable} ${p};`;
        })
        .join('\n');
      const ctorParams = props
        .map(([p]) => (required.has(p) ? `required this.${p},` : `this.${p},`))
        .join(' ');
      const toJson = props.map(([p]) => `'${p}': ${p},`).join(' ');
      return `class ${name} {\n${fields}\n  const ${name}({${ctorParams}});\n  Map<String, dynamic> toJson() => {${toJson}};\n}`;
    })
    .join('\n\n');

  const dartMethods = ops
    .map((op) => {
      const pathParams = op.params.filter((p) => p.in === 'path');
      const args = [];
      for (const p of pathParams) args.push(`String ${p.name}`);
      if (op.requestBodyRef) args.push(`${op.requestBodyRef} body`);
      let route = op.route.startsWith('/api/v1') ? op.route.slice(7) : op.route;
      for (const p of pathParams) {
        route = route.replace(`{${p.name}}`, `\${${p.name}}`);
      }
      const dataArg = op.requestBodyRef ? ', data: body.toJson()' : '';
      return `  Future<Response<dynamic>> ${op.name}(${args.join(', ')}) {\n    return _dio.request('${route}', options: Options(method: '${op.method}')${dataArg});\n  }`;
    })
    .join('\n\n');

  const dartClient = `// AUTO-GENERATED FROM apps/api/openapi.json — DO NOT EDIT DIRECTLY
import 'package:dio/dio.dart';

${dartModels}

class SmartEduDartApiClient {
  final Dio _dio;
  SmartEduDartApiClient(this._dio);

${dartMethods}
}
`;

  return {
    tsPath: path.join(repoRoot, 'packages', 'api-client', 'src', 'index.ts'),
    tsContent: tsClient,
    dartPath: path.join(repoRoot, 'packages', 'api-client-dart', 'lib', 'smart_edu_api_client.dart'),
    dartContent: dartClient,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const out = generateClientOutputs();
  fs.mkdirSync(path.dirname(out.tsPath), { recursive: true });
  fs.mkdirSync(path.dirname(out.dartPath), { recursive: true });
  fs.writeFileSync(out.tsPath, out.tsContent, 'utf8');
  fs.writeFileSync(out.dartPath, out.dartContent, 'utf8');
  console.log('Generated packages/api-client and packages/api-client-dart from openapi.json');
}
