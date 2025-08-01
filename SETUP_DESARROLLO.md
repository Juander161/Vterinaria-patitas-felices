# 🚀 Guía de Configuración para Desarrollo - Patitas Felices

## 📋 Requisitos Previos

### Backend (API Express en Docker)
1. **Docker y Docker Compose** instalados
2. **API ejecutándose en**: `http://localhost:3000`
3. **Endpoints requeridos**:
   - `GET /api/health` - Verificación de salud
   - `POST /api/auth/login` - Autenticación
   - `POST /api/auth/registro` - Registro de usuarios
   - `GET /api/auth/perfil` - Perfil del usuario
   - CRUD completo para: `/api/mascotas`, `/api/citas`, `/api/historiales`, `/api/usuarios`

### Frontend (Esta aplicación)
1. **Node.js** (versión 14 o superior)
2. **Cordova CLI**: `npm install -g cordova`
3. **Servidor web local** (Live Server, http-server, etc.)

## 🔧 Configuración Inicial

### 1. Verificar que la API esté funcionando
```bash
# Verificar que Docker esté ejecutando la API
curl http://localhost:3001/health

# Debería devolver algo como:
# {"success": true, "message": "API funcionando correctamente"}
```

### 2. Configurar el Frontend
```bash
# Instalar dependencias de Cordova (si es necesario)
npm install

# Preparar la aplicación Cordova
cordova prepare

# Servir la aplicación para desarrollo web
cordova serve
# O usar un servidor web simple:
# npx http-server www -p 8080
```

### 3. Abrir en el navegador
- Navegar a: `http://localhost:8000` (o el puerto que use cordova serve)
- O abrir directamente: `www/index.html` con Live Server

## 🧪 Pruebas de Conexión

### Automáticas
- En modo desarrollo, las pruebas se ejecutan automáticamente al cargar la página
- Revisar la **Consola del Navegador** para ver los resultados

### Manuales
```javascript
// En la consola del navegador, ejecutar:
testAPI()

// Esto probará:
// ✅ Conexión básica con la API
// ✅ Endpoint de autenticación
// ✅ Todos los endpoints principales
```

## 🔐 Usuarios de Prueba

### Usuario Administrador
- **Email**: `admin@clinica.com`
- **Contraseña**: `admin123456`
- **Rol**: `admin`

### Usuario Cliente
- **Email**: `cliente@test.com`
- **Contraseña**: `cliente123`
- **Rol**: `cliente`

### Usuario Veterinario
- **Email**: `vet@clinica.com`
- **Contraseña**: `vet123456`
- **Rol**: `veterinario`

## 📁 Estructura de Archivos Importantes

```
www/
├── js/
│   ├── env.js          # ✨ Configuración de entorno
│   ├── config.js       # ⚙️ Configuración global
│   ├── api.js          # 🌐 Cliente HTTP para API
│   ├── api-test.js     # 🧪 Pruebas de conexión
│   ├── auth.js         # 🔐 Autenticación
│   ├── notifications.js # 🔔 Sistema de notificaciones
│   └── ...
├── views/
│   ├── login.html      # 🚪 Página de login
│   ├── dashboard.html  # 🏠 Dashboard principal
│   └── ...
└── css/
    └── estilos.css     # 🎨 Estilos principales
```

## 🐛 Solución de Problemas Comunes

### ❌ Error: "No se puede conectar con el servidor"
**Causa**: La API no está ejecutándose o está en un puerto diferente
**Solución**:
1. Verificar que Docker esté ejecutando la API: `docker ps`
2. Verificar que la API responda: `curl http://localhost:3001/health`
3. Revisar la configuración en `www/js/env.js`

### ❌ Error de CORS
**Causa**: La API no permite peticiones desde el frontend
**Solución**: Configurar CORS en tu API Express:
```javascript
// En tu API Express
const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:8000', 'http://localhost:8080', 'http://127.0.0.1:8000'],
    credentials: true
}));
```

### ❌ Error: "Token expirado"
**Causa**: El token JWT ha expirado
**Solución**: 
1. Cerrar sesión y volver a iniciar sesión
2. O limpiar localStorage: `localStorage.clear()`

### ❌ Notificaciones no aparecen
**Causa**: Falta el CSS de notificaciones
**Solución**: Verificar que `www/css/estilos.css` contenga los estilos de `.notification-container`

## 🔄 Flujo de Desarrollo

### 1. Iniciar Backend
```bash
# En el directorio de tu API
docker-compose up -d
```

### 2. Iniciar Frontend
```bash
# En este directorio
cordova serve
# O usar Live Server en VSCode
```

### 3. Desarrollo
1. Hacer cambios en los archivos de `www/`
2. Refrescar el navegador para ver cambios
3. Revisar consola para errores o logs de debug

### 4. Pruebas
- Usar `testAPI()` en consola para probar conexión
- Probar login con usuarios de prueba
- Verificar que todas las funcionalidades trabajen correctamente

## 📱 Compilación para Móvil

### Android
```bash
# Agregar plataforma Android
cordova platform add android

# Compilar para Android
cordova build android

# Ejecutar en dispositivo/emulador
cordova run android
```

### iOS (solo en macOS)
```bash
# Agregar plataforma iOS
cordova platform add ios

# Compilar para iOS
cordova build ios

# Abrir en Xcode
cordova prepare ios
open platforms/ios/Patitas\ Felices.xcworkspace
```

## 🌐 Variables de Entorno

### Desarrollo Local
- **API_BASE_URL**: `http://localhost:3001/api`
- **DEBUG**: `true`

### Producción
- **API_BASE_URL**: `https://tu-api-produccion.com/api`
- **DEBUG**: `false`

Editar `www/js/env.js` para cambiar estas configuraciones.

## 📞 Soporte

Si encuentras problemas:

1. **Revisar la consola del navegador** para errores de JavaScript
2. **Ejecutar `testAPI()`** para verificar conexión con la API
3. **Verificar que la API esté respondiendo** con curl o Postman
4. **Limpiar caché del navegador** si hay problemas de carga

## 🎯 Próximos Pasos

Una vez que todo funcione correctamente:

1. ✅ Probar todas las funcionalidades (login, CRUD de mascotas, citas, etc.)
2. ✅ Verificar que los roles funcionen correctamente
3. ✅ Probar en diferentes navegadores
4. ✅ Compilar para móvil si es necesario
5. ✅ Configurar para producción

---

**¡Listo para desarrollar! 🚀**