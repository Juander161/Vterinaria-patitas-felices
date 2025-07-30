// perfil.js - Gestión del perfil de usuario

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
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
        const user = await auth.getProfile();
        if (user) {
            fillProfileForm(user);
        } else {
            notifications.showContextError('perfil', 'load');
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('perfil', 'load');
        }
    }
}

// Función para llenar el formulario con los datos del usuario
function fillProfileForm(user) {
    const form = document.getElementById('profileForm');
    if (!form) return;

    // Llenar campos del formulario
    const fields = {
        'nombre': user.nombre,
        'email': user.email,
        'rol': user.rol,
        'telefono': user.telefono,
        'direccion': user.direccion
    };

    Object.keys(fields).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = fields[fieldName] || '';
        }
    });

    // Mostrar información del rol
    const roleNames = {
        'cliente': 'Cliente',
        'veterinario': 'Veterinario',
        'recepcionista': 'Recepcionista',
        'admin': 'Administrador'
    };

    const rolField = form.querySelector('[name="rol"]');
    if (rolField) {
        rolField.value = roleNames[user.rol] || user.rol;
    }
}

// Función para configurar event listeners
function setupEventListeners() {
    const form = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (form) {
        form.addEventListener('submit', handleProfileUpdate);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            navigateTo('dashboard.html');
        });
    }
}

// Función para manejar la actualización del perfil
async function handleProfileUpdate(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    
    const updateData = {
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        direccion: formData.get('direccion')
    };

    try {
        // Verificar que getCurrentUserId esté disponible
        if (typeof getCurrentUserId !== 'function') {
            throw new Error('Función getCurrentUserId no está disponible');
        }

        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }

        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await handleApiResponse(response);

        if (data && data.success) {
            notifications.showSuccess('Perfil actualizado correctamente');
            
            // Actualizar datos en localStorage
            const updatedUser = data.usuario || data.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Recargar datos del perfil
            await loadProfile();
        } else {
            notifications.showError('Error al actualizar el perfil');
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showError(`Error al actualizar perfil: ${error.message}`);
        }
    }
}

// Función para validar el formulario
function validateProfileForm(formData) {
    const errors = [];

    if (!formData.get('nombre').trim()) {
        errors.push('El nombre es requerido');
    }

    if (!formData.get('telefono').trim()) {
        errors.push('El teléfono es requerido');
    }

    if (!formData.get('direccion').trim()) {
        errors.push('La dirección es requerida');
    }

    return errors;
}

// Función para mostrar errores de validación
function showValidationErrors(errors) {
    if (errors.length > 0) {
        notifications.showError(errors.join('\n'));
        return false;
    }
    return true;
}

// Función para actualizar la información del usuario en la interfaz
function updateUserInfo(user) {
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

// Función para cambiar contraseña (opcional)
async function changePassword(currentPassword, newPassword) {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.ok) {
            notifications.showSuccess('Contraseña actualizada correctamente');
            return true;
        } else {
            const error = await response.json();
            const errorMessage = error.message || 'Error al cambiar la contraseña';
            
            if (response.status === 400) {
                notifications.showError('La contraseña actual es incorrecta.');
            } else if (response.status === 422) {
                notifications.showError('La nueva contraseña no cumple con los requisitos.');
            } else {
                notifications.showError(errorMessage);
            }
            return false;
        }
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('perfil', 'password');
        }
        return false;
    }
}

// Función para exportar datos del perfil (opcional)
function exportProfileData() {
    const user = auth.getUser();
    const dataStr = JSON.stringify(user, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `perfil_${user.nombre}_${Date.now()}.json`;
    link.click();
}

// Función para limpiar el formulario
function clearProfileForm() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.reset();
    }
}

// Exportar funciones para uso global
window.loadProfile = loadProfile;
window.handleProfileUpdate = handleProfileUpdate;
window.changePassword = changePassword;
window.exportProfileData = exportProfileData;
window.clearProfileForm = clearProfileForm; 