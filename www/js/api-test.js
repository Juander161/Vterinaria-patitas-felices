// api-test.js - Herramientas de prueba para la API

// Función para probar la conexión con la API
window.testApiConnection = async function() {
    try {
        console.log('🔍 Probando conexión con la API...');
        showInfo('Probando conexión con la API...');
        
        const response = await fetch(`${window.API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API conectada correctamente:', data);
            showSuccess('API conectada correctamente');
            return true;
        } else {
            console.log('❌ Error de conexión:', response.status);
            showError(`Error de conexión: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
        showError('Error de conexión con la API. Verifica que esté ejecutándose.');
        return false;
    }
};

// Función para probar autenticación
window.testAuth = async function() {
    try {
        console.log('🔍 Probando autenticación...');
        showInfo('Probando autenticación...');
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No hay token de autenticación');
            showWarning('No hay token de autenticación');
            return false;
        }
        
        const response = await fetch(`${window.API_BASE_URL}/auth/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token válido:', data);
            showSuccess('Token de autenticación válido');
            return true;
        } else {
            console.log('❌ Token inválido:', response.status);
            showError('Token de autenticación inválido');
            return false;
        }
    } catch (error) {
        console.log('❌ Error al verificar token:', error.message);
        showError('Error al verificar autenticación');
        return false;
    }
};

// Función para probar todos los endpoints principales
window.testAllEndpoints = async function() {
    console.log('🔍 Probando todos los endpoints...');
    showInfo('Iniciando pruebas de endpoints...');
    
    const endpoints = [
        { name: 'Health Check', url: '/health', method: 'GET', auth: false },
        { name: 'Login', url: '/auth/login', method: 'POST', auth: false },
        { name: 'Perfil', url: '/auth/perfil', method: 'GET', auth: true },
        { name: 'Mascotas', url: '/mascotas', method: 'GET', auth: true },
        { name: 'Citas', url: '/citas', method: 'GET', auth: true },
        { name: 'Historiales', url: '/historiales', method: 'GET', auth: true },
        { name: 'Usuarios', url: '/usuarios', method: 'GET', auth: true }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const headers = { 'Content-Type': 'application/json' };
            
            if (endpoint.auth) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } el