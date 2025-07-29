// router.js - Redirección y control de rutas

// Función para navegar a una página
function navigateTo(page) {
    window.location.href = page;
}

// Función para verificar permisos de acceso
function checkAccess(allowedRoles = []) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.rol;
    
    // Si no hay roles especificados, permitir acceso a todos los usuarios autenticados
    if (allowedRoles.length === 0) {
        return true;
    }
    
    // Verificar si el rol del usuario está en la lista de roles permitidos
    return allowedRoles.includes(userRole);
}

// Función para redirigir según el rol después del login
function redirectByRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.rol;
    
    switch (userRole) {
        case 'cliente':
        case 'veterinario':
        case 'recepcionista':
        case 'admin':
            navigateTo('dashboard.html');
            break;
        default:
            navigateTo('login.html');
    }
}

// Función para proteger páginas según el rol
function protectPage(allowedRoles = []) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigateTo('login.html');
        return;
    }
    
    if (allowedRoles.length > 0 && !checkAccess(allowedRoles)) {
        alert('No tienes permisos para acceder a esta página');
        navigateTo('dashboard.html');
        return;
    }
}

// Función para mostrar/ocultar elementos según el rol
function showByRole(elementId, allowedRoles = []) {
    const element = document.getElementById(elementId);
    if (element) {
        const hasAccess = checkAccess(allowedRoles);
        element.style.display = hasAccess ? 'block' : 'none';
    }
}

// Función para mostrar/ocultar elementos según el rol (inline)
function showByRoleInline(elementId, allowedRoles = []) {
    const element = document.getElementById(elementId);
    if (element) {
        const hasAccess = checkAccess(allowedRoles);
        element.style.display = hasAccess ? 'inline' : 'none';
    }
}

// Función para habilitar/deshabilitar elementos según el rol
function enableByRole(elementId, allowedRoles = []) {
    const element = document.getElementById(elementId);
    if (element) {
        const hasAccess = checkAccess(allowedRoles);
        element.disabled = !hasAccess;
    }
}

// Función para obtener el rol del usuario actual
function getCurrentUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.rol;
}

// Función para obtener el ID del usuario actual
function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
}

// Función para verificar si el usuario es admin
function isAdmin() {
    return getCurrentUserRole() === 'admin';
}

// Función para verificar si el usuario es veterinario
function isVeterinario() {
    return getCurrentUserRole() === 'veterinario';
}

// Función para verificar si el usuario es recepcionista
function isRecepcionista() {
    return getCurrentUserRole() === 'recepcionista';
}

// Función para verificar si el usuario es cliente
function isCliente() {
    return getCurrentUserRole() === 'cliente';
}

// Función para mostrar mensaje de error
function showError(message) {
    alert(message);
}

// Función para mostrar mensaje de éxito
function showSuccess(message) {
    alert(message);
}

// Función para confirmar acción
function confirmAction(message) {
    return confirm(message);
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

// Exportar funciones para uso global
window.navigateTo = navigateTo;
window.checkAccess = checkAccess;
window.redirectByRole = redirectByRole;
window.protectPage = protectPage;
window.showByRole = showByRole;
window.showByRoleInline = showByRoleInline;
window.enableByRole = enableByRole;
window.getCurrentUserRole = getCurrentUserRole;
window.getCurrentUserId = getCurrentUserId;
window.isAdmin = isAdmin;
window.isVeterinario = isVeterinario;
window.isRecepcionista = isRecepcionista;
window.isCliente = isCliente;
window.showError = showError;
window.showSuccess = showSuccess;
window.confirmAction = confirmAction;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getAppointmentStatus = getAppointmentStatus;
window.getAppointmentStatusColor = getAppointmentStatusColor; 