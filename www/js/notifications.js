// notifications.js - Sistema de notificaciones independiente

// Sistema de notificaciones mejorado
class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxVisible = 5;
        this.init();
    }

    init() {
        this.createContainer();
        this.addStyles();
    }

    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'notification-system-container';
        this.container.className = 'notification-system-container';
        document.body.appendChild(this.container);
    }

    addStyles() {
        if (document.getElementById('notification-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-system-styles';
        style.textContent = `
            .notification-system-container {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                z-index: 99999 !important;
                max-width: 400px !important;
                pointer-events: none !important;
            }

            .notification-item {
                background: white !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                margin-bottom: 10px !important;
                padding: 16px !important;
                pointer-events: auto !important;
                transform: translateX(100%) !important;
                opacity: 0 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                border-left: 4px solid #ccc !important;
                font-family: 'Inter', sans-serif !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                position: relative !important;
                overflow: hidden !important;
            }

            .notification-item.show {
                transform: translateX(0) !important;
                opacity: 1 !important;
            }

            .notification-item.success {
                border-left-color: #4CAF50 !important;
                background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%) !important;
            }

            .notification-item.error {
                border-left-color: #f44336 !important;
                background: linear-gradient(135deg, #fff8f8 0%, #ffe8e8 100%) !important;
            }

            .notification-item.warning {
                border-left-color: #ff9800 !important;
                background: linear-gradient(135deg, #fffaf0 0%, #fff3e0 100%) !important;
            }

            .notification-item.info {
                border-left-color: #2196F3 !important;
                background: linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%) !important;
            }

            .notification-content {
                display: flex !important;
                align-items: flex-start !important;
                gap: 12px !important;
            }

            .notification-icon {
                font-size: 20px !important;
                flex-shrink: 0 !important;
                margin-top: 2px !important;
            }

            .notification-message {
                flex: 1 !important;
                color: #333 !important;
                font-weight: 500 !important;
            }

            .notification-close {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                background: none !important;
                border: none !important;
                font-size: 18px !important;
                cursor: pointer !important;
                color: #666 !important;
                width: 24px !important;
                height: 24px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 50% !important;
                transition: all 0.2s ease !important;
            }

            .notification-close:hover {
                background: rgba(0,0,0,0.1) !important;
                color: #333 !important;
            }

            .notification-progress {
                position: absolute !important;
                bottom: 0 !important;
                left: 0 !important;
                height: 3px !important;
                background: rgba(0,0,0,0.2) !important;
                transition: width linear !important;
            }

            .notification-item.success .notification-progress {
                background: #4CAF50 !important;
            }

            .notification-item.error .notification-progress {
                background: #f44336 !important;
            }

            .notification-item.warning .notification-progress {
                background: #ff9800 !important;
            }

            .notification-item.info .notification-progress {
                background: #2196F3 !important;
            }

            @media (max-width: 768px) {
                .notification-system-container {
                    left: 10px !important;
                    right: 10px !important;
                    max-width: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type, duration);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Mostrar animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remover
        if (duration > 0) {
            this.startProgress(notification, duration);
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        // Limitar notificaciones visibles
        this.limitVisible();

        return notification;
    }

    createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification-item ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || icons.info}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
            ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        // Event listener para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(notification);
        });

        return notification;
    }

    startProgress(notification, duration) {
        const progress = notification.querySelector('.notification-progress');
        if (progress) {
            progress.style.width = '100%';
            progress.style.transitionDuration = `${duration}ms`;
            setTimeout(() => {
                progress.style.width = '0%';
            }, 10);
        }
    }

    remove(notification) {
        if (!notification.parentElement) return;

        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                this.notifications = this.notifications.filter(n => n !== notification);
            }
        }, 300);
    }

    limitVisible() {
        while (this.notifications.length > this.maxVisible) {
            const oldest = this.notifications[0];
            this.remove(oldest);
        }
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }

    // Métodos de conveniencia
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Crear instancia global
window.notificationSystem = new NotificationSystem();

// Funciones globales de conveniencia (compatibilidad con código existente)
window.showNotification = function(message, type = 'info') {
    return window.notificationSystem.show(message, type);
};

window.showSuccess = function(message) {
    return window.notificationSystem.success(message);
};

window.showError = function(message) {
    return window.notificationSystem.error(message);
};

window.showWarning = function(message) {
    return window.notificationSystem.warning(message);
};

window.showInfo = function(message) {
    return window.notificationSystem.info(message);
};

console.log('Sistema de notificaciones inicializado');