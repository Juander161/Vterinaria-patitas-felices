// notifications.js - Sistema de notificaciones personalizado

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    // Mostrar notificación de éxito
    showSuccess(message, duration = 5000) {
        this.showNotification(message, 'success', duration);
    }

    // Mostrar notificación de error
    showError(message, duration = 7000) {
        this.showNotification(message, 'error', duration);
    }

    // Mostrar notificación de advertencia
    showWarning(message, duration = 6000) {
        this.showNotification(message, 'warning', duration);
    }

    // Mostrar notificación de información
    showInfo(message, duration = 5000) {
        this.showNotification(message, 'info', duration);
    }

    // Mostrar notificación personalizada
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotificationElement(message, type);
        const container = document.getElementById('notification-container');
        
        if (container) {
            container.appendChild(notification);
            
            // Animar entrada
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            // Auto-remover después del tiempo especificado
            if (duration > 0) {
                setTimeout(() => {
                    this.removeNotification(notification);
                }, duration);
            }
        }
    }

    // Crear elemento de notificación
    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIconForType(type);
        const title = this.getTitleForType(type);
        
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${icon}</span>
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        return notification;
    }

    // Obtener icono según el tipo
    getIconForType(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Obtener título según el tipo
    getTitleForType(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || titles.info;
    }

    // Remover notificación con animación
    removeNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    // Limpiar todas las notificaciones
    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Mostrar error específico de API
    showApiError(error, context = '') {
        let message = 'Ha ocurrido un error';
        
        if (error.response) {
            // Error de respuesta del servidor
            const status = error.response.status;
            const data = error.response.data || {};
            
            switch (status) {
                case 400:
                    message = data.msg || data.message || 'Datos inválidos';
                    break;
                case 401:
                    message = 'No tienes permisos para realizar esta acción';
                    break;
                case 403:
                    message = 'Acceso denegado';
                    break;
                case 404:
                    message = context ? `No se encontró ${context}` : 'Recurso no encontrado';
                    break;
                case 409:
                    message = data.msg || data.message || 'Conflicto con datos existentes';
                    break;
                case 422:
                    message = data.msg || data.message || 'Datos de validación incorrectos';
                    break;
                case 500:
                    message = 'Error interno del servidor';
                    break;
                default:
                    message = data.msg || data.message || `Error ${status}`;
            }
        } else if (error.request) {
            // Error de red
            message = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
            // Error de JavaScript
            message = error.message || 'Error inesperado';
        }
        
        this.showError(message);
    }

    // Mostrar error específico para diferentes contextos
    showContextError(context, error) {
        const contextMessages = {
            'mascotas': {
                'load': 'Error al cargar las mascotas',
                'create': 'Error al crear la mascota',
                'update': 'Error al actualizar la mascota',
                'delete': 'Error al eliminar la mascota',
                'not_found': 'No se encontraron mascotas',
                'no_permission': 'No tienes permisos para gestionar mascotas'
            },
            'citas': {
                'load': 'Error al cargar las citas',
                'create': 'Error al crear la cita',
                'update': 'Error al actualizar la cita',
                'delete': 'Error al eliminar la cita',
                'not_found': 'No se encontraron citas',
                'no_permission': 'No tienes permisos para gestionar citas'
            },
            'historiales': {
                'load': 'Error al cargar los historiales médicos',
                'create': 'Error al crear el historial médico',
                'update': 'Error al actualizar el historial médico',
                'delete': 'Error al eliminar el historial médico',
                'not_found': 'No se encontraron historiales médicos',
                'no_permission': 'No tienes permisos para gestionar historiales médicos'
            },
            'perfil': {
                'load': 'Error al cargar el perfil',
                'update': 'Error al actualizar el perfil',
                'password': 'Error al cambiar la contraseña'
            },
            'usuarios': {
                'load': 'Error al cargar los usuarios',
                'create': 'Error al crear el usuario',
                'update': 'Error al actualizar el usuario',
                'delete': 'Error al eliminar el usuario',
                'not_found': 'No se encontraron usuarios',
                'no_permission': 'No tienes permisos para gestionar usuarios'
            }
        };

        const contextError = contextMessages[context];
        if (contextError && contextError[error]) {
            this.showError(contextError[error]);
        } else {
            this.showError(`Error en ${context}: ${error}`);
        }
    }
}

// Instancia global del sistema de notificaciones
const notifications = new NotificationSystem();

// Funciones de conveniencia para compatibilidad con código existente
function showSuccess(message) {
    notifications.showSuccess(message);
}

function showError(message) {
    notifications.showError(message);
}

function showWarning(message) {
    notifications.showWarning(message);
}

function showInfo(message) {
    notifications.showInfo(message);
} 