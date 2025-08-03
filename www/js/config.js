// config.js - Configuración global de la aplicación

// Configuración de la aplicación
window.APP_CONFIG = {
    name: 'Patitas Felices',
    version: '1.0.0',
    description: 'Sistema de gestión para clínica veterinaria',
    
    // Configuración de API
    api: {
        timeout: 30000, // 30 segundos
        retries: 3,
        retryDelay: 1000 // 1 segundo
    },
    
    // Configuración de notificaciones
    notifications: {
        duration: 5000, // 5 segundos
        position: 'top-right',
        maxVisible: 5
    },
    
    // Configuración de paginación
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100
    },
    
    // Configuración de archivos
    files: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    },
    
    // Configuración de validación
    validation: {
        minPasswordLength: 8,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\+]?[1-9][\d]{0,15}$/
    },
    
    // Configuración de roles
    roles: {
        admin: {
            name: 'Administrador',
            permissions: ['all']
        },
        veterinario: {
            name: 'Veterinario',
            permissions: ['mascotas', 'historiales', 'citas', 'perfil']
        },
        recepcionista: {
            name: 'Recepcionista',
            permissions: ['usuarios', 'citas', 'perfil']
        },
        cliente: {
            name: 'Cliente',
            permissions: ['mascotas', 'citas', 'historiales', 'perfil']
        }
    }
};

// Función para obtener configuración
window.getConfig = function(key) {
    const keys = key.split('.');
    let value = window.APP_CONFIG;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return undefined;
        }
    }
    
    return value;
};

// Función para verificar permisos
window.hasPermission = function(permission) {
    if (!auth || !auth.isAuthenticated()) {
        return false;
    }
    
    const user = auth.getUser();
    const userRole = user.rol;
    const roleConfig = window.APP_CONFIG.roles[userRole];
    
    if (!roleConfig) {
        return false;
    }
    
    return roleConfig.permissions.includes('all') || roleConfig.permissions.includes(permission);
};

console.log('Configuración de la aplicación cargada:', window.APP_CONFIG);