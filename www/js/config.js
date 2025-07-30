// config.js - Configuración global de la aplicación

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Función para manejar respuestas de la API
async function handleApiResponse(response) {
    if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        
        if (data.success !== undefined) {
            return data;
        } else {
            return {
                success: true,
                data: data
            };
        }
    } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return null;
    } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
}

// Función para hacer peticiones autenticadas
async function authenticatedRequest(endpoint, options = {}) {
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

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        return await handleApiResponse(response);
    } catch (error) {
        console.error('Error en petición API:', error);
        const structuredError = {
            message: error.message || 'Error de conexión',
            type: 'network',
            original: error
        };
        throw structuredError;
    }
}

// Exportar configuración para uso global
window.API_BASE_URL = API_BASE_URL;
window.handleApiResponse = handleApiResponse;
window.authenticatedRequest = authenticatedRequest; 