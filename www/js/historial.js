// historial.js - Gestión de historiales médicos

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
        return;
    }

    // Verificar permisos para agregar historiales
    checkHistoryPermissions();
    
    // Cargar lista de historiales
    loadHistories();
    
    // Cargar mascotas para el formulario
    loadPetsForHistoryForm();
    
    // Configurar event listeners
    setupEventListeners();
});

// Función para verificar permisos de historiales
function checkHistoryPermissions() {
    const userRole = getCurrentUserRole();
    const addHistoryBtn = document.getElementById('addHistoryBtn');
    
    // Solo veterinarios y admin pueden agregar historiales
    if (addHistoryBtn) {
        if (userRole === 'veterinario' || userRole === 'admin') {
            addHistoryBtn.style.display = 'block';
        } else {
            addHistoryBtn.style.display = 'none';
        }
    }
}

// Función para cargar lista de historiales
async function loadHistories() {
    try {
        const response = await fetch(`${API_BASE_URL}/historiales`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayHistories(data.historiales || data); // La API puede devolver {historiales: [...]} o directamente el array
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al cargar los historiales médicos');
        }
    } catch (error) {
        console.error('Error al cargar historiales:', error);
        showError('Error al cargar los historiales médicos');
    }
}

// Función para mostrar historiales en la interfaz
function displayHistories(historiales) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (historiales.length === 0) {
        historyList.innerHTML = '<p class="no-data">No hay historiales médicos registrados</p>';
        return;
    }

    const historiesHTML = historiales.map(historial => `
        <div class="history-card" data-id="${historial.id}">
            <div class="history-info">
                <h3>Historial #${historial.id}</h3>
                <p><strong>Mascota:</strong> ${historial.mascota?.nombre || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${formatDate(historial.fecha)}</p>
                <p><strong>Síntomas:</strong> ${historial.sintomas}</p>
                <p><strong>Diagnóstico:</strong> ${historial.diagnostico}</p>
                <p><strong>Tratamiento:</strong> ${historial.tratamiento}</p>
                ${historial.observaciones ? `<p><strong>Observaciones:</strong> ${historial.observaciones}</p>` : ''}
            </div>
            <div class="history-actions">
                ${canEditHistory() ? `<button class="btn-edit" onclick="editHistory(${historial.id})">Editar</button>` : ''}
                ${canDeleteHistory() ? `<button class="btn-delete" onclick="deleteHistory(${historial.id})">Eliminar</button>` : ''}
            </div>
        </div>
    `).join('');

    historyList.innerHTML = historiesHTML;
}

// Función para verificar si puede editar historiales
function canEditHistory() {
    const userRole = getCurrentUserRole();
    return userRole === 'veterinario' || userRole === 'admin';
}

// Función para verificar si puede eliminar historiales
function canDeleteHistory() {
    const userRole = getCurrentUserRole();
    return userRole === 'admin';
}

