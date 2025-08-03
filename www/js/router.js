// router.js - Sistema de enrutamiento simple

class SimpleRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Configurar rutas por defecto
        this.setupDefaultRoutes();
        
        // Escuchar cambios en la URL
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
        
        // Manejar la ruta inicial
        this.handleRouteChange();
    }

    setupDefaultRoutes() {
        // Rutas públicas (no requieren autenticación)
        this.addRoute('/', { 
            component: 'index', 
            requiresAuth: false,
            title: 'Patitas Felices'
        });
        
        this.addRoute('/login', { 
            component: 'login', 
            requiresAuth: false,
            title: 'Login - Patitas Felices'
        });
        
        this.addRoute('/registro', { 
            component: 'registro', 
            requiresAuth: false,
            title: 'Registro - Patitas Felices'
        });

        // Rutas protegidas (requieren autenticación)
        this.addRoute('/dashboard', { 
            component: 'dashboard', 
            requiresAuth: true,
            title: 'Dashboard - Patitas Felices'
        });
        
        this.addRoute('/mascotas', { 
            component: 'mascotas', 
            requiresAuth: true,
            title: 'Mascotas - Patitas Felices'
        });
        
        this.addRoute('/citas', { 
            component: 'citas', 
            requiresAuth: true,
            title: 'Citas - Patitas Felices'
        });
        
        this.addRoute('/historial', { 
            component: 'historial', 
            requiresAuth: true,
            title: 'Historial Médico - Patitas Felices'
        });
        
        this.addRoute('/perfil', { 
            component: 'perfil', 
            requiresAuth: true,
            title: 'Mi Perfil - Patitas Felices'
        });
        
        this.addRoute('/usuarios', { 
            component: 'usuarios', 
            requiresAuth: true,
            permissions: ['admin', 'recepcionista'],
            title: 'Usuarios - Patitas Felices'
        });
    }

    addRoute(path, config) {
        this.routes.set(path, config);
    }

    removeRoute(path) {
        this.routes.delete(path);
    }

    navigate(path, replace = false) {
        if (replace) {
            window.history.replaceState(null, '', path);
        } else {
            window.history.pushState(null, '', path);
        }
        this.handleRouteChange();
    }

    handleRouteChange() {
        const path = this.getCurrentPath();
        const route = this.findRoute(path);
        
        if (route) {
            this.loadRoute(route, path);
        } else {
            this.handle404();
        }
    }

    getCurrentPath() {
        let path = window.location.pathname;
        
        // Normalizar rutas de archivos HTML
        if (path.endsWith('.html')) {
            path = path.replace('.html', '');
        }
        
        // Manejar rutas de subcarpetas
        if (path.includes('/views/')) {
            path = path.replace('/views', '');
        }
        
        return path || '/';
    }

    findRoute(path) {
        // Buscar ruta exacta
        if (this.routes.has(path)) {
            return { config: this.routes.get(path), params: {} };
        }
        
        // Buscar rutas con parámetros (implementación básica)
        for (const [routePath, config] of this.routes) {
            if (routePath.includes(':')) {
                const routeRegex = this.createRouteRegex(routePath);
                const match = path.match(routeRegex);
                if (match) {
                    const params = this.extractParams(routePath, match);
                    return { config, params };
                }
            }
        }
        
        return null;
    }

    createRouteRegex(routePath) {
        const regexPath = routePath.replace(/:([^/]+)/g, '([^/]+)');
        return new RegExp(`^${regexPath}$`);
    }

    extractParams(routePath, match) {
        const params = {};
        const paramNames = routePath.match(/:([^/]+)/g);
        
        if (paramNames) {
            paramNames.forEach((param, index) => {
                const paramName = param.substring(1);
                params[paramName] = match[index + 1];
            });
        }
        
        return params;
    }

    async loadRoute(route, path) {
        const { config, params } = route;
        
        // Verificar autenticación
        if (config.requiresAuth && !this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }
        
        // Verificar permisos
        if (config.permissions && !this.hasPermissions(config.permissions)) {
            this.handle403();
            return;
        }
        
        // Actualizar título
        if (config.title) {
            document.title = config.title;
        }
        
        // Guardar ruta actual
        this.currentRoute = { path, config, params };
        
        console.log('Ruta cargada:', this.currentRoute);
    }

    isAuthenticated() {
        return typeof auth !== 'undefined' && auth.isAuthenticated();
    }

    hasPermissions(requiredPermissions) {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        const user = auth.getUser();
        const userRole = user.rol;
        
        // Admin tiene todos los permisos
        if (userRole === 'admin') {
            return true;
        }
        
        return requiredPermissions.includes(userRole);
    }

    redirectToLogin() {
        console.log('Redirigiendo al login...');
        if (typeof navigateTo === 'function') {
            navigateTo('login.html');
        } else {
            window.location.href = 'views/login.html';
        }
    }

    handle403() {
        console.warn('Acceso denegado - permisos insuficientes');
        if (typeof showError === 'function') {
            showError('No tienes permisos para acceder a esta página');
        }
        
        // Redirigir al dashboard
        if (typeof navigateTo === 'function') {
            navigateTo('dashboard.html');
        }
    }

    handle404() {
        console.warn('Ruta no encontrada:', this.getCurrentPath());
        
        // En lugar de mostrar 404, redirigir según el estado de autenticación
        if (this.isAuthenticated()) {
            if (typeof navigateTo === 'function') {
                navigateTo('dashboard.html');
            }
        } else {
            if (typeof navigateTo === 'function') {
                navigateTo('login.html');
            }
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getRoutes() {
        return Array.from(this.routes.entries());
    }
}

// Crear instancia global del router
window.router = new SimpleRouter();

// Funciones de conveniencia
window.navigateToRoute = function(path, replace = false) {
    window.router.navigate(path, replace);
};

window.getCurrentRoute = function() {
    return window.router.getCurrentRoute();
};

console.log('Sistema de enrutamiento inicializado');