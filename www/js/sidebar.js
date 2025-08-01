// sidebar.js - Menú lateral desplegable

class Sidebar {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createSidebar();
        this.setupEventListeners();
    }

    createSidebar() {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Crear sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'sidebar';
        sidebar.className = 'sidebar';
        
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="user-info">
                    <div class="user-avatar">
                        <span id="sidebar-user-initial">U</span>
                    </div>
                    <div class="user-details">
                        <div class="user-name" id="sidebar-user-name">Usuario</div>
                        <div class="user-role" id="sidebar-user-role">Rol</div>
                    </div>
                </div>
                <button class="sidebar-close" id="sidebar-close">
                    <span>&times;</span>
                </button>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="sidebar-menu" id="sidebar-menu">
                    <!-- El menú se generará dinámicamente según el rol -->
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <button class="sidebar-logout" id="sidebar-logout">
                    <span class="icon">🚪</span>
                    <span class="text">Cerrar Sesión</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Crear botón hamburguesa
        this.createHamburgerButton();
        
        // Agregar estilos
        this.addStyles();
    }

    createHamburgerButton() {
        const hamburger = document.createElement('button');
        hamburger.id = 'hamburger-menu';
        hamburger.className = 'hamburger-menu';
        hamburger.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        
        // Insertar en el header existente
        const header = document.querySelector('.header .nav');
        if (header) {
            header.insertBefore(hamburger, header.firstChild);
        }
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Botón hamburguesa */
            .hamburger-menu {
                background: none;
                border: none;
                cursor: pointer;
                padding: 10px;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                width: 30px;
                height: 30px;
                margin-right: 15px;
            }

            .hamburger-line {
                width: 25px;
                height: 3px;
                background: white;
                border-radius: 2px;
                transition: all 0.3s ease;
            }

            .hamburger-menu.active .hamburger-line:nth-child(1) {
                transform: rotate(45deg) translate(6px, 6px);
            }

            .hamburger-menu.active .hamburger-line:nth-child(2) {
                opacity: 0;
            }

            .hamburger-menu.active .hamburger-line:nth-child(3) {
                transform: rotate(-45deg) translate(6px, -6px);
            }

            /* Overlay */
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .sidebar-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            /* Sidebar */
            .sidebar {
                position: fixed;
                top: 0;
                left: -320px;
                width: 320px;
                height: 100%;
                background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
                z-index: 9999;
                transition: left 0.3s ease;
                display: flex;
                flex-direction: column;
                box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            }

            .sidebar.active {
                left: 0;
            }

            /* Header del sidebar */
            .sidebar-header {
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .user-info {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .user-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                color: white;
            }

            .user-details {
                color: white;
            }

            .user-name {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 2px;
            }

            .user-role {
                font-size: 14px;
                opacity: 0.8;
            }

            .sidebar-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }

            .sidebar-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* Navegación */
            .sidebar-nav {
                flex: 1;
                padding: 20px 0;
                overflow-y: auto;
            }

            .sidebar-menu {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .sidebar-menu li {
                margin: 0;
            }

            .sidebar-menu a {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                color: white;
                text-decoration: none;
                transition: all 0.3s ease;
                border-left: 3px solid transparent;
            }

            .sidebar-menu a:hover {
                background: rgba(255, 255, 255, 0.1);
                border-left-color: white;
            }

            .sidebar-menu a.active {
                background: rgba(255, 255, 255, 0.2);
                border-left-color: white;
            }

            .sidebar-menu .icon {
                font-size: 20px;
                margin-right: 15px;
                width: 25px;
                text-align: center;
            }

            .sidebar-menu .text {
                font-size: 16px;
                font-weight: 500;
            }

            /* Footer del sidebar */
            .sidebar-footer {
                padding: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }

            .sidebar-logout {
                width: 100%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 12px 15px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .sidebar-logout:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.5);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .sidebar {
                    width: 280px;
                    left: -280px;
                }
            }

            /* Ocultar elementos del header original */
            .header .nav > button:not(.hamburger-menu) {
                display: none;
            }

            .header .nav .user-info {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Botón hamburguesa
        document.addEventListener('click', (e) => {
            if (e.target.closest('#hamburger-menu')) {
                this.toggle();
            }
        });

        // Botón cerrar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebar-close')) {
                this.close();
            }
        });

        // Overlay
        document.addEventListener('click', (e) => {
            if (e.target.id === 'sidebar-overlay') {
                this.close();
            }
        });

        // Botón logout
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebar-logout')) {
                this.handleLogout();
            }
        });

        // Tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Enlaces del menú
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.sidebar-menu a');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    this.close();
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('sidebar-overlay').classList.add('active');
        document.getElementById('hamburger-menu').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Actualizar información del usuario
        this.updateUserInfo();
        
        // Generar menú según rol
        this.generateMenu();
    }

    close() {
        this.isOpen = false;
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
        document.getElementById('hamburger-menu').classList.remove('active');
        document.body.style.overflow = '';
    }

    updateUserInfo() {
        if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
            const user = auth.getUser();
            
            // Actualizar nombre
            const nameElement = document.getElementById('sidebar-user-name');
            if (nameElement && user.nombre) {
                nameElement.textContent = user.nombre;
            }
            
            // Actualizar rol
            const roleElement = document.getElementById('sidebar-user-role');
            if (roleElement && user.rol) {
                const roleNames = {
                    'cliente': 'Cliente',
                    'veterinario': 'Veterinario',
                    'recepcionista': 'Recepcionista',
                    'admin': 'Administrador'
                };
                roleElement.textContent = roleNames[user.rol] || user.rol;
            }
            
            // Actualizar inicial del avatar
            const initialElement = document.getElementById('sidebar-user-initial');
            if (initialElement && user.nombre) {
                initialElement.textContent = user.nombre.charAt(0).toUpperCase();
            }
        }
    }

    generateMenu() {
        const menuContainer = document.getElementById('sidebar-menu');
        if (!menuContainer) return;

        let menuItems = [];

        if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
            const user = auth.getUser();
            const role = user.rol;

            // Dashboard siempre disponible
            menuItems.push({
                icon: '🏠',
                text: 'Dashboard',
                href: 'dashboard.html'
            });

            // Menú según rol
            switch (role) {
                case 'admin':
                    menuItems.push(
                        { icon: '👥', text: 'Usuarios', href: 'usuarios.html' },
                        { icon: '🐕', text: 'Mascotas', href: 'mascotas.html' },
                        { icon: '📋', text: 'Historiales', href: 'historial.html' },
                        { icon: '📅', text: 'Citas', href: 'citas.html' },
                        { icon: '👤', text: 'Mi Perfil', href: 'perfil.html' }
                    );
                    break;

                case 'veterinario':
                    menuItems.push(
                        { icon: '🐾', text: 'Mascotas', href: 'mascotas.html' },
                        { icon: '🏥', text: 'Historiales', href: 'historial.html' },
                        { icon: '📋', text: 'Citas', href: 'citas.html' },
                        { icon: '👨‍⚕️', text: 'Mi Perfil', href: 'perfil.html' }
                    );
                    break;

                case 'recepcionista':
                    menuItems.push(
                        { icon: '👥', text: 'Usuarios', href: 'usuarios.html' },
                        { icon: '📞', text: 'Citas', href: 'citas.html' },
                        { icon: '👤', text: 'Mi Perfil', href: 'perfil.html' }
                    );
                    break;

                case 'cliente':
                default:
                    menuItems.push(
                        { icon: '🐕', text: 'Mis Mascotas', href: 'mascotas.html' },
                        { icon: '📅', text: 'Mis Citas', href: 'citas.html' },
                        { icon: '📋', text: 'Historial Médico', href: 'historial.html' },
                        { icon: '👤', text: 'Mi Perfil', href: 'perfil.html' }
                    );
                    break;
            }
        }

        // Generar HTML del menú
        const menuHTML = menuItems.map(item => `
            <li>
                <a href="${item.href}">
                    <span class="icon">${item.icon}</span>
                    <span class="text">${item.text}</span>
                </a>
            </li>
        `).join('');

        menuContainer.innerHTML = menuHTML;

        // Marcar página actual como activa
        this.markCurrentPage();
    }

    markCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop();
        const links = document.querySelectorAll('.sidebar-menu a');
        
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.close();
            setTimeout(() => {
                if (typeof logout === 'function') {
                    logout();
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                }
            }, 300);
        }
    }
}

// Inicializar sidebar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Solo crear sidebar en páginas que no sean login o registro
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'registro.html', 'index.html'];
    
    if (!publicPages.includes(currentPage)) {
        setTimeout(() => {
            window.sidebar = new Sidebar();
        }, 100);
    }
});

// Exportar para uso global
window.Sidebar = Sidebar;