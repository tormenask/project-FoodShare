# Restaurant Service

Microservicio responsable de la gestión de restaurantes, permitiendo la creación, lectura y actualización de información de restaurantes.

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL
- Docker (Opcional, para contenedorización)

## Instalación

1.  Clonar el repositorio y navegar a la carpeta del servicio:

    ```bash
    cd apps/restaurant-service
    ```

2.  Instalar las dependencias:

    ```bash
    npm install
    ```

3.  Configurar las variables de entorno:
    Crea un archivo `.env` en la raíz del servicio con las siguientes variables (ajusta según tu configuración):
    ```env
    PORT=3000
    DB_NAME=tu_base_de_datos
    DB_USER=tu_usuario
    DB_PASSWORD=tu_contraseña
    DB_HOST=localhost
    DB_PORT=5432
    JWT_SECRET=tu_secreto_jwt
    ```
    Nota: si ejecutas el servicio dentro de Docker, cambia DB_HOST=localhost por DB_HOST=host.docker.internal.

## Ejecución

### Modo Desarrollo

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

## Docker

### Construir la imagen

```bash
docker build -t restaurant-service .
```

### Correr el contenedor

```bash
docker run -d --name restaurant-service -p 3001:3001 --env-file ./apps/restaurant-service/.env foodshare-restaurant
```

## API Endpoints

### Restaurantes (`/api/restaurants`)

Las rutas marcadas como protegidas requieren enviar un token JWT válido en el header:

Authorization: Bearer <access_token>  

- **POST /**: Crear un nuevo restaurante.
  - Requiere autenticación.
- **GET /**: Obtener todos los restaurantes.
- **GET /:id**: Obtener un restaurante por ID.
- **PUT /:id**: Actualizar un restaurante por ID.
  - Requiere autenticación.
- **GET /my/restaurants**: Obtener los restaurantes del usuario autenticado.
  - Requiere autenticación.
