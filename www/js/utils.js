// utils.js - Utilidades básicas y funciones globales

// Configuración global
window.API_BASE_URL = 'http://localhost:3000/api';

// Funciones de navegación mejoradas
function navigateTo(page) {
    console.log('Navegando a:', page);
    
    // Asegurar que la página tenga extensión .html
    if (!page.includes('.html')) {
        page += '.html';
    }
    
    // Detectar si estamos en una subcarpeta
    const currentPath = window.location.pathname;
    const isInViews = currentPath.includes('/views/');
    const isRootIndex = currentPath.endsWith('/') || currentPath.endsWith('index.html');
    
    let targetUrl = page;
    
    // Si estamos en la raíz y queremos ir a una vista
    if (isRootIndex && !page.includes('views/') && !page.includes('../')) {
        targetUrl = 'views/' + page;
    }
    // Si estamos en views y queremos ir a otra vista
    else if (isInViews && !page.includes('../') && !page.includes('views/')) {
        targetUrl = page; // Ya estamos en views, usar directamente
    }
    // Si estamos en views y queremos ir a la raíz
    else if (isInViews && (page === 'index.html' || page.includes('../'))) {
        targetUrl = page.startsWith('../') ? page : '../' + page;
    }
    
    console.log('Redirigiendo a:', targetUrl);
    window.location.href = targetUrl;
}

function goToDashboard() {
    console.log('Volviendo al dashboard');
    navigateTo('dashboard.html');
}

function goToLogin() {
    console.log('Redirigiendo al login');
    navigateTo('login.html');
}

function logout() {
    console.log('Cerrando sesión...');
    
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Mostrar mensaje de despedida
    showSuccess('Sesión cerrada correctamente');
    
    // Redirigir al login
    setTimeout(() => {
        const currentPath = window.location.pathname;
        console.log('Ruta actual:', currentPath);
        
        if (currentPath.includes('/views/')) {
            console.log('Redirigiendo desde views a login.html');
            window.location.href = 'login.html';
        } else {
            console.log('Redirigiendo desde raíz a views/login.html');
            window.location.href = 'views/login.html';
        }
    }, 1500); // Dar tiempo para ver la notificación
}

// Funciones para modales
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        console.log('Modal abierto:', modalId);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal cerrado:', modalId);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Función para manejar respuestas de API
async function handleApiResponse(response) {
    if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return { success: true, message: await response.text() };
        }
    }
    
    // Manejar errores
    let errorMessage = 'Error desconocido';
    
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.msg || `Error ${response.status}`;
    } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    // Manejar token expirado
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }
    
    throw new Error(errorMessage);
}

// Sistema de notificaciones mejorado
function showNotification(message, type = 'info') {
    console.log(`Mostrando notificación ${type}:`, message);
    
    // Crear contenedor si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 99999 !important;
            max-width: 400px !important;
            pointer-events: none !important;
        `;
        document.body.appendChild(container);
        console.log('Contenedor de notificaciones creado');
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : '#d1ecf1';
    const textColor = type === 'error' ? '#721c24' : type === 'success' ? '#155724' : type === 'warning' ? '#856404' : '#0c5460';
    const borderColor = type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb';
    
    notification.style.cssText = `
        background: ${bgColor} !important;
        color: ${textColor} !important;
        border: 1px solid ${borderColor} !important;
        padding: 15px !important;
        margin-bottom: 10px !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        opacity: 0 !important;
        transform: translateX(100%) !important;
        transition: all 0.3s ease !important;
        pointer-events: auto !important;
        position: relative !important;
        min-width: 300px !important;
    `;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="display: flex; align-items: flex-start; gap: 8px; flex: 1;">
                <span style="font-size: 16px;">${icon}</span>
                <span style="flex: 1; word-wrap: break-word;">${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; padding: 0; margin: 0; line-height: 1; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;"
                    onmouseover="this.style.background='rgba(0,0,0,0.1)'"
                    onmouseout="this.style.background='none'">&times;</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    console.log('Notificación agregada al DOM');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showWarning(message) {
    showNotification(message, 'warning');
}

// Función de prueba para notificaciones
function testNotifications() {
    console.log('Probando notificaciones...');
    showSuccess('Esta es una notificación de éxito');
    setTimeout(() => showError('Esta es una notificación de error'), 1000);
    setTimeout(() => showInfo('Esta es una notificación de información'), 2000);
    setTimeout(() => showWarning('Esta es una advertencia'), 3000);
}

// Configurar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, configurando event listeners...');
    
    // Configurar botones de logout
    const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    // Configurar botones de volver al dashboard
    const dashboardBtns = document.querySelectorAll('[onclick*="dashboard"], .back-to-dashboard');
    dashboardBtns.forEach(btn => {
        btn.removeAttribute('onclick'); // Remover onclick inline
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            goToDashboard();
        });
    });
    
    // Configurar botones de cerrar modal
    const closeBtns = document.querySelectorAll('.close, .modal-close, #closeModal, #closeAppointmentModal, #closeHistoryModal, #closeUserModal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Configurar botones de cancelar
    const cancelBtns = document.querySelectorAll('#cancelPetBtn, #cancelAppointmentBtn, #cancelHistoryBtn, #cancelUserBtn, .cancel-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                // Limpiar formulario
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        });
    });
    
    // Cerrar modales al hacer clic fuera
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    console.log('Event listeners configurados correctamente');
});

// Agregar estilos para notificaciones
const style = document.createElement('style');
style.textContent = `
    #notification-container {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 99999 !important;
        max-width: 400px !important;
        pointer-events: none !important;
    }
    
    #notification-container > div {
        pointer-events: auto !important;
        margin-bottom: 10px !important;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    /* Asegurar que las notificaciones estén por encima de todo */
    .notification-container {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 99999 !important;
    }
`;
document.head.appendChild(style);

// Función para obtener el rol del usuario actual
function getCurrentUserRole() {
    if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
        const user = auth.getUser();
        return user.rol || 'cliente';
    }
    return null;
}

// Función para verificar si el usuario tiene un rol específico
function hasRole(role) {
    const currentRole = getCurrentUserRole();
    return currentRole === role;
}

// Función para verificar si el usuario tiene permisos para una acción
function hasPermission(action) {
    const role = getCurrentUserRole();
    if (!role) return false;
    
    const permissions = {
        'admin': ['all'],
        'veterinario': ['mascotas', 'historiales', 'citas', 'perfil'],
        'recepcionista': ['usuarios', 'citas', 'perfil'],
        'cliente': ['mascotas', 'citas', 'historiales', 'perfil']
    };
    
    const userPermissions = permissions[role] || [];
    return userPermissions.includes('all') || userPermissions.includes(action);
}

// Exportar funciones globalmente
window.navigateTo = navigateTo;
window.goToDashboard = goToDashboard;
window.goToLogin = goToLogin;
window.logout = logout;
window.showModal = showModal;
window.hideModal = hideModal;
window.closeAllModals = closeAllModals;
window.handleApiResponse = handleApiResponse;
window.showNotification = showNotification;
window.showSuccess = showSuccess;
window.showError = showError;
window.showInfo = showInfo;
window.showWarning = showWarning;
window.testNotifications = testNotifications;
window.getCurrentUserRole = getCurrentUserRole;
window.hasRole = hasRole;
window.hasPermission = hasPermission;