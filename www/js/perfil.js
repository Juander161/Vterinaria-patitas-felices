// perfil.js - Gestión del perfil de usuario

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar datos del perfil
    loadProfile();
    
    // Configurar event listeners
    setupEventListeners();
});

// Función para cargar datos del perfil
async function loadProfile() {
    try {
        showInfo('Cargando perfil...');
        
        const response = await fetch(`${window.API_BASE_URL}/auth/perfil`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const usuario = data.usuario || data.user || data.data;
            fillProfileForm(usuario);
            showSuccess('Perfil cargado correctamente');
        } else {
            showError('Error al cargar el perfil');
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        showError('Error de conexión. Verifica que la API esté funcionando.');
    }
}

// Función para llenar el formulario con datos del usuario
function fillProfileForm(usuario) {
    const form = document.getElementById('profileForm');
    if (!form) return;

    // Llenar campos del formulario
    const nombreField = form.querySelector('#nombre');
    const emailField = form.querySelector('#email');
    const rolField = form.querySelector('#rol');
    const telefonoField = form.querySelector('#telefono');
    const direccionField = form.querySelector('#direccion');

    if (nombreField) nombreField.value = usuario.nombre || '';
    if (emailField) emailField.value = usuario.email || '';
    if (rolField) {
        const roleNames = {
            'cliente': 'Cliente',
            'veterinario': 'Veterinario',
            'recepcionista': 'Recepcionista',
            'admin': 'Administrador'
        };
        rolField.value = roleNames[usuario.rol] || usuario.rol || '';
    }
    if (telefonoField) telefonoField.value = usuario.telefono || '';
    if (direccionField) direccionField.value = usuario.direccion || '';
}

// Función para configurar event listeners
function setupEventListeners() {
    const profileForm = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Recargar los datos originales
            loadProfile();
        });
    }
}

// Función para manejar envío del formulario
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Recopilar datos del formulario (sin incluir email y rol que son readonly)
    const profileData = {
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        direccion: formData.get('direccion')
    };

    // Validar datos requeridos
    if (!profileData.nombre.trim()) {
        showError('El nombre es requerido');
        return;
    }

    if (!profileData.telefono.trim()) {
        showError('El teléfono es requerido');
        return;
    }

    if (!profileData.direccion.trim()) {
        showError('La dirección es requerida');
        return;
    }

    try {
        showInfo('Actualizando perfil...');
        
        // Obtener el ID del usuario actual
        const user = auth.getUser();
        const userId = user._id || user.id;

        const response = await fetch(`${window.API_BASE_URL}/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            showSuccess('Perfil actualizado exitosamente');
            
            // Actualizar los datos del usuario en localStorage
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Actualizar la instancia de auth
            auth.user = updatedUser;
            
        } else {
            const errorMessage = data.msg || data.message || 'Error al actualizar el perfil';
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        showError('Error de conexión. Verifica tu conexión a internet.');
    }
}

// Funciones de utilidad para mostrar mensajes
function showSuccess(message) {
    if (typeof window.showSuccess === 'function') {
        window.showSuccess(message);
    } else {
        console.log('SUCCESS:', message);
    }
}

function showError(message) {
    if (typeof window.showError === 'function') {
        window.showError(message);
    } else {
        console.error('ERROR:', message);
    }
}

function showInfo(message) {
    if (typeof window.showInfo === 'function') {
        window.showInfo(message);
    } else {
        console.log('INFO:', message);
    }
}