// Función para cargar mascotas para el formulario de historial
async function loadPetsForHistoryForm() {
    try {
        const response = await fetch(`${API_BASE_URL}/mascotas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            populateHistoryPetSelect(data.mascotas || data); // La API puede devolver {mascotas: [...]} o directamente el array
        }
    } catch (error) {
        console.error('Error al cargar mascotas para formulario de historial:', error);
    }
}

// Función para poblar el select de mascotas para historial
function populateHistoryPetSelect(mascotas) {
    const petSelect = document.getElementById('historyPet');
    if (!petSelect) return;

    // Limpiar opciones existentes excepto la primera
    petSelect.innerHTML = '<option value="">Seleccionar mascota</option>';

    mascotas.forEach(mascota => {
        const option = document.createElement('option');
        option.value = mascota.id;
        option.textContent = `${mascota.nombre} (${mascota.especie})`;
        petSelect.appendChild(option);
    });
}

// Función para configurar event listeners
function setupEventListeners() {
    const addHistoryBtn = document.getElementById('addHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const cancelHistoryBtn = document.getElementById('cancelHistoryBtn');
    const historyForm = document.getElementById('historyForm');

    if (addHistoryBtn) {
        addHistoryBtn.addEventListener('click', function() {
            openHistoryModal();
        });
    }

    if (closeHistoryModal) {
        closeHistoryModal.addEventListener('click', function() {
            closeHistoryModal();
        });
    }

    if (cancelHistoryBtn) {
        cancelHistoryBtn.addEventListener('click', function() {
            closeHistoryModal();
        });
    }

    if (historyForm) {
        historyForm.addEventListener('submit', handleHistorySubmit);
    }

    // Cerrar modal al hacer clic fuera de él
    if (historyModal) {
        historyModal.addEventListener('click', function(e) {
            if (e.target === historyModal) {
                closeHistoryModal();
            }
        });
    }
}

// Función para abrir modal de historial
function openHistoryModal(historyId = null) {
    const modal = document.getElementById('historyModal');
    const modalTitle = document.getElementById('historyModalTitle');
    const form = document.getElementById('historyForm');

    if (historyId) {
        // Modo edición
        modalTitle.textContent = 'Editar Historial';
        loadHistoryData(historyId);
        form.dataset.historyId = historyId;
    } else {
        // Modo creación
        modalTitle.textContent = 'Nuevo Historial';
        form.reset();
        delete form.dataset.historyId;
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        const dateInput = form.querySelector('[name="fecha"]');
        if (dateInput) {
            dateInput.min = today;
        }
    }

    modal.style.display = 'block';
}

// Función para cerrar modal de historial
function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    const form = document.getElementById('historyForm');
    
    modal.style.display = 'none';
    form.reset();
    delete form.dataset.historyId;
}

// Función para cargar datos de un historial
async function loadHistoryData(historyId) {
    try {
        const response = await fetch(`${API_BASE_URL}/historiales/${historyId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            fillHistoryForm(data.historial || data); // La API puede devolver {historial: {...}} o directamente el objeto
        } else {
            const errorData = await response.json();
            showError(errorData.msg || errorData.message || 'Error al cargar datos del historial');
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
        showError('Error al cargar datos del historial');
    }
}

// Función para llenar formulario con datos de historial
function fillHistoryForm(historial) {
    const form = document.getElementById('historyForm');
    if (!form) return;

    const fields = {
        'mascotaId': historial.mascotaId,
        'fecha': historial.fecha,
        'sintomas': historial.sintomas,
        'diagnostico': historial.diagnostico,
        'tratamiento': historial.tratamiento,
        'observaciones': historial.observaciones
    };

    Object.keys(fields).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = fields[fieldName] || '';
        }
    });
}

// Función para manejar envío del formulario de historial
async function handleHistorySubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const historyId = form.dataset.historyId;

    const historyData = {
        mascotaId: parseInt(formData.get('mascotaId')),
        fecha: formData.get('fecha'),
        sintomas: formData.get('sintomas'),
        diagnostico: formData.get('diagnostico'),
        tratamiento: formData.get('tratamiento'),
        observaciones: formData.get('observaciones')
    };

    try {
        const url = historyId ? 
            `${API_BASE_URL}/historiales/${historyId}` : 
            `${API_BASE_URL}/historiales`;
        
        const method = historyId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(historyData)
        });

        if (response.ok) {
            showSuccess(historyId ? 'Historial actualizado correctamente' : 'Historial creado correctamente');
            closeHistoryModal();
            loadHistories(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.msg || error.message || 'Error al guardar el historial');
        }
    } catch (error) {
        console.error('Error al guardar historial:', error);
        showError('Error al guardar el historial');
    }
}

// Función para editar historial
function editHistory(historyId) {
    if (!canEditHistory()) {
        showError('No tienes permisos para editar historiales');
        return;
    }
    openHistoryModal(historyId);
}

// Función para eliminar historial
async function deleteHistory(historyId) {
    if (!canDeleteHistory()) {
        showError('No tienes permisos para eliminar historiales');
        return;
    }

    if (!confirmAction('¿Estás seguro de que quieres eliminar este historial?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/historiales/${historyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            showSuccess('Historial eliminado correctamente');
            loadHistories(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.msg || error.message || 'Error al eliminar el historial');
        }
    } catch (error) {
        console.error('Error al eliminar historial:', error);
        showError('Error al eliminar el historial');
    }
}

// Función para filtrar historiales por mascota
function filterHistoriesByPet(petId) {
    const historyCards = document.querySelectorAll('.history-card');
    
    historyCards.forEach(card => {
        const petName = card.querySelector('p').textContent.toLowerCase();
        const targetPet = document.querySelector(`option[value="${petId}"]`)?.textContent.toLowerCase();
        
        if (petId === 'todas' || petName.includes(targetPet)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para buscar historiales
function searchHistories(query) {
    const historyCards = document.querySelectorAll('.history-card');
    
    historyCards.forEach(card => {
        const petName = card.querySelector('p').textContent.toLowerCase();
        const sintomas = card.querySelectorAll('p')[2].textContent.toLowerCase();
        const diagnostico = card.querySelectorAll('p')[3].textContent.toLowerCase();
        
        if (petName.includes(query.toLowerCase()) || 
            sintomas.includes(query.toLowerCase()) || 
            diagnostico.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Exportar funciones para uso global
window.editHistory = editHistory;
window.deleteHistory = deleteHistory;
window.filterHistoriesByPet = filterHistoriesByPet;
window.searchHistories = searchHistories; 