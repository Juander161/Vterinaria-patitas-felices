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
            displayUsers(data.usuarios || data); // La API puede devolver {usuarios: [...]} o directamente el array
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al cargar los usuarios');
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showError('Error al cargar los usuarios');
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
        <div class="user-card" data-id="${usuario.id}">
            <div class="user-info">
                <h3>${usuario.nombre}</h3>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Rol:</strong> ${getRoleDisplayName(usuario.rol)}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono || 'N/A'}</p>
                <p><strong>Dirección:</strong> ${usuario.direccion || 'N/A'}</p>
            </div>
            <div class="user-actions">
                ${canEditUser() ? `<button class="btn-edit" onclick="editUser(${usuario.id})">Editar</button>` : ''}
                ${canDeleteUser(usuario.id) ? `<button class="btn-delete" onclick="deleteUser(${usuario.id})">Eliminar</button>` : ''}
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
    const currentUserId = getCurrentUserId();
    
    // Solo admin puede eliminar usuarios, y no puede eliminarse a sí mismo
    return userRole === 'admin' && userId != currentUserId;
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
        // Modo edición
        modalTitle.textContent = 'Editar Usuario';
        loadUserData(userId);
        form.dataset.userId = userId;
        
        // Ocultar campo de contraseña en edición
        const passwordField = form.querySelector('[name="password"]');
        if (passwordField) {
            passwordField.required = false;
            passwordField.placeholder = 'Dejar vacío para mantener la contraseña actual';
        }
    } else {
        // Modo creación
        modalTitle.textContent = 'Nuevo Usuario';
        form.reset();
        delete form.dataset.userId;
        
        // Mostrar campo de contraseña en creación
        const passwordField = form.querySelector('[name="password"]');
        if (passwordField) {
            passwordField.required = true;
            passwordField.placeholder = 'Contraseña';
        }
    }

    modal.style.display = 'block';
}

// Función para cerrar modal de usuario
function closeUserModal() {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    
    modal.style.display = 'none';
    form.reset();
    delete form.dataset.userId;
}

// Función para cargar datos de un usuario
async function loadUserData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            fillUserForm(data.usuario || data); // La API puede devolver {usuario: {...}} o directamente el objeto
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al cargar datos del usuario');
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        showError('Error al cargar datos del usuario');
    }
}

// Función para llenar formulario con datos de usuario
function fillUserForm(usuario) {
    const form = document.getElementById('userForm');
    if (!form) return;

    const fields = {
        'nombre': usuario.nombre,
        'email': usuario.email,
        'telefono': usuario.telefono,
        'direccion': usuario.direccion,
        'rol': usuario.rol
    };

    Object.keys(fields).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = fields[fieldName] || '';
        }
    });
}

// Función para manejar envío del formulario de usuario
async function handleUserSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const userId = form.dataset.userId;

    const userData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        direccion: formData.get('direccion'),
        rol: formData.get('rol')
    };

    // Solo incluir contraseña si se está creando un usuario nuevo o si se proporcionó
    const password = formData.get('password');
    if (password && password.trim()) {
        userData.password = password;
    }

    try {
        let url, method;
        
        if (userId) {
            // Actualizar usuario existente
            url = `${API_BASE_URL}/usuarios/${userId}`;
            method = 'PUT';
        } else {
            // Crear nuevo usuario
            url = `${API_BASE_URL}/auth/registro`;
            method = 'POST';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showSuccess(userId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            closeUserModal();
            loadUsers(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.msg || error.message || 'Error al guardar el usuario');
        }
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        showError('Error al guardar el usuario');
    }
}

// Función para editar usuario
function editUser(userId) {
    if (!canEditUser()) {
        showError('No tienes permisos para editar usuarios');
        return;
    }
    openUserModal(userId);
}

// Función para eliminar usuario
async function deleteUser(userId) {
    if (!canDeleteUser(userId)) {
        showError('No tienes permisos para eliminar usuarios');
        return;
    }

    if (!confirmAction('¿Estás seguro de que quieres eliminar este usuario?')) {
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
            showSuccess('Usuario eliminado correctamente');
            loadUsers(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.msg || error.message || 'Error al eliminar el usuario');
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        showError('Error al eliminar el usuario');
    }
}

// Función para filtrar usuarios por rol
function filterUsersByRole(role) {
    const userCards = document.querySelectorAll('.user-card');
    
    userCards.forEach(card => {
        const roleElement = card.querySelector('p:nth-child(3)');
        const userRole = roleElement.textContent.toLowerCase();
        
        if (role === 'todos' || userRole.includes(role.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para buscar usuarios
function searchUsers(query) {
    const userCards = document.querySelectorAll('.user-card');
    
    userCards.forEach(card => {
        const userName = card.querySelector('h3').textContent.toLowerCase();
        const userEmail = card.querySelector('p').textContent.toLowerCase();
        
        if (userName.includes(query.toLowerCase()) || userEmail.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Exportar funciones para uso global
window.editUser = editUser;
window.deleteUser = deleteUser;
window.filterUsersByRole = filterUsersByRole;
window.searchUsers = searchUsers; 