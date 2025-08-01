// utils.js - Utilidades básicas y funciones globales

// Configuración global
window.API_BASE_URL = 'http://localhost:3001/api';

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
    console.log('Cerrando sesión');
    
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Mostrar mensaje de despedida
    showSuccess('Sesión cerrada correctamente');
    
    // Redirigir al login después de un breve delay
    setTimeout(() => {
        goToLogin();
    }, 1000);
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

// Sistema de notificaciones simple
function showNotification(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
        border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: inherit;">&times;</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
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

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

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