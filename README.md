# Patitas Felices - Frontend

Aplicación web frontend para la gestión de una clínica veterinaria. Esta aplicación se comunica con una API REST para gestionar mascotas, citas, historiales médicos, usuarios y perfiles.

## 📋 Tabla de Contenidos

- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Comunicación con la API](#comunicación-con-la-api)
- [Autenticación](#autenticación)
- [Endpoints Utilizados](#endpoints-utilizados)
- [Manejo de Errores](#manejo-de-errores)
- [Sistema de Notificaciones](#sistema-de-notificaciones)
- [Estructura de Datos](#estructura-de-datos)
- [Desarrollo](#desarrollo)

## 🚀 Configuración

### Requisitos Previos
- Navegador web moderno (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- API REST funcionando en `http://localhost:3000`
- Servidor web local (Live Server, Apache, Nginx, etc.)

### Instalación
1. Clona el repositorio
2. Abre la carpeta `www` en tu servidor web local
3. Asegúrate de que la API esté ejecutándose en `http://localhost:3000`
4. Accede a la aplicación desde tu navegador

### Configuración de la API
La aplicación espera que la API esté configurada en:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 📁 Estructura del Proyecto

```
www/
├── css/
│   ├── estilos.css          # Estilos principales
│   └── index.css           # Estilos de Cordova
├── js/
│   ├── api.js              # Cliente HTTP para la API
│   ├── auth.js             # Gestión de autenticación
│   ├── notifications.js    # Sistema de notificaciones
│   ├── router.js           # Navegación y rutas
│   ├── dashboard.js        # Dashboard principal
│   ├── mascotas.js         # Gestión de mascotas
│   ├── citas.js            # Gestión de citas
│   ├── historial.js        # Gestión de historiales médicos
│   ├── perfil.js           # Gestión de perfil de usuario
│   └── usuarios.js         # Gestión de usuarios
├── views/
│   ├── login.html          # Página de login
│   ├── registro.html       # Página de registro
│   ├── dashboard.html      # Dashboard principal
│   ├── mascotas.html       # Gestión de mascotas
│   ├── citas.html          # Gestión de citas
│   ├── historial.html      # Gestión de historiales
│   ├── perfil.html         # Perfil de usuario
│   └── usuarios.html       # Gestión de usuarios
├── img/
│   └── logo.png           # Logo de la aplicación
└── index.html             # Página principal
```

## 🔌 Comunicación con la API

### Cliente HTTP (`api.js`)

La aplicación utiliza un cliente HTTP personalizado para comunicarse con la API:

```javascript
// Configuración base
const API_BASE_URL = 'http://localhost:3000/api';

// Cliente HTTP con autenticación automática
class ApiService {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        return await fetch(`${this.baseURL}${endpoint}`, config);
    }
}
```

### Métodos HTTP Utilizados

#### GET - Obtener Datos
```javascript
// Ejemplo: Obtener todas las mascotas
const response = await fetch(`${API_BASE_URL}/mascotas`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

#### POST - Crear Datos
```javascript
// Ejemplo: Crear una nueva mascota
const response = await fetch(`${API_BASE_URL}/mascotas`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(mascotaData)
});
```

#### PUT - Actualizar Datos
```javascript
// Ejemplo: Actualizar una mascota
const response = await fetch(`${API_BASE_URL}/mascotas/${id}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(mascotaData)
});
```

#### DELETE - Eliminar Datos
```javascript
// Ejemplo: Eliminar una mascota
const response = await fetch(`${API_BASE_URL}/mascotas/${id}`, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

## 🔐 Autenticación

### Flujo de Autenticación

1. **Login**: El usuario ingresa email y password
2. **API Response**: La API devuelve un token JWT y datos del usuario
3. **Storage**: Se guarda el token en `localStorage`
4. **Requests**: Todas las peticiones incluyen el token en el header `Authorization`

### Estructura de Token
```javascript
// Header de autorización
'Authorization': `Bearer ${token}`

// Ejemplo de respuesta de login
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "rol": "cliente"
    }
}
```

### Manejo de Token Expirado
```javascript
if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
    return;
}
```

## 📡 Endpoints Utilizados

### Autenticación
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login de usuario | `{email, password}` |
| POST | `/api/auth/registro` | Registro de usuario | `{nombre, email, password, telefono, direccion, rol}` |
| GET | `/api/auth/perfil` | Obtener perfil del usuario | - |

### Mascotas
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| GET | `/api/mascotas` | Obtener todas las mascotas | - |
| GET | `/api/mascotas/:id` | Obtener mascota específica | - |
| POST | `/api/mascotas` | Crear nueva mascota | `{nombre, especie, raza, fecha_nacimiento, sexo, color, esterilizado, foto}` |
| PUT | `/api/mascotas/:id` | Actualizar mascota | `{nombre, especie, raza, fecha_nacimiento, sexo, color, esterilizado, foto}` |
| DELETE | `/api/mascotas/:id` | Eliminar mascota | - |

### Citas
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| GET | `/api/citas` | Obtener todas las citas | - |
| GET | `/api/citas/:id` | Obtener cita específica | - |
| POST | `/api/citas` | Crear nueva cita | `{id_mascota, id_veterinario, fecha_hora, motivo, estado, notas}` |
| PUT | `/api/citas/:id` | Actualizar cita | `{id_mascota, id_veterinario, fecha_hora, motivo, estado, notas}` |
| DELETE | `/api/citas/:id` | Eliminar cita | - |

### Historiales Médicos
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| GET | `/api/historiales` | Obtener todos los historiales | - |
| GET | `/api/historiales/:id` | Obtener historial específico | - |
| POST | `/api/historiales` | Crear historial médico | `{id_mascota, vacunas[], alergias[], cirugias[], enfermedades_cronicas[], medicamentos_actuales[], notas_generales}` |
| PUT | `/api/historiales/:id` | Actualizar historial | `{id_mascota, vacunas[], alergias[], cirugias[], enfermedades_cronicas[], medicamentos_actuales[], notas_generales}` |
| DELETE | `/api/historiales/:id` | Eliminar historial | - |

### Usuarios
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| GET | `/api/usuarios` | Obtener todos los usuarios | - |
| GET | `/api/usuarios/:id` | Obtener usuario específico | - |
| PUT | `/api/usuarios/:id` | Actualizar usuario | `{nombre, email, telefono, direccion, rol}` |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | - |

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP Manejados

#### 400 - Bad Request
```javascript
if (response.status === 400) {
    notifications.showError('Datos inválidos. Verifica la información ingresada.');
}
```

#### 401 - Unauthorized
```javascript
if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
```

#### 403 - Forbidden
```javascript
if (response.status === 403) {
    notifications.showContextError('mascotas', 'no_permission');
}
```

#### 404 - Not Found
```javascript
if (response.status === 404) {
    notifications.showError('El recurso no fue encontrado.');
}
```

#### 409 - Conflict
```javascript
if (response.status === 409) {
    notifications.showError('Ya existe un registro con estos datos.');
}
```

#### 422 - Unprocessable Entity
```javascript
if (response.status === 422) {
    notifications.showError('Los datos no cumplen con los requisitos.');
}
```

### Errores de Red
```javascript
catch (error) {
    if (error.type === 'network') {
        notifications.showError('Error de conexión. Verifica tu conexión a internet.');
    } else {
        notifications.showContextError('mascotas', 'load');
    }
}
```

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones
```javascript
// Éxito (Verde)
notifications.showSuccess('Operación completada exitosamente');

// Error (Rojo)
notifications.showError('Ha ocurrido un error');

// Advertencia (Naranja)
notifications.showWarning('Advertencia importante');

// Información (Azul)
notifications.showInfo('Información del sistema');
```

### Notificaciones Específicas por Contexto
```javascript
// Errores específicos por módulo
notifications.showContextError('mascotas', 'load');
notifications.showContextError('citas', 'create');
notifications.showContextError('historiales', 'update');
notifications.showContextError('perfil', 'password');
notifications.showContextError('usuarios', 'delete');
```

## 📊 Estructura de Datos

### Usuario
```javascript
{
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "hashed_password",
    "telefono": "123456789",
    "direccion": "Calle Principal 123",
    "rol": "cliente",
    "fecha_registro": "2024-01-01T00:00:00.000Z"
}
```

### Mascota
```javascript
{
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Luna",
    "especie": "Perro",
    "raza": "Golden Retriever",
    "fecha_nacimiento": "2021-01-15",
    "sexo": "Hembra",
    "color": "Dorado",
    "esterilizado": true,
    "foto": "https://ejemplo.com/foto.jpg",
    "id_propietario": "507f1f77bcf86cd799439011"
}
```

### Cita
```javascript
{
    "_id": "507f1f77bcf86cd799439013",
    "id_mascota": "507f1f77bcf86cd799439012",
    "id_veterinario": "507f1f77bcf86cd799439014",
    "fecha_hora": "2024-12-20T10:00:00.000Z",
    "motivo": "Vacunación anual",
    "estado": "Programada",
    "notas": "Vacuna contra la rabia"
}
```

### Historial Médico
```javascript
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
```

## 🛠️ Desarrollo

### Variables de Entorno
La aplicación utiliza las siguientes variables:

```javascript
// URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Configuración de notificaciones
const NOTIFICATION_DURATION = 5000; // 5 segundos
```

### Headers Utilizados
```javascript
// Headers estándar para todas las peticiones
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

### Formato de Respuestas Esperadas

#### Respuesta Exitosa
```javascript
{
    "success": true,
    "data": {...},
    "message": "Operación exitosa"
}
```

#### Respuesta con Error
```javascript
{
    "success": false,
    "error": "Mensaje de error",
    "code": "ERROR_CODE"
}
```

#### Respuesta de Lista
```javascript
{
    "success": true,
    "mascotas": [...], // o "citas", "historiales", "usuarios"
    "total": 10,
    "page": 1,
    "limit": 10
}
```

### Validaciones del Frontend

#### Formularios
- Campos requeridos marcados con `required`
- Validación de email con `type="email"`
- Validación de fechas con `type="date"`
- Validación de números con `type="number"`

#### JavaScript
```javascript
// Validación de formulario
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('nombre').trim()) {
        errors.push('El nombre es requerido');
    }
    
    if (!formData.get('email').includes('@')) {
        errors.push('Email inválido');
    }
    
    return errors;
}
```

## 🔧 Configuración para el Desarrollador de la API

### Puntos Importantes para la API

1. **CORS**: La API debe permitir peticiones desde el frontend
2. **JWT**: Implementar autenticación JWT con expiración
3. **Validación**: Validar todos los datos de entrada
4. **Respuestas**: Mantener formato consistente de respuestas
5. **Errores**: Devolver códigos de estado HTTP apropiados
6. **Permisos**: Implementar control de acceso basado en roles

### Headers de CORS Necesarios
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Estructura de Respuesta Recomendada
```javascript
// Éxito
{
    "success": true,
    "data": {...},
    "message": "Operación exitosa"
}

// Error
{
    "success": false,
    "error": "Descripción del error",
    "code": "ERROR_CODE"
}
```

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Dispositivos
- Desktop
- Tablet
- Mobile (responsive design)

## 🚀 Despliegue

### Desarrollo Local
1. Inicia tu servidor web local
2. Asegúrate de que la API esté ejecutándose en `http://localhost:3000`
3. Accede a `http://localhost:5500` (o puerto configurado)

### Producción
1. Configura la URL de la API para producción
2. Asegúrate de que HTTPS esté habilitado
3. Configura CORS apropiadamente en la API

---

**Desarrollado por**: Equipo de Desarrollo  
**Fecha**: Diciembre 2024  
**Versión**: 1.0.0 