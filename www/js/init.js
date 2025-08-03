// init.js - Inicialización de la aplicación

// Función de inicialización principal
function initApp() {
    console.log('Inicializando aplicación Patitas Felices...');
    
    // Verificar dependencias
    checkDependencies();
    
    // Configurar interceptores globales
    setupGlobalInterceptors();
    
    // Configurar manejo de errores globales
    setupErrorHandling();
    
    console.log('Aplicación inicializada correctamente');
}

// Verificar que todas las dependencias estén cargadas
function checkDependencies() {
    const requiredGlobals = [
        'API_BASE_URL',
        'showNotification',
        'showSuccess',
        'showError',
        'handleApiResponse',
        'auth'
    ];
    
    const missing = requiredGlobals.filter(global => typeof window[global] === 'undefined');
    
    if (missing.length > 0) {
        console.warn('Dependencias faltantes:', missing);
    } else {
        console.log('Todas las dependencias están disponibles');
    }
}

// Configurar interceptores globales
function setupGlobalInterceptors() {
    // Interceptor para fetch global (si es necesario)
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
        // Agregar logging si está en modo debug
        if (window.CONFIG && window.CONFIG.DEBUG) {
            console.log('Fetch request:', args[0]);
        }
        
        return originalFetch.apply(this, args);
    };
}

// Configurar manejo de errores globales
function setupErrorHandling() {
    // Manejar errores JavaScript no capturados
    window.addEventListener('error', function(event) {
        console.error('Error no capturado:', event.error);
        
        if (typeof showError === 'function') {
            showError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
        }
    });
    
    // Manejar promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Promesa rechazada no capturada:', event.reason);
        
        if (typeof showError === 'function') {
            showError('Error de conexión. Verifica tu conexión a internet.');
        }
        
        // Prevenir que el error aparezca en la consola
        event.preventDefault();
    });
}

// Función para verificar conectividad con la API
async function checkApiConnectivity() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('Conectividad con API: OK');
            return true;
        } else {
            console.warn('API responde pero con error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error de conectividad con API:', error);
        return false;
    }
}

// Función para mostrar estado de la aplicación
function showAppStatus() {
    const status = {
        environment: window.CURRENT_ENV || 'unknown',
        apiUrl: window.API_BASE_URL || 'not configured',
        authenticated: typeof auth !== 'undefined' ? auth.isAuthenticated() : false,
        user: typeof auth !== 'undefined' && auth.isAuthenticated() ? auth.getUser() : null
    };
    
    console.log('Estado de la aplicación:', status);
    return status;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(initApp, 100);
});

// Exportar funciones para uso global
window.initApp = initApp;
window.checkApiConnectivity = checkApiConnectivity;
window.showAppStatus = showAppStatus;