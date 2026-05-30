# Damage Reports API - Guía de Pruebas en Postman

## Importar la Colección

1. Abre **Postman**
2. Click en **Import** (esquina superior izquierda)
3. Selecciona el archivo `postman-damage-reports-collection.json`
4. La colección se importará con todos los endpoints configurados

## Configurar Variables de Entorno

Antes de hacer las pruebas, debes configurar estas variables en Postman:

### Opción 1: Variables en la Colección

1. Abre la colección **Damage Reports API**
2. Vé a la pestaña **Variables**
3. Completa los valores:
   - **baseUrl**: `http://localhost:3000` (ajusta según tu servidor)
   - **token**: Tu token JWT válido (obtenlo autenticándote primero)
   - **vehicleId**: ID de un vehículo existente en tu BD

### Opción 2: Variables de Entorno Global

1. Click en **Environments** (engranaje arriba a la derecha)
2. Click en **Create**
3. Agrega las mismas variables

## Flujo de Pruebas Recomendado

### 1️⃣ **Autenticación Primero**

Si aún no tienes token, debes:

1. Usar el endpoint de login de **Auth** para obtener un token JWT
2. Copiar el token en la variable `token`

### 2️⃣ **Obtener ID de Vehículo**

Si no tienes un vehicleId:

1. Usa la colección de **Vehicles**
2. Crea un vehículo o lista los existentes
3. Copia el ID del vehículo a la variable `vehicleId`

### 3️⃣ **Crear Reporte de Daño**

**Endpoint**: `POST /damage-reports`

**Body (form-data)**:

```
vehicle_id: [ID del vehículo]
description: Daño frontal por colisión leve
damage_location: Bumper frontal y faro izquierdo
severity: moderate (opciones: minor, moderate, severe, total_loss)
damage_details: Grieta en el bumper delantero...
status: pending (opciones: pending, in_review, approved, rejected, completed)
estimated_cost: 1500.50
reported_by: Juan Pérez
photos: [selecciona archivos de imagen - opcional]
```

**Respuesta exitosa** (201):

```json
{
  "id": "uuid-del-reporte",
  "report_number": "DMG-1684929600000-a1b2c3d4",
  "vehicle_id": "uuid-vehículo",
  "tenant_id": "tu-tenant-id",
  "description": "Daño frontal por colisión leve",
  "damage_location": "Bumper frontal y faro izquierdo",
  "severity": "moderate",
  "status": "pending",
  "estimated_cost": "1500.50",
  "photos": ["https://storage.googleapis.com/..."],
  "reported_by": "Juan Pérez",
  "report_date": "2024-05-30T...",
  "createdAt": "2024-05-30T...",
  "updatedAt": "2024-05-30T..."
}
```

✅ **El reportId se guarda automáticamente en la variable `reportId`**

### 4️⃣ **Listar Todos los Reportes**

**Endpoint**: `GET /damage-reports`

Retorna lista de todos los reportes del tenant ordenados por fecha de creación descendente.

### 5️⃣ **Filtrar Reportes por Vehículo**

**Endpoint**: `GET /damage-reports/vehicle/{{vehicleId}}`

Retorna solo los reportes del vehículo especificado.

### 6️⃣ **Obtener Reporte Específico**

**Endpoint**: `GET /damage-reports/{{reportId}}`

Retorna un reporte con sus detalles completos.

### 7️⃣ **Actualizar Reporte**

**Endpoint**: `PATCH /damage-reports/{{reportId}}`

**Body (JSON)**:

```json
{
  "status": "in_review",
  "estimated_cost": 2000.75,
  "severity": "moderate",
  "damage_details": "Actualización..."
}
```

Campos actualizables: `description`, `damage_location`, `severity`, `status`, `estimated_cost`, `damage_details`, `reported_by`, `metadata`

### 8️⃣ **Agregar Fotos Adicionales**

**Endpoint**: `PATCH /damage-reports/{{reportId}}/photos`

**Body (form-data)**:

