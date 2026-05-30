# Ejemplos de cURL - Damage Reports API

## Variables de Ejemplo

```bash
BASE_URL="http://localhost:3000"
TOKEN="tu-jwt-token-aqui"
VEHICLE_ID="uuid-del-vehiculo"
REPORT_ID="uuid-del-reporte"
```

## 1. Crear Reporte de Daño (con fotos)

### Con una foto:

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "vehicle_id=${VEHICLE_ID}" \
  -F "description=Daño frontal por colisión" \
  -F "damage_location=Bumper frontal y faro izquierdo" \
  -F "severity=moderate" \
  -F "damage_details=Grieta en bumper, faro roto, pintura raspada" \
  -F "status=pending" \
  -F "estimated_cost=1500.50" \
  -F "reported_by=Juan Pérez" \
  -F "photos=@/ruta/a/foto1.jpg"
```

### Con múltiples fotos:

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "vehicle_id=${VEHICLE_ID}" \
  -F "description=Daño lateral severo" \
  -F "damage_location=Costado derecho completo" \
  -F "severity=severe" \
  -F "damage_details=Deformación de la carrocería, puertas dañadas" \
  -F "status=pending" \
  -F "estimated_cost=5000.00" \
  -F "reported_by=María García" \
  -F "photos=@/ruta/a/foto1.jpg" \
  -F "photos=@/ruta/a/foto2.jpg" \
  -F "photos=@/ruta/a/foto3.jpg"
```

### Sin fotos inicialmente:

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "'${VEHICLE_ID}'",
    "description": "Daño de granizo en techo",
    "damage_location": "Techo completo",
    "severity": "moderate",
    "damage_details": "Múltiples abolladuras en toda la superficie del techo",
    "status": "pending",
    "estimated_cost": 2500.00,
    "reported_by": "Carlos López"
  }'
```

## 2. Listar Todos los Reportes

```bash
curl -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Guardar respuesta en archivo:

```bash
curl -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" | jq . > reportes.json
```

## 3. Obtener Reportes por Vehículo

```bash
curl -X GET "${BASE_URL}/damage-reports/vehicle/${VEHICLE_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

## 4. Obtener Reporte Específico

```bash
curl -X GET "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Con formatos bonitos:

```bash
curl -X GET "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq .
```

## 5. Actualizar Reporte

### Cambiar estado:

```bash
curl -X PATCH "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_review"
  }'
```

### Actualización completa:

```bash
curl -X PATCH "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "estimated_cost": 2000.75,
    "damage_details": "Actualización después de revisión técnica",
    "severity": "moderate"
  }'
```

### Rechazar reporte:

```bash
curl -X PATCH "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "damage_details": "Rechazado: Daño no cubre póliza de seguro"
  }'
```

## 6. Agregar Fotos Adicionales

### Una foto:

```bash
curl -X PATCH "${BASE_URL}/damage-reports/${REPORT_ID}/photos" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "photos=@/ruta/a/foto-adicional.jpg"
```

### Múltiples fotos:

```bash
curl -X PATCH "${BASE_URL}/damage-reports/${REPORT_ID}/photos" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "photos=@/ruta/a/foto1.jpg" \
  -F "photos=@/ruta/a/foto2.jpg" \
  -F "photos=@/ruta/a/foto3.jpg"
```

## 7. Eliminar Reporte

```bash
curl -X DELETE "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Con confirmación:

```bash
curl -X DELETE "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -v
```

## Script de Prueba Completa

Crea un archivo `test-damage-reports.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN="tu-jwt-token"
VEHICLE_ID="abc123def456"

echo "🔧 Testing Damage Reports API"
echo "=============================="

# 1. Crear reporte
echo -e "\n1️⃣ Creando reporte..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "vehicle_id=${VEHICLE_ID}" \
  -F "description=Daño de prueba" \
  -F "damage_location=Frente" \
  -F "severity=minor" \
  -F "status=pending" \
  -F "estimated_cost=500.00" \
  -F "reported_by=Test User")

REPORT_ID=$(echo $RESPONSE | jq -r '.id')
echo "✅ Reporte creado con ID: $REPORT_ID"

# 2. Obtener reporte
echo -e "\n2️⃣ Obteniendo reporte..."
curl -s -X GET "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# 3. Actualizar reporte
echo -e "\n3️⃣ Actualizando reporte..."
curl -s -X PATCH "${BASE_URL}/damage-reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_review","estimated_cost":750.00}' | jq .

# 4. Listar todos
echo -e "\n4️⃣ Listando todos los reportes..."
curl -s -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.[] | {id: .id, report_number: .report_number, status: .status}'

# 5. Listar por vehículo
echo -e "\n5️⃣ Reportes del vehículo ${VEHICLE_ID}..."
curl -s -X GET "${BASE_URL}/damage-reports/vehicle/${VEHICLE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.[] | {id: .id, severity: .severity, status: .status}'

echo -e "\n✅ Pruebas completadas"
```

Ejecutar:

```bash
chmod +x test-damage-reports.sh
./test-damage-reports.sh
```

## Casos de Prueba por Severidad

### Daño Menor

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "'${VEHICLE_ID}'",
    "description": "Rayón en la pintura",
    "damage_location": "Panel lateral",
    "severity": "minor",
    "estimated_cost": 250.00,
    "reported_by": "Cliente"
  }'
```

### Daño Moderado

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "'${VEHICLE_ID}'",
    "description": "Colisión frontal leve",
    "damage_location": "Bumper frontal",
    "severity": "moderate",
    "estimated_cost": 1500.00,
    "reported_by": "Agente de Seguros"
  }'
```

### Daño Severo

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "'${VEHICLE_ID}'",
    "description": "Vuelco del vehículo",
    "damage_location": "Estructura completa",
    "severity": "severe",
    "estimated_cost": 8500.00,
    "reported_by": "Inspector"
  }'
```

### Pérdida Total

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "'${VEHICLE_ID}'",
    "description": "Incendio total",
    "damage_location": "Todo el vehículo",
    "severity": "total_loss",
    "estimated_cost": 25000.00,
    "reported_by": "Peritos"
  }'
```

## Códigos de Error Esperados

### 400 - Bad Request (vehicle_id faltante)

```bash
curl -X POST "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"description": "Sin vehicle_id"}'
# Respuesta: 400 - "vehicle_id is required"
```

### 401 - Unauthorized (token inválido)

```bash
curl -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer token-invalido"
```

### 404 - Not Found (reporte inexistente)

```bash
curl -X GET "${BASE_URL}/damage-reports/id-inexistente" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Notas para Debugging

Ver headers de respuesta:

```bash
curl -i -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}"
```

Ver detalles completos incluyendo timing:

```bash
curl -w "@curl-format.txt" -o /dev/null -s \
  -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}"
```

Guardar las cookies (si aplica):

```bash
curl -c cookies.txt -b cookies.txt \
  -X GET "${BASE_URL}/damage-reports" \
  -H "Authorization: Bearer ${TOKEN}"
```
