# 🍽️ Order Service - Servicio de Gestión de Pedidos

Microservicio para la gestión de pedidos en la plataforma FoodShare. Permite crear, consultar, actualizar y cancelar pedidos de restaurantes.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [API Endpoints](#api-endpoints)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Eventos RabbitMQ](#eventos-rabbitmq)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## ✨ Características

- ✅ **CRUD completo de pedidos**
- ✅ **Estados de pedido:** nuevo → en_preparacion → listo → entregado → cancelado
- ✅ **Validación con Restaurant Service** antes de crear pedidos
- ✅ **Cálculo automático de totales**
- ✅ **Eventos RabbitMQ** para notificaciones asíncronas
- ✅ **Base de datos PostgreSQL** con Sequelize ORM
- ✅ **Health checks** para monitoreo

---

## 🛠️ Tecnologías

- **Node.js** v18+
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM
- **RabbitMQ** - Mensajería asíncrona
- **Docker** - Containerización

---

## 🚀 Instalación y Ejecución

### **Opción 1: Con Docker Compose (Recomendado)**

```bash
# Desde la raíz del proyecto
docker-compose up --build

# El servicio estará disponible en:
# http://localhost:3002
```

### **Opción 2: Local (Desarrollo)**

```bash
# Navegar a la carpeta del servicio
cd apps/order-service

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
# PORT=3002
# DB_HOST=localhost
# DB_NAME=order_db
# DB_USER=postgres
# DB_PASSWORD=postgres
# RABBITMQ_URL=amqp://localhost:5672

# Ejecutar en modo desarrollo
npm run dev

# O en producción
npm start
```

---

## 📡 API Endpoints

### **Base URL:** `http://localhost:3002`

### **1. Health Check**

Verifica que el servicio esté funcionando.

```http
GET /health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "service": "order-service",
  "version": "1.0.0",
  "uptime": 123.45,
  "database": "connected",
  "timestamp": "2025-12-19T00:00:00.000Z"
}
```

---

### **2. Crear Pedido**

Crea un nuevo pedido.

```http
POST /api/orders
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "restaurantId": 1,
  "items": [
    {
      "productId": "abc-123",
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 15.99
    }
  ],
  "customerName": "Juan Pérez",
  "customerPhone": "+57 300 123 4567",
  "deliveryAddress": "Calle 10 #5-20, Cali"
}
```

**Campos requeridos:**
- `restaurantId` (integer) - ID del restaurante
- `items` (array) - Lista de productos (mínimo 1)
  - `productId` (string) - ID del producto
  - `name` (string) - Nombre del producto
  - `quantity` (number) - Cantidad
  - `price` (number) - Precio unitario
- `customerName` (string) - Nombre del cliente
- `customerPhone` (string) - Teléfono del cliente

**Campos opcionales:**
- `userId` (integer) - ID del usuario registrado
- `deliveryAddress` (string) - Dirección de entrega
- `notes` (string) - Notas adicionales

**Respuesta exitosa (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "restaurantId": 1,
    "userId": null,
    "status": "nuevo",
    "items": [
      {
        "productId": "abc-123",
        "name": "Pizza Margherita",
        "quantity": 2,
        "price": 15.99
      }
    ],
    "totalAmount": "31.98",
    "deliveryAddress": "Calle 10 #5-20, Cali",
    "customerName": "Juan Pérez",
    "customerPhone": "+57 300 123 4567",
    "notes": null,
    "createdAt": "2025-12-19T00:00:00.000Z",
    "updatedAt": "2025-12-19T00:00:00.000Z"
  },
  "restaurant": {
    "id": 1,
    "name": "Pizzería Don Giovanni",
    "isActive": true
  }
}
```

**Errores comunes:**
```json
// 400 - Campos faltantes
{
  "error": "Missing required fields: restaurantId, items, customerName, customerPhone"
}

// 404 - Restaurante no encontrado
{
  "error": "Restaurant not found"
}

// 404 - Restaurante inactivo
{
  "error": "Restaurant is not active"
}
```

---

### **3. Listar Pedidos**

Obtiene todos los pedidos con filtros opcionales.

```http
GET /api/orders?restaurantId=1&status=nuevo
```

**Query Parameters (opcionales):**
- `restaurantId` - Filtrar por restaurante
- `userId` - Filtrar por usuario
- `status` - Filtrar por estado (nuevo, en_preparacion, listo, entregado, cancelado)

**Respuesta:**
```json
{
  "count": 2,
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "restaurantId": 1,
      "status": "nuevo",
      "totalAmount": "34.48",
      "customerName": "Juan Pérez",
      "createdAt": "2025-12-19T00:00:00.000Z"
    }
  ]
}
```

---

### **4. Obtener Pedido por ID**

Obtiene los detalles de un pedido específico.

```http
GET /api/orders/:id
```

**Ejemplo:**
```http
GET /api/orders/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta:**
```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "restaurantId": 1,
    "userId": 123,
    "status": "nuevo",
    "items": [...],
    "totalAmount": "34.48",
    "deliveryAddress": "Calle 10 #5-20, Cali",
    "customerName": "Juan Pérez",
    "customerPhone": "+57 300 123 4567",
    "notes": "Sin cebolla, por favor",
    "createdAt": "2025-12-19T00:00:00.000Z",
    "updatedAt": "2025-12-19T00:00:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "error": "Order not found"
}
```

