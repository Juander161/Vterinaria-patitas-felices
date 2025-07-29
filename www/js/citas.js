// citas.js - Gestión de citas médicas

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
        return;
    }

    // Cargar lista de citas
    loadAppointments();
    
    // Cargar mascotas para el formulario
    loadPetsForForm();
    
    // Configurar event listeners
    setupEventListeners();
});

// Función para cargar lista de citas
async function loadAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/citas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const citas = await response.json();
            displayAppointments(citas);
        } else {
            showError('Error al cargar las citas');
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
        showError('Error al cargar las citas');
    }
}

// Función para mostrar citas en la interfaz
function displayAppointments(citas) {
    const appointmentsList = document.getElementById('appointmentsList');
    if (!appointmentsList) return;

    if (citas.length === 0) {
        appointmentsList.innerHTML = '<p class="no-data">No hay citas programadas</p>';
        return;
    }

    const appointmentsHTML = citas.map(cita => `
        <div class="appointment-card" data-id="${cita.id}">
            <div class="appointment-info">
                <h3>Cita #${cita.id}</h3>
                <p><strong>Mascota:</strong> ${cita.mascota?.nombre || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${formatDate(cita.fecha)}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <p><strong>Motivo:</strong> ${cita.motivo}</p>
                <p><strong>Estado:</strong> 
                    <span class="status-badge" style="background-color: ${getAppointmentStatusColor(cita.estado)}">
                        ${getAppointmentStatus(cita.estado)}
                    </span>
                </p>
            </div>
            <div class="appointment-actions">
                <button class="btn-edit" onclick="editAppointment(${cita.id})">Editar</button>
                <button class="btn-cancel" onclick="cancelAppointment(${cita.id})">Cancelar</button>
            </div>
        </div>
    `).join('');

    appointmentsList.innerHTML = appointmentsHTML;
}

