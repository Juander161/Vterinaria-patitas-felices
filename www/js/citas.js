// citas.js - Gestión de citas médicas

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!auth.isAuthenticated()) {
        navigateTo('login.html');
        return;
    }

    // Cargar lista de citas
    loadAppointments();
    
    // Cargar mascotas y veterinarios para el formulario
    loadPetsForForm();
    loadVeterinariosForForm();
    
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
            const data = await response.json();
            const citas = data.citas || data;
            
            if (citas.length === 0) {
                notifications.showInfo('No hay citas programadas');
            }
            
            displayAppointments(citas);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al cargar las citas';
            
            if (response.status === 404) {
                notifications.showContextError('citas', 'not_found');
            } else if (response.status === 403) {
                notifications.showContextError('citas', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('citas', 'load');
        }
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
        <div class="appointment-card" data-id="${cita._id || cita.id}">
            <div class="appointment-info">
                <h3>Cita #${cita._id || cita.id}</h3>
                <p><strong>Mascota:</strong> ${cita.mascota?.nombre || 'N/A'}</p>
                <p><strong>Veterinario:</strong> ${cita.veterinario?.nombre || 'N/A'}</p>
                <p><strong>Fecha y Hora:</strong> ${formatDateTime(cita.fecha_hora)}</p>
                <p><strong>Motivo:</strong> ${cita.motivo || 'N/A'}</p>
                <p><strong>Estado:</strong> 
                    <span class="status-badge" style="background-color: ${getAppointmentStatusColor(cita.estado)}">
                        ${getAppointmentStatus(cita.estado)}
                    </span>
                </p>
                ${cita.notas ? `<p><strong>Notas:</strong> ${cita.notas}</p>` : ''}
            </div>
            <div class="appointment-actions">
                <button class="btn-edit" onclick="editAppointment('${cita._id || cita.id}')">Editar</button>
                <button class="btn-cancel" onclick="cancelAppointment('${cita._id || cita.id}')">Cancelar</button>
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
            const data = await response.json();
            populatePetSelect(data.mascotas || data); // La API puede devolver {mascotas: [...]} o directamente el array
        }
    } catch (error) {
        console.error('Error al cargar mascotas para formulario:', error);
    }
}