```
photos: [selecciona múltiples archivos de imagen]
```

Las fotos se agregan al array existente sin eliminar las anteriores.

### 9️⃣ **Eliminar Reporte**

**Endpoint**: `DELETE /damage-reports/{{reportId}}`

⚠️ Esta acción es irreversible.

## Campos de la Entidad

| Campo             | Tipo      | Requerido | Descripción                                               |
| ----------------- | --------- | --------- | --------------------------------------------------------- |
| `id`              | UUID      | ✅        | Generado automáticamente                                  |
| `tenant_id`       | string    | ✅        | Tomado del token JWT                                      |
| `vehicle_id`      | string    | ✅        | Debe existir en vehicles                                  |
| `report_number`   | string    | ❌        | Generado automáticamente si no se proporciona             |
| `description`     | text      | ❌        | Descripción general del daño                              |
| `damage_location` | string    | ❌        | Ubicación del daño en el vehículo                         |
| `severity`        | enum      | ❌        | minor \| moderate \| severe \| total_loss                 |
| `damage_details`  | text      | ❌        | Detalles técnicos de los daños                            |
| `status`          | enum      | ❌        | pending \| in_review \| approved \| rejected \| completed |
| `estimated_cost`  | decimal   | ❌        | Costo estimado de reparación                              |
| `reported_by`     | string    | ❌        | Nombre de quien reportó el daño                           |
| `report_date`     | timestamp | ✅        | Generada automáticamente                                  |
| `photos`          | jsonb[]   | ✅        | URLs de fotos en GCP                                      |
| `metadata`        | jsonb     | ❌        | Datos adicionales personalizados                          |
| `createdAt`       | timestamp | ✅        | Generada automáticamente                                  |
| `updatedAt`       | timestamp | ✅        | Generada automáticamente                                  |

## Estructura de Carpetas en GCP

Las fotos se suben a GCP en esta estructura:

```
damage-reports/
  └── {vehicleId}/
       └── {timestamp}-{nombre-archivo}
```

Ejemplo: `damage-reports/abc123def456/1684929600000-foto-frontal.jpg`

## Validaciones

- ✅ `vehicle_id` es obligatorio para crear un reporte
- ✅ El `tenant_id` se obtiene automáticamente del token JWT
- ✅ El `report_number` se genera automáticamente (formato: `DMG-{timestamp}-{uuid}`)
- ✅ Solo se pueden actualizar reportes del mismo tenant
- ✅ Las fotos deben ser archivos válidos (jpg, png, etc.)
- ✅ Máximo 10 fotos por carga (configurable en controller)

## Códigos de Respuesta

| Código  | Significado                                 |
| ------- | ------------------------------------------- |
| 200/201 | ✅ Éxito                                    |
| 400     | ❌ Bad Request (datos inválidos)            |
| 401     | ❌ Unauthorized (token inválido o expirado) |
| 404     | ❌ Not Found (reporte no encontrado)        |
| 500     | ❌ Error del servidor                       |

## Ejemplo de Workflow Completo

1. **POST** `/damage-reports` - Crear reporte con fotos iniciales
2. **GET** `/damage-reports/{{reportId}}` - Verificar que se creó correctamente
3. **PATCH** `/damage-reports/{{reportId}}` - Actualizar estado a "in_review"
4. **PATCH** `/damage-reports/{{reportId}}/photos` - Agregar fotos adicionales
5. **GET** `/damage-reports/vehicle/{{vehicleId}}` - Listar todos los reportes del vehículo
6. **DELETE** `/damage-reports/{{reportId}}` - Eliminar si es necesario

## Notas Importantes

⚠️ **Multi-tenancy**: Cada usuario solo ve los reportes de su tenant
⚠️ **Autenticación**: Todos los endpoints requieren token JWT válido
⚠️ **Almacenamiento**: Las fotos se suben a GCP automáticamente en cada creación/actualización
⚠️ **Relaciones**: Un reporte siempre debe estar vinculado a un vehículo existente