// Función para cargar mascotas para el formulario
async function loadPetsForForm() {
    try {
        const response = await fetch(`${API_BASE_URL}/mascotas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const mascotas = await response.json();
            populatePetSelect(mascotas);
        }
    } catch (error) {
        console.error('Error al cargar mascotas para formulario:', error);
    }
}

// Función para poblar el select de mascotas
function populatePetSelect(mascotas) {
    const petSelect = document.getElementById('appointmentPet');
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
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    const appointmentModal = document.getElementById('appointmentModal');
    const closeAppointmentModal = document.getElementById('closeAppointmentModal');
    const cancelAppointmentBtn = document.getElementById('cancelAppointmentBtn');
    const appointmentForm = document.getElementById('appointmentForm');

    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', function() {
            openAppointmentModal();
        });
    }

    if (closeAppointmentModal) {
        closeAppointmentModal.addEventListener('click', function() {
            closeAppointmentModal();
        });
    }

    if (cancelAppointmentBtn) {
        cancelAppointmentBtn.addEventListener('click', function() {
            closeAppointmentModal();
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    // Cerrar modal al hacer clic fuera de él
    if (appointmentModal) {
        appointmentModal.addEventListener('click', function(e) {
            if (e.target === appointmentModal) {
                closeAppointmentModal();
            }
        });
    }
}

// Función para abrir modal de cita
function openAppointmentModal(appointmentId = null) {
    const modal = document.getElementById('appointmentModal');
    const modalTitle = document.getElementById('appointmentModalTitle');
    const form = document.getElementById('appointmentForm');

    if (appointmentId) {
        // Modo edición
        modalTitle.textContent = 'Editar Cita';
        loadAppointmentData(appointmentId);
        form.dataset.appointmentId = appointmentId;
    } else {
        // Modo creación
        modalTitle.textContent = 'Nueva Cita';
        form.reset();
        delete form.dataset.appointmentId;
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        const dateInput = form.querySelector('[name="fecha"]');
        if (dateInput) {
            dateInput.min = today;
        }
    }

    modal.style.display = 'block';
}

// Función para cerrar modal de cita
function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    const form = document.getElementById('appointmentForm');
    
    modal.style.display = 'none';
    form.reset();
    delete form.dataset.appointmentId;
}

// Función para cargar datos de una cita
async function loadAppointmentData(appointmentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/citas/${appointmentId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const cita = await response.json();
            fillAppointmentForm(cita);
        } else {
            showError('Error al cargar datos de la cita');
        }
    } catch (error) {
        console.error('Error al cargar cita:', error);
        showError('Error al cargar datos de la cita');
    }
}

// Función para llenar formulario con datos de cita
function fillAppointmentForm(cita) {
    const form = document.getElementById('appointmentForm');
    if (!form) return;

    const fields = {
        'mascotaId': cita.mascotaId,
        'fecha': cita.fecha,
        'hora': cita.hora,
        'motivo': cita.motivo,
        'estado': cita.estado
    };

    Object.keys(fields).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = fields[fieldName] || '';
        }
    });
}

// Función para manejar envío del formulario de cita
async function handleAppointmentSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const appointmentId = form.dataset.appointmentId;

    const appointmentData = {
        mascotaId: parseInt(formData.get('mascotaId')),
        fecha: formData.get('fecha'),
        hora: formData.get('hora'),
        motivo: formData.get('motivo'),
        estado: formData.get('estado')
    };

    try {
        const url = appointmentId ? 
            `${API_BASE_URL}/citas/${appointmentId}` : 
            `${API_BASE_URL}/citas`;
        
        const method = appointmentId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(appointmentData)
        });

        if (response.ok) {
            showSuccess(appointmentId ? 'Cita actualizada correctamente' : 'Cita creada correctamente');
            closeAppointmentModal();
            loadAppointments(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.message || 'Error al guardar la cita');
        }
    } catch (error) {
        console.error('Error al guardar cita:', error);
        showError('Error al guardar la cita');
    }
}

// Función para editar cita
function editAppointment(appointmentId) {
    openAppointmentModal(appointmentId);
}

// Función para cancelar cita
async function cancelAppointment(appointmentId) {
    if (!confirmAction('¿Estás seguro de que quieres cancelar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/citas/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify({ estado: 'cancelada' })
        });

        if (response.ok) {
            showSuccess('Cita cancelada correctamente');
            loadAppointments(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.message || 'Error al cancelar la cita');
        }
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        showError('Error al cancelar la cita');
    }
}

// Función para eliminar cita
async function deleteAppointment(appointmentId) {
    if (!confirmAction('¿Estás seguro de que quieres eliminar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/citas/${appointmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            showSuccess('Cita eliminada correctamente');
            loadAppointments(); // Recargar lista
        } else {
            const error = await response.json();
            showError(error.message || 'Error al eliminar la cita');
        }
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        showError('Error al eliminar la cita');
    }
}

// Función para filtrar citas por estado
function filterAppointmentsByStatus(status) {
    const appointmentCards = document.querySelectorAll('.appointment-card');
    
    appointmentCards.forEach(card => {
        const statusElement = card.querySelector('.status-badge');
        const appointmentStatus = statusElement.textContent.toLowerCase();
        
        if (status === 'todas' || appointmentStatus.includes(status.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para buscar citas
function searchAppointments(query) {
    const appointmentCards = document.querySelectorAll('.appointment-card');
    
    appointmentCards.forEach(card => {
        const petName = card.querySelector('p').textContent.toLowerCase();
        const motivo = card.querySelectorAll('p')[3].textContent.toLowerCase();
        
        if (petName.includes(query.toLowerCase()) || motivo.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Exportar funciones para uso global
window.editAppointment = editAppointment;
window.cancelAppointment = cancelAppointment;
window.deleteAppointment = deleteAppointment;
window.filterAppointmentsByStatus = filterAppointmentsByStatus;
window.searchAppointments = searchAppointments; 