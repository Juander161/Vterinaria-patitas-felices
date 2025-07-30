// api.js - Funciones fetch a la API

// Clase para manejar las peticiones a la API
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Método para hacer peticiones con autenticación
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

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            return await handleApiResponse(response);
        } catch (error) {
            console.error('Error en petición API:', error);
            // Crear un objeto de error estructurado para mejor manejo
            const structuredError = {
                message: error.message || 'Error de conexión',
                type: 'network',
                original: error
            };
            throw structuredError;
        }
    }

    // GET request
    async get(endpoint) {
        const response = await this.request(endpoint, { method: 'GET' });
        return response;
    }

    // POST request
    async post(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }

    // PUT request
    async put(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response;
    }

    // DELETE request
    async delete(endpoint) {
        const response = await this.request(endpoint, { method: 'DELETE' });
        return response;
    }
}

// Instancia global del servicio API
const api = new ApiService();

// Funciones específicas para cada endpoint

// USUARIOS
const usuariosAPI = {
    // Obtener todos los usuarios
    getAll: () => api.get('/usuarios'),
    
    // Obtener usuario por ID
    getById: (id) => api.get(`/usuarios/${id}`),
    
    // Crear usuario
    create: (userData) => api.post('/auth/registro', userData),
    
    // Actualizar usuario
    update: (id, userData) => api.put(`/usuarios/${id}`, userData),
    
    // Eliminar usuario
    delete: (id) => api.delete(`/usuarios/${id}`)
};

// MASCOTAS
const mascotasAPI = {
    // Obtener todas las mascotas (admin ve todas, cliente solo las suyas)
    getAll: () => api.get('/mascotas'),
    
    // Obtener mascota por ID
    getById: (id) => api.get(`/mascotas/${id}`),
    
    // Crear mascota
    create: (mascotaData) => api.post('/mascotas', mascotaData),
    
    // Actualizar mascota
    update: (id, mascotaData) => api.put(`/mascotas/${id}`, mascotaData),
    
    // Eliminar mascota
    delete: (id) => api.delete(`/mascotas/${id}`)
};

// CITAS
const citasAPI = {
    // Obtener todas las citas
    getAll: () => api.get('/citas'),
    
    // Obtener cita por ID
    getById: (id) => api.get(`/citas/${id}`),
    
    // Crear cita
    create: (citaData) => api.post('/citas', citaData),
    
    // Actualizar cita
    update: (id, citaData) => api.put(`/citas/${id}`, citaData),
    
    // Eliminar cita
    delete: (id) => api.delete(`/citas/${id}`)
};

// HISTORIALES MÉDICOS
const historialesAPI = {
    // Obtener todos los historiales
    getAll: () => api.get('/historiales'),
    
    // Obtener historial por ID
    getById: (id) => api.get(`/historiales/${id}`),
    
    // Crear historial
    create: (historialData) => api.post('/historiales', historialData),
    
    // Actualizar historial
    update: (id, historialData) => api.put(`/historiales/${id}`, historialData),
    
    // Eliminar historial
    delete: (id) => api.delete(`/historiales/${id}`)
};

// AUTENTICACIÓN
const authAPI = {
    // Login
    login: (credentials) => api.post('/auth/login', credentials),
    
    // Registro
    register: (userData) => api.post('/auth/registro', userData),
    
    // Obtener perfil
    getProfile: () => api.get('/auth/perfil')
};

// Exportar para uso global
window.api = api;
window.usuariosAPI = usuariosAPI;
window.mascotasAPI = mascotasAPI;
window.citasAPI = citasAPI;
window.historialesAPI = historialesAPI;
window.authAPI = authAPI; 