// usuarios.js - Gestión de usuarios

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
        return;
    }

    // Verificar permisos para gestionar usuarios
    checkUserPermissions();
    
    // Cargar lista de usuarios
    loadUsers();
    
    // Configurar event listeners
    setupEventListeners();
});

// Función para verificar permisos de usuarios
function checkUserPermissions() {
    const userRole = getCurrentUserRole();
    const addUserBtn = document.getElementById('addUserBtn');
    
    // Solo admin y recepcionista pueden gestionar usuarios
    if (addUserBtn) {
        if (userRole === 'admin' || userRole === 'recepcionista') {
            addUserBtn.style.display = 'block';
        } else {
            addUserBtn.style.display = 'none';
            showError('No tienes permisos para gestionar usuarios');
            navigateTo('dashboard.html');
        }
    }
}

// Función para cargar lista de usuarios
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const usuarios = data.usuarios || data;
            
            if (usuarios.length === 0) {
                notifications.showInfo('No hay usuarios registrados');
            }
            
            displayUsers(usuarios);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al cargar los usuarios';
            
            if (response.status === 404) {
                notifications.showContextError('usuarios', 'not_found');
            } else if (response.status === 403) {
                notifications.showContextError('usuarios', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('usuarios', 'load');
        }
    }
}

// Función para mostrar usuarios en la interfaz
function displayUsers(usuarios) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (usuarios.length === 0) {
        usersList.innerHTML = '<p class="no-data">No hay usuarios registrados</p>';
        return;
    }

    const usersHTML = usuarios.map(usuario => `
        <div class="user-card" data-id="${usuario._id || usuario.id}">
            <div class="user-info">
                <h3>${usuario.nombre}</h3>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Rol:</strong> ${getRoleDisplayName(usuario.rol)}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${usuario.direccion || 'N/A'}</p>
                <p><strong>Fecha de registro:</strong> ${formatDate(usuario.fecha_registro)}</p>
            </div>
            <div class="user-actions">
                ${canEditUser() ? `<button class="btn-edit" onclick="editUser('${usuario._id || usuario.id}')">Editar</button>` : ''}
                ${canDeleteUser(usuario._id || usuario.id) ? `<button class="btn-delete" onclick="deleteUser('${usuario._id || usuario.id}')">Eliminar</button>` : ''}
            </div>
        </div>
    `).join('');

    usersList.innerHTML = usersHTML;
}

// Función para obtener nombre de rol para mostrar
function getRoleDisplayName(role) {
    const roleNames = {
        'cliente': 'Cliente',
        'veterinario': 'Veterinario',
        'recepcionista': 'Recepcionista',
        'admin': 'Administrador'
    };
    return roleNames[role] || role;
}

// Función para verificar si puede editar usuarios
function canEditUser() {
    const userRole = getCurrentUserRole();
    return userRole === 'admin' || userRole === 'recepcionista';
}

// Función para verificar si puede eliminar usuarios
function canDeleteUser(userId) {
    const userRole = getCurrentUserRole();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Solo admin puede eliminar usuarios
    if (userRole !== 'admin') return false;
    
    // No puede eliminarse a sí mismo
    if (currentUser._id === userId || currentUser.id === userId) return false;
    
    return true;
}

// Función para configurar event listeners
function setupEventListeners() {
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    const closeUserModal = document.getElementById('closeUserModal');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const userForm = document.getElementById('userForm');

    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            openUserModal();
        });
    }

    if (closeUserModal) {
        closeUserModal.addEventListener('click', function() {
            closeUserModal();
        });
    }

    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', function() {
            closeUserModal();
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }

    // Cerrar modal al hacer clic fuera de él
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === userModal) {
                closeUserModal();
            }
        });
    }
}

// Función para abrir modal de usuario
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');
    
    if (userId) {
        modalTitle.textContent = 'Editar Usuario';
        loadUserData(userId);
        form.dataset.userId = userId;
    } else {
        modalTitle.textContent = 'Nuevo Usuario';
        form.reset();
        delete form.dataset.userId;
    }
    
    modal.style.display = 'block';
}

// Función para cerrar modal de usuario
function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
}

// Función para cargar datos de usuario
async function loadUserData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const usuario = await response.json();
            fillUserForm(usuario);
        } else {
            if (response.status === 404) {
                notifications.showError('El usuario no fue encontrado.');
            } else {
                notifications.showContextError('usuarios', 'load');
            }
        }
    } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('usuarios', 'load');
        }
    }
}

// Función para llenar formulario con datos de usuario
function fillUserForm(usuario) {
    const form = document.getElementById('userForm');
    
    form.nombre.value = usuario.nombre || '';
    form.email.value = usuario.email || '';
    form.telefono.value = usuario.telefono || '';
    form.direccion.value = usuario.direccion || '';
    form.rol.value = usuario.rol || '';
    
    // En modo edición, hacer el campo de contraseña opcional
    const passwordField = form.password;
    if (passwordField) {
        passwordField.required = false;
        passwordField.placeholder = 'Dejar en blanco para mantener la contraseña actual';
    }
}

// Función para manejar envío del formulario
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = form.dataset.userId;
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const userData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        direccion: formData.get('direccion'),
        rol: formData.get('rol')
    };
    
    // Agregar contraseña solo si se proporciona
    const password = formData.get('password');
    if (password) {
        userData.password = password;
    }
    
    try {
        let response;
        if (userId) {
            // Actualizar usuario existente
            response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Crear nuevo usuario
            response = await fetch(`${API_BASE_URL}/auth/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(userData)
            });
        }

        if (response.ok) {
            notifications.showSuccess(userId ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
            closeUserModal();
            loadUsers(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al guardar el usuario';
            
            if (response.status === 400) {
                notifications.showError('Datos inválidos. Verifica la información ingresada.');
            } else if (response.status === 409) {
                notifications.showError('Ya existe un usuario con ese email.');
            } else if (response.status === 403) {
                notifications.showContextError('usuarios', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('usuarios', userId ? 'update' : 'create');
        }
    }
}

// Función para editar usuario
function editUser(userId) {
    openUserModal(userId);
}

// Función para eliminar usuario
async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            notifications.showSuccess('Usuario eliminado exitosamente');
            loadUsers(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al eliminar el usuario';
            
            if (response.status === 404) {
                notifications.showError('El usuario no fue encontrado.');
            } else if (response.status === 403) {
                notifications.showContextError('usuarios', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('usuarios', 'delete');
        }
    }
}

// Función para filtrar usuarios por rol
function filterUsersByRole(role) {
    const userCards = document.querySelectorAll('.user-card');
    
    userCards.forEach(card => {
        const roleElement = card.querySelector('p:nth-child(3)');
        const cardRole = roleElement ? roleElement.textContent.toLowerCase() : '';
        
        if (role === 'todos' || cardRole.includes(role.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para buscar usuarios
function searchUsers(query) {
    const userCards = document.querySelectorAll('.user-card');
    const searchTerm = query.toLowerCase();

    userCards.forEach(card => {
        const userName = card.querySelector('h3').textContent.toLowerCase();
        const userEmail = card.querySelector('p:nth-child(2)').textContent.toLowerCase();
        
        if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Funciones de utilidad para mostrar mensajes (mantenidas para compatibilidad)
function showSuccess(message) {
    notifications.showSuccess(message);
}

function showError(message) {
    notifications.showError(message);
}

// Función para obtener el rol del usuario actual
function getCurrentUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.rol || '';
} 