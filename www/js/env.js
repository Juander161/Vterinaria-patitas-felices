// env.js - Variables de entorno

// Configuración de entorno
window.ENV = {
    // Desarrollo
    development: {
        API_BASE_URL: 'http://localhost:3000/api',
        DEBUG: true,
        LOG_LEVEL: 'debug'
    },
    
    // Producción
    production: {
        API_BASE_URL: 'https://api.patitasfelices.com/api',
        DEBUG: false,
        LOG_LEVEL: 'error'
    }
};

// Detectar entorno actual
window.CURRENT_ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

// Configuración actual
window.CONFIG = window.ENV[window.CURRENT_ENV];

console.log('Entorno actual:', window.CURRENT_ENV);
console.log('Configuración:', window.CONFIG);