// Función para cargar veterinarios para el formulario
async function loadVeterinariosForForm() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios?veterinarios=true`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            populateVetSelect(data.usuarios || data); // La API puede devolver {usuarios: [...]} o directamente el array
        }
    } catch (error) {
        console.error('Error al cargar veterinarios para formulario:', error);
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
        option.value = mascota._id || mascota.id;
        option.textContent = `${mascota.nombre} (${mascota.especie})`;
        petSelect.appendChild(option);
    });
}

// Función para poblar el select de veterinarios
function populateVetSelect(veterinarios) {
    const vetSelect = document.getElementById('appointmentVet');
    if (!vetSelect) return;

    // Limpiar opciones existentes excepto la primera
    vetSelect.innerHTML = '<option value="">Seleccionar veterinario</option>';
    
    veterinarios.forEach(veterinario => {
        const option = document.createElement('option');
        option.value = veterinario._id || veterinario.id;
        option.textContent = `${veterinario.nombre} - ${veterinario.email}`;
        vetSelect.appendChild(option);
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
        modalTitle.textContent = 'Editar Cita';
        loadAppointmentData(appointmentId);
        form.dataset.appointmentId = appointmentId;
    } else {
        modalTitle.textContent = 'Nueva Cita';
        form.reset();
        delete form.dataset.appointmentId;
        
        // Establecer fecha mínima como hoy
        const today = new Date();
        const todayString = today.toISOString().slice(0, 16);
        const dateTimeInput = form.querySelector('[name="fecha_hora"]');
        if (dateTimeInput) {
            dateTimeInput.min = todayString;
        }
    }
    
    modal.style.display = 'block';
}

// Función para cerrar modal de cita
function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    modal.style.display = 'none';
}

// Función para cargar datos de cita
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
            if (response.status === 404) {
                notifications.showError('La cita no fue encontrada.');
            } else {
                notifications.showContextError('citas', 'load');
            }
        }
    } catch (error) {
        console.error('Error al cargar datos de cita:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('citas', 'load');
        }
    }
}

// Función para llenar formulario con datos de cita
function fillAppointmentForm(cita) {
    const form = document.getElementById('appointmentForm');
    
    form.id_mascota.value = cita.id_mascota || '';
    form.id_veterinario.value = cita.id_veterinario || '';
    form.motivo.value = cita.motivo || '';
    form.estado.value = cita.estado || '';
    form.notas.value = cita.notas || '';
    
    // Formatear fecha y hora para input datetime-local
    if (cita.fecha_hora) {
        const fecha = new Date(cita.fecha_hora);
        form.fecha_hora.value = fecha.toISOString().slice(0, 16);
    }
}

// Función para manejar envío del formulario
async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const appointmentId = form.dataset.appointmentId;
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const appointmentData = {
        id_mascota: formData.get('id_mascota'),
        id_veterinario: formData.get('id_veterinario'),
        fecha_hora: new Date(formData.get('fecha_hora')),
        motivo: formData.get('motivo'),
        estado: formData.get('estado'),
        notas: formData.get('notas')
    };
    
    try {
        let response;
        if (appointmentId) {
            // Actualizar cita existente
            response = await fetch(`${API_BASE_URL}/citas/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(appointmentData)
            });
        } else {
            // Crear nueva cita
            response = await fetch(`${API_BASE_URL}/citas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(appointmentData)
            });
        }

        if (response.ok) {
            notifications.showSuccess(appointmentId ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente');
            closeAppointmentModal();
            loadAppointments(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al guardar la cita';
            
            if (response.status === 400) {
                notifications.showError('Datos inválidos. Verifica la información ingresada.');
            } else if (response.status === 409) {
                notifications.showError('Ya existe una cita en ese horario.');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al guardar cita:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('citas', appointmentId ? 'update' : 'create');
        }
    }
}

// Función para editar cita
function editAppointment(appointmentId) {
    openAppointmentModal(appointmentId);
}

// Función para cancelar cita
async function cancelAppointment(appointmentId) {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/citas/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify({ estado: 'Cancelada' })
        });

        if (response.ok) {
            notifications.showSuccess('Cita cancelada exitosamente');
            loadAppointments(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al cancelar la cita';
            
            if (response.status === 404) {
                notifications.showError('La cita no fue encontrada.');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('citas', 'update');
        }
    }
}

// Función para eliminar cita
async function deleteAppointment(appointmentId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
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
            notifications.showSuccess('Cita eliminada exitosamente');
            loadAppointments(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al eliminar la cita';
            
            if (response.status === 404) {
                notifications.showError('La cita no fue encontrada.');
            } else if (response.status === 403) {
                notifications.showContextError('citas', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('citas', 'delete');
        }
    }
}

// Función para filtrar citas por estado
function filterAppointmentsByStatus(status) {
    const appointmentCards = document.querySelectorAll('.appointment-card');
    
    appointmentCards.forEach(card => {
        const statusElement = card.querySelector('.status-badge');
        const cardStatus = statusElement ? statusElement.textContent.trim() : '';
        
        if (status === 'todos' || cardStatus === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para buscar citas
function searchAppointments(query) {
    const appointmentCards = document.querySelectorAll('.appointment-card');
    const searchTerm = query.toLowerCase();

    appointmentCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        
        if (cardText.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para obtener color del estado de la cita
function getAppointmentStatusColor(status) {
    const colors = {
        'Programada': '#007bff',
        'Completada': '#28a745',
        'Cancelada': '#dc3545'
    };
    return colors[status] || '#6c757d';
}

// Función para obtener texto del estado de la cita
function getAppointmentStatus(status) {
    return status || 'Desconocido';
}

// Función para formatear fecha y hora
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funciones de utilidad para mostrar mensajes
function showSuccess(message) {
    notifications.showSuccess(message);
}

function showError(message) {
    notifications.showError(message);
} 