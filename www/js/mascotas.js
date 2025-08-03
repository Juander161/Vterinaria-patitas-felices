// mascotas.js - Gestión de mascotas

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar lista de mascotas
    loadPets();
    
    // Configurar event listeners
    setupEventListeners();
});

// Función para cargar lista de mascotas
async function loadPets() {
    try {
        showInfo('Cargando mascotas...');
        
        const response = await fetch(`${window.API_BASE_URL}/mascotas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const mascotas = data.mascotas || data.data || [];
            
            if (mascotas.length === 0) {
                showInfo('No hay mascotas registradas');
            } else {
                showSuccess(`${mascotas.length} mascotas cargadas`);
            }
            
            displayPets(mascotas);
        } else {
            showError('Error al cargar las mascotas');
            displayPets([]);
        }
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
        showError('Error de conexión. Verifica que la API esté funcionando.');
        displayPets([]);
    }
}

// Función para mostrar mascotas en la interfaz
function displayPets(mascotas) {
    const petsList = document.getElementById('petsList');
    if (!petsList) return;

    if (mascotas.length === 0) {
        petsList.innerHTML = '<div class="no-data">No hay mascotas registradas</div>';
        return;
    }

    const petsHTML = mascotas.map(mascota => `
        <div class="card" data-id="${mascota._id || mascota.id}">
            <div class="card-header">
                <h3 class="card-title">${mascota.nombre}</h3>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="editPet('${mascota._id || mascota.id}')">
                        <span>✏️</span>
                        Editar
                    </button>
                    <button class="btn btn-danger" onclick="deletePet('${mascota._id || mascota.id}')">
                        <span>🗑️</span>
                        Eliminar
                    </button>
                </div>
            </div>
            <div class="pet-info">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div>
                        <p><strong>Especie:</strong> ${mascota.especie}</p>
                        <p><strong>Raza:</strong> ${mascota.raza || 'N/A'}</p>
                        <p><strong>Sexo:</strong> ${mascota.sexo || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Color:</strong> ${mascota.color || 'N/A'}</p>
                        <p><strong>Esterilizado:</strong> ${mascota.esterilizado ? 'Sí' : 'No'}</p>
                        ${mascota.fecha_nacimiento ? `<p><strong>Fecha de nacimiento:</strong> ${formatDate(mascota.fecha_nacimiento)}</p>` : ''}
                    </div>
                </div>
                ${mascota.foto ? `<div style="margin-top: 1rem;"><img src="${mascota.foto}" alt="${mascota.nombre}" style="max-width: 200px; border-radius: 8px; box-shadow: var(--shadow-sm);"></div>` : ''}
            </div>
        </div>
    `).join('');

    petsList.innerHTML = petsHTML;
}

// Función para configurar event listeners
function setupEventListeners() {
    const addPetBtn = document.getElementById('addPetBtn');
    const petModal = document.getElementById('petModal');
    const closeModal = document.getElementById('closeModal');
    const cancelPetBtn = document.getElementById('cancelPetBtn');
    const petForm = document.getElementById('petForm');

    if (addPetBtn) {
        addPetBtn.addEventListener('click', function() {
            openPetModal();
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closePetModal();
        });
    }

    if (cancelPetBtn) {
        cancelPetBtn.addEventListener('click', function() {
            closePetModal();
        });
    }

    if (petForm) {
        petForm.addEventListener('submit', handlePetSubmit);
    }

    // Cerrar modal al hacer clic fuera de él
    if (petModal) {
        petModal.addEventListener('click', function(e) {
            if (e.target === petModal) {
                closePetModal();
            }
        });
    }
}

// Función para abrir modal de mascota
function openPetModal(petId = null) {
    const modal = document.getElementById('petModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('petForm');
    
    if (petId) {
        modalTitle.textContent = 'Editar Mascota';
        loadPetData(petId);
        form.dataset.petId = petId;
    } else {
        modalTitle.textContent = 'Nueva Mascota';
        form.reset();
        delete form.dataset.petId;
    }
    
    modal.style.display = 'block';
}

// Función para cerrar modal de mascota
function closePetModal() {
    const modal = document.getElementById('petModal');
    modal.style.display = 'none';
}

// Función para cargar datos de mascota
async function loadPetData(petId) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/mascotas/${petId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const mascota = data.mascota || data.data;
            fillPetForm(mascota);
        } else {
            showError('Error al cargar los datos de la mascota');
        }
    } catch (error) {
        console.error('Error al cargar datos de mascota:', error);
        showError('Error al cargar los datos de la mascota');
    }
}

// Función para llenar formulario con datos de mascota
function fillPetForm(mascota) {
    const form = document.getElementById('petForm');
    
    form.nombre.value = mascota.nombre || '';
    form.especie.value = mascota.especie || '';
    form.raza.value = mascota.raza || '';
    form.sexo.value = mascota.sexo || '';
    form.color.value = mascota.color || '';
    form.esterilizado.value = mascota.esterilizado !== undefined ? mascota.esterilizado.toString() : '';
    form.foto.value = mascota.foto || '';
    
    // Formatear fecha para input date
    if (mascota.fecha_nacimiento) {
        const fecha = new Date(mascota.fecha_nacimiento);
        form.fecha_nacimiento.value = fecha.toISOString().split('T')[0];
    }
}

// Función para manejar envío del formulario
async function handlePetSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const petId = form.dataset.petId;
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const petData = {
        nombre: formData.get('nombre'),
        especie: formData.get('especie'),
        raza: formData.get('raza'),
        sexo: formData.get('sexo'),
        color: formData.get('color'),
        esterilizado: formData.get('esterilizado') === 'true',
        foto: formData.get('foto')
    };
    
    // Agregar fecha de nacimiento si existe
    const fechaNacimiento = formData.get('fecha_nacimiento');
    if (fechaNacimiento) {
        petData.fecha_nacimiento = new Date(fechaNacimiento);
    }
    
    try {
        let response;
        if (petId) {
            // Actualizar mascota existente
            response = await fetch(`${window.API_BASE_URL}/mascotas/${petId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(petData)
            });
        } else {
            // Crear nueva mascota
            response = await fetch(`${window.API_BASE_URL}/mascotas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(petData)
            });
        }

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            showSuccess(petId ? 'Mascota actualizada exitosamente' : 'Mascota creada exitosamente');
            closePetModal();
            loadPets(); // Recargar lista
        } else {
            const errorMessage = data.msg || data.message || 'Error al guardar la mascota';
            
            if (response.status === 400) {
                showError('Datos inválidos. Verifica la información ingresada.');
            } else if (response.status === 409) {
                showError('Ya existe una mascota con estos datos.');
            } else {
                showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al guardar mascota:', error);
        
        if (error.type === 'network') {
            showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            showError('Error al ' + (petId ? 'actualizar' : 'crear') + ' la mascota');
        }
    }
}

// Función para editar mascota
function editPet(petId) {
    openPetModal(petId);
}

// Función para eliminar mascota
async function deletePet(petId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/mascotas/${petId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            showSuccess('Mascota eliminada exitosamente');
            loadPets(); // Recargar lista
        } else {
            const errorMessage = data.msg || data.message || 'Error al eliminar la mascota';
            
            if (response.status === 403) {
                showError('No tienes permisos para eliminar esta mascota.');
            } else if (response.status === 404) {
                showError('La mascota no fue encontrada.');
            } else {
                showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        
        if (error.type === 'network') {
            showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            showError('Error al eliminar la mascota');
        }
    }
}

// Función para buscar mascotas
function searchPets(query) {
    const petCards = document.querySelectorAll('.pet-card');
    const searchTerm = query.toLowerCase();

    petCards.forEach(card => {
        const petName = card.querySelector('h3').textContent.toLowerCase();
        const petSpecies = card.querySelector('p').textContent.toLowerCase();
        
        if (petName.includes(searchTerm) || petSpecies.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para filtrar mascotas por especie
function filterPetsBySpecies(species) {
    const petCards = document.querySelectorAll('.pet-card');
    
    petCards.forEach(card => {
        const petSpecies = card.querySelector('p').textContent;
        
        if (species === 'todos' || petSpecies.includes(species)) {
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