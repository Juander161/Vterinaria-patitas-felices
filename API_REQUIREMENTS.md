# 📋 Requisitos de API para Patitas Felices

## 🎯 Información General

Esta aplicación frontend espera que tu API Express cumpla con los siguientes endpoints y formatos de respuesta.

### URL Base Esperada
```
http://localhost:3001/api
```

### Headers Requeridos
```javascript
{
    "Content-Type": "application/json",
    "Authorization": "Bearer <jwt_token>" // Para endpoints protegidos
}
```

## 🔐 Autenticación

### POST /api/auth/login
**Descripción**: Autenticar usuario
**Body**:
```json
{
    "email": "usuario@email.com",
    "password": "contraseña123"
}
```
**Respuesta Exitosa**:
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez",
        "email": "juan@email.com",
        "rol": "cliente",
        "telefono": "123456789",
        "direccion": "Calle Principal 123"
    }
}
```

### POST /api/auth/registro
**Descripción**: Registrar nuevo usuario
**Body**:
```json
{
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "password": "contraseña123",
    "telefono": "123456789",
    "direccion": "Calle Principal 123",
    "rol": "cliente"
}
```
**Respuesta Exitosa**:
```json
{
    "success": true,
    "message": "Usuario registrado exitosamente"
}
```

### GET /api/auth/perfil
**Descripción**: Obtener perfil del usuario autenticado
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "usuario": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez",
        "email": "juan@email.com",
        "rol": "cliente",
        "telefono": "123456789",
        "direccion": "Calle Principal 123"
    }
}
```

## 🐕 Mascotas

### GET /api/mascotas
**Descripción**: Obtener mascotas (admin ve todas, cliente solo las suyas)
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "mascotas": [
        {
            "_id": "507f1f77bcf86cd799439012",
            "nombre": "Luna",
            "especie": "Perro",
            "raza": "Golden Retriever",
            "fecha_nacimiento": "2021-01-15T00:00:00.000Z",
            "sexo": "Hembra",
            "color": "Dorado",
            "esterilizado": true,
            "foto": "https://ejemplo.com/foto.jpg",
            "id_propietario": "507f1f77bcf86cd799439011"
        }
    ]
}
```

### GET /api/mascotas/:id
**Descripción**: Obtener mascota específica
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "mascota": {
        "_id": "507f1f77bcf86cd799439012",
        "nombre": "Luna",
        "especie": "Perro",
        "raza": "Golden Retriever",
        "fecha_nacimiento": "2021-01-15T00:00:00.000Z",
        "sexo": "Hembra",
        "color": "Dorado",
        "esterilizado": true,
        "foto": "https://ejemplo.com/foto.jpg",
        "id_propietario": "507f1f77bcf86cd799439011"
    }
}
```

### POST /api/mascotas
**Descripción**: Crear nueva mascota
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
    "nombre": "Luna",
    "especie": "Perro",
    "raza": "Golden Retriever",
    "fecha_nacimiento": "2021-01-15T00:00:00.000Z",
    "sexo": "Hembra",
    "color": "Dorado",
    "esterilizado": true,
    "foto": "https://ejemplo.com/foto.jpg"
}
```
**Respuesta Exitosa**:
```json
{
    "success": true,
    "message": "Mascota creada exitosamente",
    "mascota": {
        "_id": "507f1f77bcf86cd799439012",
        "nombre": "Luna",
        "especie": "Perro",
        "raza": "Golden Retriever",
        "fecha_nacimiento": "2021-01-15T00:00:00.000Z",
        "sexo": "Hembra",
        "color": "Dorado",
        "esterilizado": true,
        "foto": "https://ejemplo.com/foto.jpg",
        "id_propietario": "507f1f77bcf86cd799439011"
    }
}
```

### PUT /api/mascotas/:id
**Descripción**: Actualizar mascota
**Headers**: `Authorization: Bearer <token>`
**Body**: (mismo formato que POST)
**Respuesta Exitosa**:
```json
{
    "success": true,
    "message": "Mascota actualizada exitosamente"
}
```

### DELETE /api/mascotas/:id
**Descripción**: Eliminar mascota
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "message": "Mascota eliminada exitosamente"
}
```

## 📅 Citas

### GET /api/citas
**Descripción**: Obtener citas
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "citas": [
        {
            "_id": "507f1f77bcf86cd799439013",
            "id_mascota": "507f1f77bcf86cd799439012",
            "id_veterinario": "507f1f77bcf86cd799439014",
            "fecha_hora": "2024-12-20T10:00:00.000Z",
            "motivo": "Vacunación anual",
            "estado": "Programada",
            "notas": "Vacuna contra la rabia"
        }
    ]
}
```

### POST /api/citas
**Descripción**: Crear nueva cita
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
    "id_mascota": "507f1f77bcf86cd799439012",
    "id_veterinario": "507f1f77bcf86cd799439014",
    "fecha_hora": "2024-12-20T10:00:00.000Z",
    "motivo": "Vacunación anual",
    "estado": "Programada",
    "notas": "Vacuna contra la rabia"
}
```

### PUT /api/citas/:id
**Descripción**: Actualizar cita
**Headers**: `Authorization: Bearer <token>`
**Body**: (mismo formato que POST)

