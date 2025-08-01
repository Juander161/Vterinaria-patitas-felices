// auth.js - Login, registro, token

// Funciones de autenticación
class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    // Login
    async login(email, password) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await window.handleApiResponse(response);

            if (data && data.success) {
                this.token = data.token;
                this.user = data.usuario || data.user; // La API devuelve 'usuario' o 'user'
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return { success: true, user: this.user };
            } else {
                throw new Error(data?.message || 'Error en el login');
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: error.message };
        }
    }

    // Registro
    async register(userData) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await window.handleApiResponse(response);

            if (data && data.success) {
                // Auto-login después del registro
                return await this.login(userData.email, userData.password);
            } else {
                throw new Error(data?.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, message: error.message };
        }
    }

    // Obtener perfil del usuario
    async getProfile() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/perfil`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await window.handleApiResponse(response);

            if (data && data.success) {
                this.user = data.usuario || data.user; // La API devuelve 'usuario' o 'user'
                localStorage.setItem('user', JSON.stringify(this.user));
                return this.user;
            } else {
                throw new Error('Error al obtener perfil');
            }
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            return null;
        }
    }

    // Logout
    logout() {
        this.token = null;
        this.user = {};
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Obtener token
    getToken() {
        return this.token;
    }

    // Obtener usuario
    getUser() {
        return this.user;
    }

    // Verificar rol
    hasRole(role) {
        return this.user.rol === role;
    }

    // Verificar si es admin
    isAdmin() {
        return this.user.rol === 'admin';
    }

    // Verificar si es veterinario
    isVeterinario() {
        return this.user.rol === 'veterinario';
    }

    // Verificar si es recepcionista
    isRecepcionista() {
        return this.user.rol === 'recepcionista';
    }
}

// Instancia global de autenticación
const auth = new Auth();

// Event listeners para formularios de login y registro
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const result = await auth.login(email, password);
            
            if (result.success) {
                showSuccess('Login exitoso');
                // Redirigir según el rol
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showError(result.message || 'Error en el login');
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = {
                nombre: formData.get('nombre'),
                email: formData.get('email'),
                password: formData.get('password'),
                telefono: formData.get('telefono'),
                direccion: formData.get('direccion'),
                rol: formData.get('rol') || 'cliente'
            };

            const result = await auth.register(userData);
            
            if (result.success) {
                showSuccess('Registro exitoso');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showError(result.message || 'Error en el registro');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.logout();
        });
    }

    // Verificar autenticación en páginas protegidas
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'registro.html', 'index.html'];
    
    if (!publicPages.includes(currentPage) && !auth.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}); 