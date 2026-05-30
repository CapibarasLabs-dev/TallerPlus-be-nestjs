# Damage Reports - Referencia Visual & Estructura

## 🏗️ Estructura de Carpetas

```
src/modules/damage-reports/
│
├── 📄 damage-reports.controller.ts     (7 endpoints HTTP)
├── 📄 damage-reports.service.ts        (Lógica + GCP upload)
├── 📄 damage-reports.module.ts         (Inyección de dependencias)
│
└── 📁 entities/
    └── 📄 damage-report.entity.ts      (ORM: TypeORM)
```

## 📡 API Endpoints Mapa

```
/damage-reports
│
├── POST /
│   ├── Body: form-data (vehicle_id, description, ..., photos)
│   ├── Upload: Fotos → GCP
│   └── Response: DamageReport (201)
│
├── GET /
│   ├── Query: ninguno (filtra por tenant)
│   └── Response: DamageReport[] (200)
│
├── GET /vehicle/:vehicleId
│   ├── Query: ninguno (filtra por vehicleId + tenant)
│   └── Response: DamageReport[] (200)
│
├── GET /:id
│   ├── Response: DamageReport completo (200)
│   └── Error: 404 si no existe
│
├── PATCH /:id
│   ├── Body: JSON (campos parciales)
│   ├── Campos actualizables: todos excepto id
│   └── Response: DamageReport actualizado (200)
│
├── PATCH /:id/photos
│   ├── Body: form-data (photos)
│   ├── Upload: Fotos → GCP
│   ├── Operación: Append (agregar a array existente)
│   └── Response: DamageReport con fotos nuevas (200)
│
└── DELETE /:id
    ├── Operación: Hard delete
    └── Response: DamageReport eliminado (200)
```

## 🏛️ Flujo de Datos

```
                    HTTP Request
                        ↓
                   Controller
                        ↓
            ┌───────────────────────┐
            │   Service Layer       │
            ├───────────────────────┤
            │                       │
            │  1. Validaciones      │
            │  2. GCP Bucket Upload │
            │  3. Repository Ops    │
            │                       │
            └───────────────────────┘
                 ↙        ↓        ↖
          GCP Bucket  PostgreSQL  typeorm
              (photos)  (data)
```

## 🗄️ Entidad - Campos Completos

```
DamageReport
│
├── 🔑 PRIMARY KEY
│   └── id: UUID
│
├── 👥 MULTI-TENANCY
│   └── tenant_id: string (del JWT)
│
├── 🚗 RELACIONES
│   ├── vehicle_id: string (FK → Vehicle)
│   └── vehicle: Vehicle (relación ManyToOne)
│
├── 📋 IDENTIFICACIÓN
│   └── report_number: string (generado automáticamente)
│
├── 📝 DESCRIPCIÓN
│   ├── description: text
│   ├── damage_location: string
│   ├── damage_details: text
│   └── reported_by: string
│
├── 🚨 CLASIFICACIÓN
│   ├── severity: enum (minor | moderate | severe | total_loss)
│   └── status: enum (pending | in_review | approved | rejected | completed)
│
├── 💰 COSTO
│   └── estimated_cost: decimal(10,2)
│
├── 📸 ALMACENAMIENTO
│   └── photos: jsonb[] (URLs de GCP)
│
├── ⚙️ METADATA
│   └── metadata: jsonb (datos personalizados)
│
└── ⏰ TIMESTAMPS
    ├── report_date: timestamp (generado automáticamente)
    ├── createdAt: timestamp (generado automáticamente)
    └── updatedAt: timestamp (generado automáticamente)
```

## 🔄 Ciclo de Vida del Reporte

```
                    ┌──────────────┐
                    │ CREAR REPORTE│
                    │  (POST /)    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   PENDING    │◄─── Status inicial
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  IN_REVIEW   │◄─── Inspector revisa
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌─────▼──────┐  ┌────▼─────┐  ┌───▼──────┐
      │  APPROVED  │  │ REJECTED │  │ COMPLETED│
      │ Autorizado │  │ Negado   │  │ Finalizado
      └─────┬──────┘  └──────────┘  └───────────┘
            │
      ┌─────▼──────────────────────────────┐
      │  (Opcional) Agregar más fotos      │
      │  PATCH /:id/photos                 │
      └────────────────────────────────────┘
```

## 📸 Flujo de Subida de Fotos