### DELETE /api/citas/:id
**Descripción**: Eliminar cita
**Headers**: `Authorization: Bearer <token>`

## 🏥 Historiales Médicos

### GET /api/historiales
**Descripción**: Obtener historiales médicos
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "historiales": [
        {
            "_id": "507f1f77bcf86cd799439015",
            "id_mascota": "507f1f77bcf86cd799439012",
            "vacunas": [
                {
                    "nombre": "Vacuna Triple",
                    "fecha": "2024-01-15",
                    "proxima_fecha": "2025-01-15",
                    "lote": "LOT123",
                    "veterinario": "Dr. García"
                }
            ],
            "alergias": [
                {
                    "sustancia": "Penicilina",
                    "gravedad": "Moderada",
                    "reaccion": "Erupción cutánea"
                }
            ],
            "cirugias": [
                {
                    "nombre": "Esterilización",
                    "fecha": "2023-06-15",
                    "veterinario": "Dr. García",
                    "descripcion": "Esterilización rutinaria",
                    "complicaciones": "Ninguna"
                }
            ],
            "enfermedades_cronicas": ["Diabetes"],
            "medicamentos_actuales": [
                {
                    "nombre": "Insulina",
                    "dosis": "2 unidades",
                    "frecuencia": "2 veces al día"
                }
            ],
            "notas_generales": "Mascota con diabetes controlada"
        }
    ]
}
```

### POST /api/historiales
**Descripción**: Crear historial médico
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
    "id_mascota": "507f1f77bcf86cd799439012",
    "vacunas": [],
    "alergias": [],
    "cirugias": [],
    "enfermedades_cronicas": [],
    "medicamentos_actuales": [],
    "notas_generales": ""
}
```

### PUT /api/historiales/:id
**Descripción**: Actualizar historial médico
**Headers**: `Authorization: Bearer <token>`
**Body**: (mismo formato que POST)

### DELETE /api/historiales/:id
**Descripción**: Eliminar historial médico
**Headers**: `Authorization: Bearer <token>`

## 👥 Usuarios (Solo Admin)

### GET /api/usuarios
**Descripción**: Obtener todos los usuarios (solo admin)
**Headers**: `Authorization: Bearer <token>`
**Respuesta Exitosa**:
```json
{
    "success": true,
    "usuarios": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "nombre": "Juan Pérez",
            "email": "juan@email.com",
            "rol": "cliente",
            "telefono": "123456789",
            "direccion": "Calle Principal 123",
            "fecha_registro": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

### PUT /api/usuarios/:id
**Descripción**: Actualizar usuario
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "telefono": "123456789",
    "direccion": "Calle Principal 123",
    "rol": "cliente"
}
```

### DELETE /api/usuarios/:id
**Descripción**: Eliminar usuario
**Headers**: `Authorization: Bearer <token>`

## 🔍 Endpoint de Salud (Opcional pero Recomendado)

### GET /api/health
**Descripción**: Verificar que la API esté funcionando
**Respuesta Exitosa**:
```json
{
    "success": true,
    "message": "API funcionando correctamente",
    "timestamp": "2024-12-20T10:00:00.000Z"
}
```

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP Esperados

#### 400 - Bad Request
```json
{
    "success": false,
    "message": "Datos inválidos",
    "errors": ["El email es requerido", "La contraseña debe tener al menos 6 caracteres"]
}
```

#### 401 - Unauthorized
```json
{
    "success": false,
    "message": "Token inválido o expirado"
}
```

#### 403 - Forbidden
```json
{
    "success": false,
    "message": "No tienes permisos para realizar esta acción"
}
```

#### 404 - Not Found
```json
{
    "success": false,
    "message": "Recurso no encontrado"
}
```

#### 409 - Conflict
```json
{
    "success": false,
    "message": "El email ya está registrado"
}
```

#### 422 - Unprocessable Entity
```json
{
    "success": false,
    "message": "Error de validación",
    "errors": ["El email no es válido"]
}
```

#### 500 - Internal Server Error
```json
{
    "success": false,
    "message": "Error interno del servidor"
}
```

## 🔧 Configuración CORS Requerida

Tu API Express debe permitir peticiones desde:
- `http://localhost:8000` (Cordova serve)
- `http://localhost:8080` (http-server)
- `http://127.0.0.1:8000`
- `http://127.0.0.1:8080`

```javascript
// Ejemplo de configuración CORS en Express
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:8000',
        'http://localhost:8080',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🔐 JWT Token

### Formato Esperado
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Payload Recomendado
```json
{
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@email.com",
    "rol": "cliente",
    "iat": 1640000000,
    "exp": 1640086400
}
```

## 📝 Notas Importantes

1. **Todos los endpoints (excepto login y registro) requieren autenticación**
2. **Los roles determinan qué datos puede ver cada usuario**:
   - `admin`: Ve todo
   - `veterinario`: Ve mascotas, historiales y citas
   - `recepcionista`: Ve usuarios y citas
   - `cliente`: Solo ve sus propias mascotas, citas e historiales
3. **Las fechas deben estar en formato ISO 8601**
4. **Los IDs deben ser ObjectId de MongoDB o equivalente**
5. **Todas las respuestas deben incluir el campo `success`**

---

**¡Con esta especificación tu API debería funcionar perfectamente con el frontend! 🚀**