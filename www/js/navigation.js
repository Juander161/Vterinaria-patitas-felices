// navigation.js - Manejo de navegación y logout común para todas las páginas

// Instancia global de auth
const auth = new Auth();

// Función para configurar la navegación común
function setupCommonNavigation() {
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                auth.logout();
            }
        });
    }

    // Configurar botón de volver al dashboard
    const backToDashboardBtn = document.querySelector('button[onclick*="dashboard.html"]');
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('dashboard.html');
        });
    }

    // Mostrar información del usuario si está disponible
    displayUserInfo();
}

// Función para mostrar información del usuario
function displayUserInfo() {
    const user = auth.getUser();
    if (user && user.nombre) {
        // Buscar elementos donde mostrar la información del usuario
        const userNameElements = document.querySelectorAll('.user-name, #userName');
        const userRoleElements = document.querySelectorAll('.user-role, #userRole');
        
        userNameElements.forEach(element => {
            element.textContent = user.nombre;
        });
        
        userRoleElements.forEach(element => {
            const roleNames = {
                'cliente': 'Cliente',
                'veterinario': 'Veterinario',
                'recepcionista': 'Recepcionista',
                'admin': 'Administrador'
            };
            element.textContent = roleNames[user.rol] || user.rol;
        });
    }
}

// Función para verificar autenticación
function checkAuthentication() {
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
        return false;
    }
    return true;
}

// Función para verificar permisos según rol
function checkRoleAccess(allowedRoles = []) {
    if (!checkAuthentication()) {
        return false;
    }
    
    const user = auth.getUser();
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        alert('No tienes permisos para acceder a esta página');
        navigateTo('dashboard.html');
        return false;
    }
    return true;
}

// Función para mostrar/ocultar elementos según rol
function showByRole(elementId, allowedRoles = []) {
    const element = document.getElementById(elementId);
    if (element) {
        const user = auth.getUser();
        const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.rol);
        element.style.display = hasAccess ? 'block' : 'none';
    }
}

// Función para habilitar/deshabilitar elementos según rol
function enableByRole(elementId, allowedRoles = []) {
    const element = document.getElementById(elementId);
    if (element) {
        const user = auth.getUser();
        const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.rol);
        element.disabled = !hasAccess;
    }
}

// Función para obtener el rol actual
function getCurrentRole() {
    const user = auth.getUser();
    return user ? user.rol : null;
}

// Función para obtener el ID del usuario actual
function getCurrentUserId() {
    const user = auth.getUser();
    return user ? user.id : null;
}

// Función para verificar si es admin
function isAdmin() {
    return getCurrentRole() === 'admin';
}

// Función para verificar si es veterinario
function isVeterinario() {
    return getCurrentRole() === 'veterinario';
}

// Función para verificar si es recepcionista
function isRecepcionista() {
    return getCurrentRole() === 'recepcionista';
}

// Función para verificar si es cliente
function isCliente() {
    return getCurrentRole() === 'cliente';
}

// Función para mostrar mensaje de confirmación
function showConfirm(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Función para mostrar mensaje de error
function showError(message) {
    alert(message);
}

// Función para mostrar mensaje de éxito
function showSuccess(message) {
    alert(message);
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para formatear fecha y hora
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para obtener el estado de una cita en español
function getAppointmentStatus(status) {
    const statusMap = {
        'programada': 'Programada',
        'confirmada': 'Confirmada',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
}

// Función para obtener el color del estado de una cita
function getAppointmentStatusColor(status) {
    const colorMap = {
        'programada': '#ffc107',
        'confirmada': '#17a2b8',
        'completada': '#28a745',
        'cancelada': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!checkAuthentication()) {
        return;
    }
    
    // Configurar navegación común
    setupCommonNavigation();
    
    // Mostrar información del usuario
    displayUserInfo();
});

// Exportar funciones para uso global
window.setupCommonNavigation = setupCommonNavigation;
window.displayUserInfo = displayUserInfo;
window.checkAuthentication = checkAuthentication;
window.checkRoleAccess = checkRoleAccess;
window.showByRole = showByRole;
window.enableByRole = enableByRole;
window.getCurrentRole = getCurrentRole;
window.getCurrentUserId = getCurrentUserId;
window.isAdmin = isAdmin;
window.isVeterinario = isVeterinario;
window.isRecepcionista = isRecepcionista;
window.isCliente = isCliente;
window.showConfirm = showConfirm;
window.showError = showError;
window.showSuccess = showSuccess;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getAppointmentStatus = getAppointmentStatus;
window.getAppointmentStatusColor = getAppointmentStatusColor; 