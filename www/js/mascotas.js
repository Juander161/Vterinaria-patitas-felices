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
            const mascotas = await response.json();
            displayPets(mascotas);
        } else {
            showError('Error al cargar las mascotas');
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
        <div class="pet-card" data-id="${mascota.id}">
            <div class="pet-info">
                <h3>${mascota.nombre}</h3>
                <p><strong>Especie:</strong> ${mascota.especie}</p>
                <p><strong>Raza:</strong> ${mascota.raza}</p>
                <p><strong>Edad:</strong> ${mascota.edad} años</p>
                <p><strong>Peso:</strong> ${mascota.peso} kg</p>
            </div>
            <div class="pet-actions">
                <button class="btn-edit" onclick="editPet(${mascota.id})">Editar</button>
                <button class="btn-delete" onclick="deletePet(${mascota.id})">Eliminar</button>
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
        // Modo edición
        modalTitle.textContent = 'Editar Mascota';
        loadPetData(petId);
        form.dataset.petId = petId;
    } else {
        // Modo creación
        modalTitle.textContent = 'Nueva Mascota';
        form.reset();
        delete form.dataset.petId;
    }

    modal.style.display = 'block';
}

// Función para cerrar modal de mascota
function closePetModal() {
    const modal = document.getElementById('petModal');
    const form = document.getElementById('petForm');
    
    modal.style.display = 'none';
    form.reset();
    delete form.dataset.petId;
}

// Función para cargar datos de una mascota
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
            showError('Error al cargar datos de la mascota');
        }
    } catch (error) {
        console.error('Error al cargar mascota:', error);
        showError('Error al cargar datos de la mascota');
    }
}

// Función para llenar formulario con datos de mascota
function fillPetForm(mascota) {
    const form = document.getElementById('petForm');
    if (!form) return;

    const fields = {
        'nombre': mascota.nombre,
        'especie': mascota.especie,
        'raza': mascota.raza,
        'edad': mascota.edad,
        'peso': mascota.peso
    };

    Object.keys(fields).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = fields[fieldName] || '';
        }
    });
}

// Función para manejar envío del formulario de mascota
async function handlePetSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const petId = form.dataset.petId;

    const petData = {
        nombre: formData.get('nombre'),
        especie: formData.get('especie'),
        raza: formData.get('raza'),
        edad: parseFloat(formData.get('edad')),
        peso: parseFloat(formData.get('peso'))
    };

    try {
        const url = petId ? 
            `${API_BASE_URL}/mascotas/${petId}` : 
            `${API_BASE_URL}/mascotas`;
        
        const method = petId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(petData)
        });

        if (response.ok) {
            showSuccess(petId ? 'Mascota actualizada correctamente' : 'Mascota creada correctamente');
            closePetModal();
            loadPets(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.message || 'Error al guardar la mascota');
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
    if (!confirmAction('¿Estás seguro de que quieres eliminar esta mascota?')) {
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
            showSuccess('Mascota eliminada correctamente');
            loadPets(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.message || 'Error al eliminar la mascota');
        }
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        showError('Error al eliminar la mascota');
    }
}

// Función para buscar mascotas
function searchPets(query) {
    const petCards = document.querySelectorAll('.pet-card');
    
    petCards.forEach(card => {
        const petName = card.querySelector('h3').textContent.toLowerCase();
        const petSpecies = card.querySelector('p').textContent.toLowerCase();
        
        if (petName.includes(query.toLowerCase()) || petSpecies.includes(query.toLowerCase())) {
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
        const petSpecies = card.querySelector('p').textContent.toLowerCase();
        
        if (species === 'todas' || petSpecies.includes(species.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Exportar funciones para uso global
window.editPet = editPet;
window.deletePet = deletePet;
window.searchPets = searchPets;
window.filterPetsBySpecies = filterPetsBySpecies; 