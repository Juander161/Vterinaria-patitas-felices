// dashboard.js - Lógica del dashboard principal

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
        return;
    }

    // Cargar información del usuario
    loadUserInfo();
    
    // Mostrar dashboard según el rol
    showDashboardByRole();
    
    // Configurar event listeners
    setupEventListeners();
});

// Función para cargar información del usuario
function loadUserInfo() {
    const user = auth.getUser();
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = user.nombre || 'Usuario';
    }
    
    if (userRoleElement) {
        const roleNames = {
            'cliente': 'Cliente',
            'veterinario': 'Veterinario',
            'recepcionista': 'Recepcionista',
            'admin': 'Administrador'
        };
        userRoleElement.textContent = roleNames[user.rol] || user.rol;
    }
}

// Función para mostrar dashboard según el rol
function showDashboardByRole() {
    const user = auth.getUser();
    const userRole = user.rol;
    
    // Ocultar todos los dashboards
    const allDashboards = document.querySelectorAll('.role-dashboard');
    allDashboards.forEach(dashboard => {
        dashboard.style.display = 'none';
    });
    
    // Mostrar dashboard correspondiente al rol
    const targetDashboard = document.getElementById(`${userRole}Dashboard`);
    if (targetDashboard) {
        targetDashboard.style.display = 'block';
    }
}

// Función para configurar event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.logout();
        });
    }
    
    // Configurar click handlers para las tarjetas del dashboard
    setupDashboardCards();
}

// Función para configurar las tarjetas del dashboard
function setupDashboardCards() {
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-target');
            if (targetPage) {
                navigateTo(targetPage);
            }
        });
    });
}

// Función para actualizar el dashboard
function updateDashboard() {
    loadUserInfo();
    showDashboardByRole();
}

// Función para mostrar estadísticas del dashboard (opcional)
function loadDashboardStats() {
    const user = auth.getUser();
    const userRole = user.rol;
    
    // Aquí se pueden cargar estadísticas específicas según el rol
    switch (userRole) {
        case 'cliente':
            loadClientStats();
            break;
        case 'veterinario':
            loadVeterinarianStats();
            break;
        case 'recepcionista':
            loadReceptionistStats();
            break;
        case 'admin':
            loadAdminStats();
            break;
    }
}

// Función para cargar estadísticas del cliente
async function loadClientStats() {
    try {
        // Aquí se pueden hacer llamadas a la API para obtener estadísticas
        // Por ejemplo: número de mascotas, citas pendientes, etc.
        console.log('Cargando estadísticas del cliente...');
    } catch (error) {
        console.error('Error al cargar estadísticas del cliente:', error);
    }
}

// Función para cargar estadísticas del veterinario
async function loadVeterinarianStats() {
    try {
        // Aquí se pueden hacer llamadas a la API para obtener estadísticas
        // Por ejemplo: citas del día, historiales pendientes, etc.
        console.log('Cargando estadísticas del veterinario...');
    } catch (error) {
        console.error('Error al cargar estadísticas del veterinario:', error);
    }
}

// Función para cargar estadísticas del recepcionista
async function loadReceptionistStats() {
    try {
        // Aquí se pueden hacer llamadas a la API para obtener estadísticas
        // Por ejemplo: citas pendientes, usuarios registrados hoy, etc.
        console.log('Cargando estadísticas del recepcionista...');
    } catch (error) {
        console.error('Error al cargar estadísticas del recepcionista:', error);
    }
}

// Función para cargar estadísticas del admin
async function loadAdminStats() {
    try {
        // Aquí se pueden hacer llamadas a la API para obtener estadísticas
        // Por ejemplo: total de usuarios, mascotas, citas, etc.
        console.log('Cargando estadísticas del administrador...');
    } catch (error) {
        console.error('Error al cargar estadísticas del administrador:', error);
    }
}

// Función para refrescar el dashboard
function refreshDashboard() {
    updateDashboard();
    loadDashboardStats();
}

// Exportar funciones para uso global
window.updateDashboard = updateDashboard;
window.loadDashboardStats = loadDashboardStats;
window.refreshDashboard = refreshDashboard; 