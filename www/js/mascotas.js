// mascotas.js - Gestión de mascotas

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
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
        const response = await fetch(`${API_BASE_URL}/mascotas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await handleApiResponse(response);

        if (data && data.success) {
            const mascotas = data.mascotas || data.data || [];
            
            if (mascotas.length === 0) {
                notifications.showInfo('No hay mascotas registradas');
            }
            
            displayPets(mascotas);
        } else {
            notifications.showError('Error al cargar las mascotas');
        }
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('mascotas', 'load');
        }
    }
}

// Función para mostrar mascotas en la interfaz
function displayPets(mascotas) {
    const petsList = document.getElementById('petsList');
    if (!petsList) return;

    if (mascotas.length === 0) {
        petsList.innerHTML = '<p class="no-data">No hay mascotas registradas</p>';
        return;
    }

    const petsHTML = mascotas.map(mascota => `
        <div class="pet-card" data-id="${mascota._id || mascota.id}">
            <div class="pet-info">
                <h3>${mascota.nombre}</h3>
                <p><strong>Especie:</strong> ${mascota.especie}</p>
                <p><strong>Raza:</strong> ${mascota.raza || 'N/A'}</p>
                <p><strong>Sexo:</strong> ${mascota.sexo || 'N/A'}</p>
                <p><strong>Color:</strong> ${mascota.color || 'N/A'}</p>
                <p><strong>Esterilizado:</strong> ${mascota.esterilizado ? 'Sí' : 'No'}</p>
                ${mascota.fecha_nacimiento ? `<p><strong>Fecha de nacimiento:</strong> ${formatDate(mascota.fecha_nacimiento)}</p>` : ''}
                ${mascota.foto ? `<img src="${mascota.foto}" alt="${mascota.nombre}" class="pet-photo">` : ''}
            </div>
            <div class="pet-actions">
                <button class="btn-edit" onclick="editPet('${mascota._id || mascota.id}')">Editar</button>
                <button class="btn-delete" onclick="deletePet('${mascota._id || mascota.id}')">Eliminar</button>
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
        const response = await fetch(`${API_BASE_URL}/mascotas/${petId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await handleApiResponse(response);

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
            response = await fetch(`${API_BASE_URL}/mascotas/${petId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(petData)
            });
        } else {
            // Crear nueva mascota
            response = await fetch(`${API_BASE_URL}/mascotas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(petData)
            });
        }

        const data = await handleApiResponse(response);

        if (data && data.success) {
            notifications.showSuccess(petId ? 'Mascota actualizada exitosamente' : 'Mascota creada exitosamente');
            closePetModal();
            loadPets(); // Recargar lista
        } else {
            const errorMessage = data.msg || data.message || 'Error al guardar la mascota';
            
            if (response.status === 400) {
                notifications.showError('Datos inválidos. Verifica la información ingresada.');
            } else if (response.status === 409) {
                notifications.showError('Ya existe una mascota con estos datos.');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al guardar mascota:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('mascotas', petId ? 'update' : 'create');
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
        const response = await fetch(`${API_BASE_URL}/mascotas/${petId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await handleApiResponse(response);

        if (data && data.success) {
            notifications.showSuccess('Mascota eliminada exitosamente');
            loadPets(); // Recargar lista
        } else {
            const errorMessage = data.msg || data.message || 'Error al eliminar la mascota';
            
            if (response.status === 403) {
                notifications.showContextError('mascotas', 'no_permission');
            } else if (response.status === 404) {
                notifications.showError('La mascota no fue encontrada.');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('mascotas', 'delete');
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
    notifications.showSuccess(message);
}

function showError(message) {
    notifications.showError(message);
} 