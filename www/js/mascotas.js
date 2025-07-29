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

        if (response.ok) {
            const data = await response.json();
            displayPets(data.mascotas || data); // La API puede devolver {mascotas: [...]} o directamente el array
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al cargar las mascotas');
        }
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
        showError('Error al cargar las mascotas');
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

        if (response.ok) {
            const mascota = await response.json();
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

        if (response.ok) {
            showSuccess(petId ? 'Mascota actualizada exitosamente' : 'Mascota creada exitosamente');
            closePetModal();
            loadPets(); // Recargar lista
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al guardar la mascota');
        }
    } catch (error) {
        console.error('Error al guardar mascota:', error);
        showError('Error al guardar la mascota');
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

        if (response.ok) {
            showSuccess('Mascota eliminada exitosamente');
            loadPets(); // Recargar lista
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al eliminar la mascota');
        }
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        showError('Error al eliminar la mascota');
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

// Funciones de utilidad para mostrar mensajes
function showSuccess(message) {
    // Implementar según tu sistema de notificaciones
    alert(message);
}

function showError(message) {
    // Implementar según tu sistema de notificaciones
    alert('Error: ' + message);
} 