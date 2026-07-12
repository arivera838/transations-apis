# Transaction API

API REST para registro de transacciones construida con **NestJS**, **arquitectura hexagonal (Clean Architecture)** y desplegada como **AWS Lambda** vía **Serverless Framework**.

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **NestJS** | Framework backend (Node.js) |
| **TypeScript** | Lenguaje con tipado estricto |
| **AWS DynamoDB** | Base de datos NoSQL |
| **AWS Lambda** | Compute serverless |
| **API Gateway** | Exposición HTTP del Lambda |
| **Serverless Framework** | Despliegue e infraestructura como código |
| **esbuild** | Bundling optimizado para Lambda |

---

## 📐 Arquitectura

```
src/
├── domain/          → Entidades, enums, puertos (interfaces). Sin dependencias externas.
├── application/     → Casos de uso, DTOs de entrada/salida.
├── infrastructure/  → Adaptadores DynamoDB, configuración AWS, migraciones.
├── presentation/    → Controllers (API REST).
└── shared/          → Filters, interceptors (utilidades transversales).
```

**Principio clave:** El dominio no conoce la infraestructura. Las dependencias apuntan hacia adentro (Domain ← Application ← Infrastructure/Presentation).

---

## 📋 Requisitos Previos

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Credenciales AWS** con permisos para:
  - Lambda, API Gateway, DynamoDB
  - IAM, CloudFormation, S3, CloudWatch Logs

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd transaction-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales AWS
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
AWS_ACCESS_KEY_ID=tu-access-key-id
AWS_SECRET_ACCESS_KEY=tu-secret-access-key
AWS_REGION=us-east-1
DYNAMODB_TABLE_TRANSACTIONS=Transactions
PORT=3000
```

---

## 🗄️ Migraciones DynamoDB

### Crear tabla manualmente (desarrollo local)

```bash
npx ts-node migrations/run-migrations.ts
```

### Crear productos seeders

```bash
npx ts-node migrations/seed-products.ts
```

Este script:
- Verifica si la tabla `Transactions` ya existe
- Si no existe, la crea con:
  - Partition Key: `id` (String)
  - GSI: `accountId-createdAt-index` (para consultas por cuenta)
  - Billing Mode: PAY_PER_REQUEST (On-Demand)

### Creación automática (despliegue con Serverless)

> Al ejecutar `npx serverless deploy`, la tabla se crea **automáticamente** vía CloudFormation (definida en la sección `resources` del `serverless.yml`). No necesitas ejecutar la migración manual.

---

## 💻 Ejecución Local

### Modo desarrollo (NestJS standalone)

```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3000/api/v1`

### Con Serverless Offline (emula Lambda + API Gateway)

```bash
npx serverless offline
```

La API estará disponible en: `http://localhost:3000/dev/api/v1`

---

## ☁️ Despliegue a AWS Lambda

### 1. Configurar credenciales AWS

```bash
export AWS_ACCESS_KEY_ID=tu-access-key-id
export AWS_SECRET_ACCESS_KEY=tu-secret-access-key
```

O configura el perfil AWS CLI:

```bash
aws configure
```

### 2. Desplegar en stage `dev`

```bash
npx serverless deploy --stage dev
```

**Output esperado:**

```
Service Information
service: transaction-api
stage: dev
region: us-east-1
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  api: transaction-api-dev-api
```

### 3. Desplegar en producción

```bash
npx serverless deploy --stage prod
```

### 4. Ver logs en tiempo real

```bash
npx serverless logs -f api --stage dev --tail
```

### 5. Información del stack desplegado

```bash
npx serverless info --stage dev
```

### 6. Eliminar stack completo

```bash
npx serverless remove --stage dev
```

> ⚠️ **Esto elimina Lambda, API Gateway, la tabla DynamoDB y todos los datos.**

---

## 📖 Documentación API (Swagger)

La API cuenta con documentación interactiva generada con **Swagger** (OpenAPI). 

### Acceso Local

Cuando ejecutas la aplicación localmente (ya sea con NestJS standalone o con Serverless Offline), puedes acceder a la interfaz de Swagger en tu navegador:

- **Standalone (`npm run start:dev`)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Serverless Offline (`npx serverless offline`)**: [http://localhost:3000/dev/api/docs](http://localhost:3000/dev/api/docs)

Desde esta interfaz podrás ver todos los endpoints disponibles, los esquemas de petición y respuesta (con los campos requeridos y opcionales), y probar la API directamente.

---

## 📡 Endpoints

### `POST /api/v1/transactions`

Registra una nueva transacción.

**Request:**

```bash
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC-001",
    "type": "CREDIT",
    "amount": 150.50,
    "currency": "USD",
    "description": "Depósito inicial"
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "accountId": "ACC-001",
    "type": "CREDIT",
    "amount": 150.50,
    "currency": "USD",
    "description": "Depósito inicial",
    "status": "PENDING",
    "createdAt": "2026-07-10T20:00:00.000Z",
    "updatedAt": "2026-07-10T20:00:00.000Z"
  },
  "timestamp": "2026-07-10T20:00:00.000Z"
}
```

**Campos del body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `accountId` | string | ✅ | Identificador de la cuenta |
| `type` | string | ✅ | `CREDIT` o `DEBIT` |
| `amount` | number | ✅ | Monto > 0 |
| `currency` | string | ✅ | Código ISO 3 letras (ej: `USD`, `COP`) |
| `description` | string | ❌ | Descripción de la transacción |

**Respuesta de error (400 Bad Request):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": [
    "amount must be greater than 0",
    "currency must be a 3-letter ISO code (e.g., USD, COP)"
  ],
  "timestamp": "2026-07-10T20:00:00.000Z"
}
```

---

## 🧪 Scripts Disponibles

```bash
npm run start:dev      # Desarrollo local con hot-reload
npm run build          # Compilar TypeScript
npm run start:prod     # Ejecutar build compilado
npm run lint           # Linter
npm run test           # Tests unitarios
```

---

## 📝 Licencia

MIT
