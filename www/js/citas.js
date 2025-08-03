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
        showInfo('Cargando citas...');
        
        const response = await fetch(`${window.API_BASE_URL}/citas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const citas = data.citas || data.data || [];
            
            if (citas.length === 0) {
                showInfo('No hay citas programadas');
            } else {
                showSuccess(`${citas.length} citas cargadas`);
            }
            
            displayAppointments(citas);
        } else {
            showError('Error al cargar las citas');
            displayAppointments([]);
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
        showError('Error de conexión. Verifica que la API esté funcionando.');
        displayAppointments([]);
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
        const response = await fetch(`${window.API_BASE_URL}/mascotas`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const mascotas = data.mascotas || data.data || [];
            populatePetSelect(mascotas);
        } else {
            console.error('Error al cargar mascotas');
        }
    } catch (error) {
        console.error('Error al cargar mascotas para formulario:', error);
    }
}

// Función para cargar veterinarios para el formulario
async function loadVeterinariosForForm() {
    try {
        console.log('Cargando veterinarios...');
        const response = await fetch(`${window.API_BASE_URL}/usuarios`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const usuarios = data.usuarios || data.data || [];
            console.log('Usuarios cargados:', usuarios.length);
            
            // Filtrar solo veterinarios
            const veterinarios = usuarios.filter(user => user.rol === 'veterinario');
            console.log('Veterinarios encontrados:', veterinarios.length);
            
            populateVetSelect(veterinarios);
        } else {
            console.error('Error al cargar veterinarios: respuesta no exitosa');
            // Crear un veterinario por defecto para admin
            const defaultVet = {
                _id: 'default',
                nombre: 'Veterinario por defecto',
                email: 'veterinario@clinica.com'
            };
            populateVetSelect([defaultVet]);
        }
    } catch (error) {
        console.error('Error al cargar veterinarios para formulario:', error);
        // En caso de error, crear un veterinario por defecto
        const defaultVet = {
            _id: 'default',
            nombre: 'Veterinario por defecto',
            email: 'veterinario@clinica.com'
        };
        populateVetSelect([defaultVet]);
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
            console.log('Botón Nueva Cita clickeado');
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
        const response = await fetch(`${window.API_BASE_URL}/citas/${appointmentId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            const cita = data.cita || data.data;
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

    console.log('Datos de la cita:', appointmentData);

    // Validar datos requeridos
    if (!appointmentData.id_mascota) {
        notifications.showError('Debes seleccionar una mascota');
        return;
    }

    if (!appointmentData.id_veterinario) {
        notifications.showError('Debes seleccionar un veterinario');
        return;
    }

    if (!formData.get('fecha_hora')) {
        notifications.showError('Debes seleccionar una fecha y hora');
        return;
    }

    try {
        let response;
        if (appointmentId) {
            // Actualizar cita existente
            console.log('Actualizando cita:', appointmentId);
            response = await fetch(`${window.API_BASE_URL}/citas/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(appointmentData)
            });
        } else {
            // Crear nueva cita
            console.log('Creando nueva cita');
            response = await fetch(`${window.API_BASE_URL}/citas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(appointmentData)
            });
        }

        console.log('Respuesta del servidor:', response.status);
        const data = await window.handleApiResponse(response);

        if (data && data.success) {
            notifications.showSuccess(appointmentId ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente');
            closeAppointmentModal();
            loadAppointments(); // Recargar lista
        } else {
            const errorMessage = data.msg || data.message || 'Error al guardar la cita';
            console.error('Error en respuesta:', data);
            
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
            notifications.showError(`Error al guardar cita: ${error.message}`);
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
        const response = await fetch(`
// F
unciones de utilidad para mostrar mensajes
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

// Función para formatear fecha y hora
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para obtener el estado de una cita en español
function getAppointmentStatus(status) {
    const statusMap = {
        'Programada': 'Programada',
        'Completada': 'Completada',
        'Cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
}

// Función para obtener el color del estado de una cita
function getAppointmentStatusColor(status) {
    const colorMap = {
        'Programada': '#ffc107',
        'Completada': '#28a745',
        'Cancelada': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
}