---

### **5. Actualizar Estado del Pedido**

Cambia el estado de un pedido.

```http
PATCH /api/orders/:id/status
Content-Type: application/json
```

**Body:**
```json
{
  "status": "en_preparacion"
}
```

**Estados válidos:**
- `nuevo` - Pedido recién creado
- `en_preparacion` - En proceso de preparación
- `listo` - Listo para entrega
- `entregado` - Entregado al cliente
- `cancelado` - Pedido cancelado

**Respuesta:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "en_preparacion",
    "updatedAt": "2025-12-19T00:05:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "error": "Invalid status. Must be one of: nuevo, en_preparacion, listo, entregado, cancelado"
}
```

---

### **6. Cancelar Pedido**

Cancela un pedido (solo si no ha sido entregado).

```http
DELETE /api/orders/:id
```

**Respuesta:**
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelado"
  }
}
```

**Error (400):**
```json
{
  "error": "Cannot cancel a delivered order"
}
```

---

## 📤 Eventos RabbitMQ

El servicio publica eventos automáticamente en RabbitMQ para notificar a otros servicios.

### **Exchange:** `foodshare_events` (tipo: topic)

### **Evento 1: Pedido Creado**

**Routing Key:** `order.created`

**Payload:**
```json
{
  "eventType": "order.created",
  "timestamp": "2025-12-19T00:00:00.000Z",
  "payload": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "restaurantId": 1,
    "restaurantName": "Pizzería Don Giovanni",
    "userId": 123,
    "items": [...],
    "totalAmount": "34.48",
    "status": "nuevo",
    "customerName": "Juan Pérez",
    "customerPhone": "+57 300 123 4567",
    "createdAt": "2025-12-19T00:00:00.000Z"
  }
}
```

### **Evento 2: Estado Actualizado**

**Routing Key:** `order.status.updated`

**Payload:**
```json
{
  "eventType": "order.status.updated",
  "timestamp": "2025-12-19T00:05:00.000Z",
  "payload": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "restaurantId": 1,
    "oldStatus": "nuevo",
    "newStatus": "en_preparacion",
    "updatedAt": "2025-12-19T00:05:00.000Z"
  }
}
```

---

## 🧪 Ejemplos de Uso con cURL

### **1. Health Check**
```bash
curl http://localhost:3002/health
```

### **2. Crear Pedido**
```bash
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": 1,
    "items": [
      {
        "productId": "abc-123",
        "name": "Pizza Margherita",
        "quantity": 2,
        "price": 15.99
      }
    ],
    "customerName": "Juan Pérez",
    "customerPhone": "+57 300 123 4567",
    "deliveryAddress": "Calle 10 #5-20, Cali"
  }'
```

### **3. Listar Pedidos**
```bash
# Todos los pedidos
curl http://localhost:3002/api/orders

# Filtrar por restaurante
curl http://localhost:3002/api/orders?restaurantId=1

# Filtrar por estado
curl http://localhost:3002/api/orders?status=nuevo
```

### **4. Obtener Pedido**
```bash
curl http://localhost:3002/api/orders/550e8400-e29b-41d4-a716-446655440000
```

### **5. Actualizar Estado**
```bash
curl -X PATCH http://localhost:3002/api/orders/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{"status": "en_preparacion"}'
```

### **6. Cancelar Pedido**
```bash
curl -X DELETE http://localhost:3002/api/orders/550e8400-e29b-41d4-a716-446655440000
```

---

## 📁 Estructura del Proyecto

```
apps/order-service/
├── config/
│   ├── database.js          # Configuración Sequelize
│   └── rabbitmq.js          # Configuración RabbitMQ
├── controllers/
│   └── orderController.js   # Lógica de negocio
├── models/
│   └── Order.js             # Modelo de datos
├── routes/
│   ├── orderRoutes.js       # Rutas de API
│   └── healthRoutes.js      # Health checks
├── services/
│   └── restaurantClient.js  # Cliente HTTP para Restaurant Service
├── k8s/                     # Manifiestos Kubernetes
├── Dockerfile
├── package.json
└── server.js                # Punto de entrada
```

---

## 🔗 Integración con otros servicios

### **Restaurant Service**
El Order Service valida que el restaurante existe y está activo antes de crear un pedido.

**URL interna:** `http://restaurant-service:3001`

### **RabbitMQ**
Publica eventos cuando se crean o actualizan pedidos.

**URL:** `amqp://user:password@rabbitmq:5672`

---

## 🐛 Troubleshooting

### **Error: Cannot connect to database**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs
docker-compose logs postgres
```

### **Error: Cannot connect to RabbitMQ**
```bash
# Verificar que RabbitMQ está corriendo
docker-compose ps rabbitmq

# Ver logs
docker-compose logs rabbitmq
```

### **Error: Restaurant not found**
Asegúrate de que el Restaurant Service está corriendo y que el restaurante existe:
```bash
curl http://localhost:3001/restaurants/1
```

---

## 👥 Autor

**Order Service** desarrollado por: Tu Nombre

Proyecto FoodShare - 2025

---

