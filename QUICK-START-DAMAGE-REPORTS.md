# 🚀 Quick Start - Damage Reports API

## 📋 Resumen Rápido

Tu nuevo servicio **Damage Reports** está listo para usar. Aquí hay lo esencial:

### Archivos Creados

```
src/modules/damage-reports/
├── damage-reports.controller.ts    # 7 endpoints
├── damage-reports.module.ts        # Módulo NestJS
├── damage-reports.service.ts       # Lógica + subida a GCP
└── entities/
    └── damage-report.entity.ts     # Entidad con 14 campos
```

### Archivos de Documentación & Testing

```
root/
├── postman-damage-reports-collection.json    # Importar en Postman
├── POSTMAN-GUIDE-DAMAGE-REPORTS.md           # Guía detallada
├── CURL-EXAMPLES-DAMAGE-REPORTS.md           # Ejemplos con curl
└── RESPONSE-EXAMPLES-DAMAGE-REPORTS.json     # Respuestas esperadas
```

## 🔑 Configuración Básica

1. **Variables necesarias en Postman:**

   ```
   baseUrl: http://localhost:3000
   token: [Tu JWT token]
   vehicleId: [ID del vehículo]
   reportId: [Se auto-genera después de crear]
   ```

2. **Asegúrate que el módulo esté cargado:**
   - ✅ Ya está en `app.module.ts`

3. **Variables de entorno esperadas** (deberían estar ya en tu `.env`):
   ```
   GCP_PROJECT_ID=tu-proyecto
   GCP_PRIVATE_KEY_ID=clave
   GCP_PRIVATE_KEY=...
   GCP_CLIENT_EMAIL=...
   GCP_CLIENT_ID=...
   GCP_VEHICLES_BUCKET=tu-bucket
   ```

## 📱 Los 7 Endpoints

| #   | Método     | Endpoint                             | Descripción           |
| --- | ---------- | ------------------------------------ | --------------------- |
| 1   | **POST**   | `/damage-reports`                    | Crear reporte + fotos |
| 2   | **GET**    | `/damage-reports`                    | Listar todos          |
| 3   | **GET**    | `/damage-reports/vehicle/:vehicleId` | Listar por vehículo   |
| 4   | **GET**    | `/damage-reports/:id`                | Obtener uno           |
| 5   | **PATCH**  | `/damage-reports/:id`                | Actualizar            |
| 6   | **PATCH**  | `/damage-reports/:id/photos`         | Agregar fotos         |
| 7   | **DELETE** | `/damage-reports/:id`                | Eliminar              |

## ✅ Prueba Rápida en 3 Pasos

### Paso 1: Importar en Postman

```
1. Abre Postman
2. Import → postman-damage-reports-collection.json
3. Done ✅
```

### Paso 2: Configurar Variables

```
1. Abre la colección
2. Pestaña "Variables"
3. Completa:
   - baseUrl: http://localhost:3000
   - token: [Tu JWT]
   - vehicleId: [UUID de vehículo]
```

### Paso 3: Ejecutar Requests

```
1. POST /damage-reports → Crear reporte
2. GET /damage-reports → Ver todos
3. DELETE /damage-reports/{id} → Eliminar
```

## 📤 Crear Reporte (Ejemplo)

**POST** `/damage-reports`

```json
{
  "vehicle_id": "abc123",
  "description": "Daño frontal",
  "damage_location": "Bumper frontal",
  "severity": "moderate",
  "estimated_cost": 1500.5,
  "reported_by": "Juan Pérez"
}
```

**Respuesta (201)**:

```json
{
  "id": "uuid-generado",
  "report_number": "DMG-1717073400000-a1b2c3d4",
  "status": "pending",
  "photos": ["https://storage.googleapis.com/..."],
  ...
}
```

## 🖼️ Subir Fotos

### Opción A: Con el reporte (POST)

```
form-data:
  vehicle_id: abc123
  description: ...
  photos: [selecciona archivos]  ← Suben automáticamente
```

### Opción B: Agregar después (PATCH)

```
PATCH /damage-reports/{id}/photos
form-data:
  photos: [selecciona archivos]
```

## 📊 Estados Permitidos

```
pending      → Pendiente de revisión
in_review    → En revisión técnica
approved     → Aprobado
rejected     → Rechazado
completed    → Completado
```

## ⚠️ Severidad Permitida

```
minor        → Rayones, daños cosméticos (< $500)
moderate     → Daños moderados ($500 - $3000)
severe       → Daños graves ($3000 - $15000)
total_loss   → Pérdida total (> $15000)
```

## 🐛 Troubleshooting

### "vehicle_id is required"

→ Asegúrate de enviar `vehicle_id` en la solicitud

### "Damage report not found"

→ El `reportId` no existe o pertenece a otro tenant

### "Unauthorized"

→ El token JWT es inválido o expirado

### Las fotos no se suben

→ Verifica que tu GCP bucket y credenciales estén bien configurados

### "No photos provided"

→ Al hacer PATCH a `/photos`, debes adjuntar al menos un archivo

## 📝 Ejemplo Completo con cURL

```bash
# 1. Crear reporte
REPORT=$(curl -X POST http://localhost:3000/damage-reports \
  -H "Authorization: Bearer $TOKEN" \
  -F "vehicle_id=$VEHICLE_ID" \
  -F "description=Daño frontal" \
  -F "severity=moderate" \
  -F "photos=@foto.jpg")

REPORT_ID=$(echo $REPORT | jq -r '.id')

# 2. Verificar
curl -X GET http://localhost:3000/damage-reports/$REPORT_ID \
  -H "Authorization: Bearer $TOKEN"

# 3. Actualizar
curl -X PATCH http://localhost:3000/damage-reports/$REPORT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_review"}'

# 4. Agregar fotos
curl -X PATCH http://localhost:3000/damage-reports/$REPORT_ID/photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photos=@foto2.jpg"
```

## 🧪 Pruebas Automatizadas

Ver archivo: `CURL-EXAMPLES-DAMAGE-REPORTS.md`

Hay un script bash completo que prueba todo el flujo.

## 📚 Documentación Completa

| Archivo                                 | Contenido                            |
| --------------------------------------- | ------------------------------------ |
| `POSTMAN-GUIDE-DAMAGE-REPORTS.md`       | Guía paso a paso para Postman        |
| `CURL-EXAMPLES-DAMAGE-REPORTS.md`       | Ejemplos de cURL y script de pruebas |
| `RESPONSE-EXAMPLES-DAMAGE-REPORTS.json` | Respuestas esperadas y escenarios    |

## 🎯 Checklist

- [ ] Importar `postman-damage-reports-collection.json`
- [ ] Configurar `baseUrl`, `token`, `vehicleId`
- [ ] Probar POST `/damage-reports`
- [ ] Probar GET `/damage-reports`
- [ ] Probar PATCH `/damage-reports/{id}`
- [ ] Probar PATCH `/damage-reports/{id}/photos`
- [ ] Probar DELETE `/damage-reports/{id}`
- [ ] Verificar fotos en GCP bucket

## 🚀 Próximos Pasos

1. **Escribir tests** - Agregar `damage-reports.spec.ts`
2. **Validaciones** - Crear DTOs con `class-validator`
3. **Permisos** - Agregar roles específicos
4. **Notificaciones** - Alertas cuando cambia status
5. **Reportes** - Analytics de daños por tipo/severidad

---

**¿Dudas?** Revisa `POSTMAN-GUIDE-DAMAGE-REPORTS.md` para más detalles.
