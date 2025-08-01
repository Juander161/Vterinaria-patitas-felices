// data-loader.js - Sistema mejorado de carga de datos

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.loadingStates = new Map();
    }

    // Método genérico para cargar datos
    async loadData(endpoint, options = {}) {
        const {
            useCache = true,
            showLoading = true,
            errorMessage = 'Error al cargar datos'
        } = options;

        // Verificar autenticación
        if (!auth || !auth.isAuthenticated()) {
            showError('Debes iniciar sesión para acceder a esta información');
            goToLogin();
            return null;
        }

        // Verificar si ya está cargando
        if (this.loadingStates.get(endpoint)) {
            console.log('Ya se está cargando:', endpoint);
            return null;
        }

        // Verificar caché
        if (useCache && this.cache.has(endpoint)) {
            console.log('Datos obtenidos del caché:', endpoint);
            return this.cache.get(endpoint);
        }

        try {
            this.loadingStates.set(endpoint, true);
            
            if (showLoading) {
                showInfo('Cargando datos...');
            }

            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await window.handleApiResponse(response);

            if (data && data.success) {
                // Guardar en caché
                if (useCache) {
                    this.cache.set(endpoint, data);
                }

                console.log('Datos cargados exitosamente:', endpoint, data);
                return data;
            } else {
                throw new Error(data?.message || errorMessage);
            }

        } catch (error) {
            console.error('Error al cargar datos:', endpoint, error);
            
            if (error.message.includes('401') || error.message.includes('token')) {
                showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                setTimeout(() => goToLogin(), 2000);
            } else if (error.message.includes('fetch')) {
                showError('Error de conexión. Verifica que la API esté funcionando en http://localhost:3001');
            } else {
                showError(error.message || errorMessage);
            }
            
            return null;
        } finally {
            this.loadingStates.set(endpoint, false);
        }
    }

    // Métodos específicos para cada tipo de dato
    async loadMascotas() {
        const data = await this.loadData('/mascotas', {
            errorMessage: 'Error al cargar las mascotas'
        });
        
        if (data) {
            const mascotas = data.mascotas || data.data || [];
            if (mascotas.length === 0) {
                showInfo('No hay mascotas registradas');
            } else {
                showSuccess(`${mascotas.length} mascotas cargadas`);
            }
            return mascotas;
        }
        return [];
    }

    async loadCitas() {
        const data = await this.loadData('/citas', {
            errorMessage: 'Error al cargar las citas'
        });
        
        if (data) {
            const citas = data.citas || data.data || [];
            if (citas.length === 0) {
                showInfo('No hay citas programadas');
            } else {
                showSuccess(`${citas.length} citas cargadas`);
            }
            return citas;
        }
        return [];
    }

    async loadHistoriales() {
        const data = await this.loadData('/historiales', {
            errorMessage: 'Error al cargar los historiales médicos'
        });
        
        if (data) {
            const historiales = data.historiales || data.data || [];
            if (historiales.length === 0) {
                showInfo('No hay historiales médicos registrados');
            } else {
                showSuccess(`${historiales.length} historiales cargados`);
            }
            return historiales;
        }
        return [];
    }

    async loadUsuarios() {
        const data = await this.loadData('/usuarios', {
            errorMessage: 'Error al cargar los usuarios'
        });
        
        if (data) {
            const usuarios = data.usuarios || data.data || [];
            if (usuarios.length === 0) {
                showInfo('No hay usuarios registrados');
            } else {
                showSuccess(`${usuarios.length} usuarios cargados`);
            }
            return usuarios;
        }
        return [];
    }

    async loadVeterinarios() {
        const usuarios = await this.loadUsuarios();
        return usuarios.filter(user => user.rol === 'veterinario');
    }

    // Método para crear datos
    async createData(endpoint, data, successMessage = 'Datos creados exitosamente') {
        if (!auth || !auth.isAuthenticated()) {
            showError('Debes iniciar sesión para realizar esta acción');
            return null;
        }

        try {
            showInfo('Guardando datos...');

            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await window.handleApiResponse(response);

            if (result && result.success) {
                showSuccess(successMessage);
                // Limpiar caché relacionado
                this.clearCache(endpoint);
                return result;
            } else {
                throw new Error(result?.message || 'Error al crear datos');
            }

        } catch (error) {
            console.error('Error al crear datos:', error);
            showError(error.message || 'Error al guardar los datos');
            return null;
        }
    }

    // Método para actualizar datos
    async updateData(endpoint, data, successMessage = 'Datos actualizados exitosamente') {
        if (!auth || !auth.isAuthenticated()) {
            showError('Debes iniciar sesión para realizar esta acción');
            return null;
        }

        try {
            showInfo('Actualizando datos...');

            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await window.handleApiResponse(response);

            if (result && result.success) {
                showSuccess(successMessage);
                // Limpiar caché relacionado
                this.clearCache(endpoint);
                return result;
            } else {
                throw new Error(result?.message || 'Error al actualizar datos');
            }

        } catch (error) {
            console.error('Error al actualizar datos:', error);
            showError(error.message || 'Error al actualizar los datos');
            return null;
        }
    }

    // Método para eliminar datos
    async deleteData(endpoint, successMessage = 'Datos eliminados exitosamente') {
        if (!auth || !auth.isAuthenticated()) {
            showError('Debes iniciar sesión para realizar esta acción');
            return null;
        }

        if (!confirm('¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.')) {
            return null;
        }

        try {
            showInfo('Eliminando datos...');

            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await window.handleApiResponse(response);

            if (result && result.success) {
                showSuccess(successMessage);
                // Limpiar caché relacionado
                this.clearCache(endpoint);
                return result;
            } else {
                throw new Error(result?.message || 'Error al eliminar datos');
            }

        } catch (error) {
            console.error('Error al eliminar datos:', error);
            showError(error.message || 'Error al eliminar los datos');
            return null;
        }
    }

    // Limpiar caché
    clearCache(endpoint = null) {
        if (endpoint) {
            // Limpiar caché específico y relacionado
            const keysToDelete = [];
            for (const key of this.cache.keys()) {
                if (key.includes(endpoint.split('/')[1])) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.cache.delete(key));
        } else {
            // Limpiar todo el caché
            this.cache.clear();
        }
        console.log('Caché limpiado:', endpoint || 'todo');
    }

    // Verificar estado de carga
    isLoading(endpoint) {
        return this.loadingStates.get(endpoint) || false;
    }

    // Obtener datos del caché
    getCachedData(endpoint) {
        return this.cache.get(endpoint) || null;
    }
}

// Instancia global
const dataLoader = new DataLoader();

// Exportar para uso global
window.dataLoader = dataLoader;
window.DataLoader = DataLoader;