```
REQUEST
  ├─ Fotos (multipart/form-data)
  │
  ├─ GCP Bucket Upload
  │  ├─ Autenticación: service_account
  │  ├─ Bucket: GCP_VEHICLES_BUCKET
  │  ├─ Path: damage-reports/{vehicleId}/{timestamp}-{filename}
  │  ├─ ContentType: file.mimetype
  │  └─ Result: https://storage.googleapis.com/...
  │
  ├─ Database Save
  │  └─ photos: [URL1, URL2, ...]
  │
  └─ RESPONSE
     └─ DamageReport con fotos guardadas
```

## 🔐 Seguridad & Multi-Tenancy

```
Request → JWT Token
  │
  ├─ @UseGuards(JwtAuthGuard)    ✅ Validar token válido
  ├─ @UseGuards(TenantGuard)      ✅ Validar tenant
  │
  └─ Service Layer
     ├─ where: { tenant_id: req.tenantId } ✅ Filtrar por tenant
     └─ Verificar que recurso pertenece al tenant actual
```

## 🧪 Casos de Prueba Esenciales

```
✅ Happy Path
   └─ POST → GET → PATCH → PATCH (fotos) → DELETE

✅ Validaciones
   └─ Sin vehicle_id → 400
   └─ Sin token → 401
   └─ ID inexistente → 404

✅ Fotos
   └─ Crear con fotos → Verificar URLs en GCP
   └─ Agregar fotos → Verificar append (no reemplazar)

✅ Estados
   └─ pending → in_review → approved → completed

✅ Severidad
   └─ minor, moderate, severe, total_loss

✅ Multi-Tenancy
   └─ User A no puede ver reportes de User B
   └─ Todos los reportes filtrados por tenant_id
```

## 🔌 Integraciones

```
┌─────────────────────────────────────────┐
│   Damage Reports Service               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐ │
│  │   PostgreSQL │    │  GCP Bucket  │ │
│  │              │    │              │ │
│  │ - Reportes   │    │ - Fotos      │ │
│  │ - Metadata   │    │ - URLs       │ │
│  └──────────────┘    └──────────────┘ │
│         ▲                   ▲          │
│         │                   │          │
│         └───────┬───────────┘          │
│                 │                      │
│          Service Methods               │
│                                        │
└─────────────────────────────────────────┘
         ▲
         │
    Controller
    (7 endpoints)
```

## 📊 Relaciones de Entidades

```
Company (tenant)
    │
    └─ many: DamageReport
         │
         ├─ Relation: ManyToOne
         ├─ Field: company: Company
         └─ FK: tenant_id

Vehicle
    │
    ├─ many: DamageReport
    │  ├─ Relation: ManyToOne
    │  ├─ Field: vehicle: Vehicle
    │  ├─ FK: vehicle_id
    │  └─ Cascade: DELETE
    │
    └─ [photos, documents, metadata]
       (equipos similares al DamageReport)

DamageReport
    │
    ├─ ManyToOne: Company
    └─ ManyToOne: Vehicle (con CASCADE)
```

## 🎯 Características Clave

| Característica        | Descripción                                       |
| --------------------- | ------------------------------------------------- |
| **Upload Automático** | Fotos se suben a GCP en cada creación             |
| **Append Fotos**      | Agregar fotos sin reemplazar las existentes       |
| **Report Number**     | Generado automáticamente `DMG-{timestamp}-{uuid}` |
| **Multi-Tenancy**     | Filtrado automático por tenant desde JWT          |
| **Relaciones**        | Vinculado a Vehicle con CASCADE delete            |
| **Severidad**         | 4 niveles: minor, moderate, severe, total_loss    |
| **Estados**           | 5 estados en ciclo de vida                        |
| **Metadata**          | Campo JSON flexible para datos personalizados     |
| **Timestamps**        | createdAt, updatedAt, report_date automáticos     |

## 🚨 Errores Esperados

```
❌ 400 Bad Request
   ├─ vehicle_id is required
   ├─ No photos provided
   └─ Failed to upload photos: {error}

❌ 401 Unauthorized
   ├─ Token inválido
   └─ Token expirado

❌ 404 Not Found
   └─ Damage report not found

❌ 500 Internal Server Error
   └─ GCP connection issues
```

---

## 📚 Referencias Rápidas

- **Entidad**: [damage-report.entity.ts](./src/modules/damage-reports/entities/damage-report.entity.ts)
- **Controlador**: [damage-reports.controller.ts](./src/modules/damage-reports/damage-reports.controller.ts)
- **Servicio**: [damage-reports.service.ts](./src/modules/damage-reports/damage-reports.service.ts)
- **Módulo**: [damage-reports.module.ts](./src/modules/damage-reports/damage-reports.module.ts)
- **Postman**: [postman-damage-reports-collection.json](./postman-damage-reports-collection.json)
