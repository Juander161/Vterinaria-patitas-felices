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
            const historiales = data.historiales || data;
            
            if (historiales.length === 0) {
                notifications.showInfo('No hay historiales médicos registrados');
            }
            
            displayHistories(historiales);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al cargar los historiales médicos';
            
            if (response.status === 404) {
                notifications.showContextError('historiales', 'not_found');
            } else if (response.status === 403) {
                notifications.showContextError('historiales', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al cargar historiales:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('historiales', 'load');
        }
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
        <div class="history-card" data-id="${historial._id || historial.id}">
            <div class="history-info">
                <h3>Historial #${historial._id || historial.id}</h3>
                <p><strong>Mascota:</strong> ${historial.mascota?.nombre || 'N/A'}</p>
                <p><strong>Vacunas:</strong> ${historial.vacunas?.length || 0} registradas</p>
                <p><strong>Alergias:</strong> ${historial.alergias?.length || 0} registradas</p>
                <p><strong>Cirugías:</strong> ${historial.cirugias?.length || 0} registradas</p>
                <p><strong>Enfermedades Crónicas:</strong> ${historial.enfermedades_cronicas?.length || 0} registradas</p>
                <p><strong>Medicamentos Actuales:</strong> ${historial.medicamentos_actuales?.length || 0} registrados</p>
                ${historial.notas_generales ? `<p><strong>Notas:</strong> ${historial.notas_generales}</p>` : ''}
            </div>
            <div class="history-actions">
                ${canEditHistory() ? `<button class="btn-edit" onclick="editHistory('${historial._id || historial.id}')">Editar</button>` : ''}
                ${canDeleteHistory() ? `<button class="btn-delete" onclick="deleteHistory('${historial._id || historial.id}')">Eliminar</button>` : ''}
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

// Función para cargar mascotas para el formulario
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
        console.error('Error al cargar mascotas para historial:', error);
    }
}

// Función para poblar el select de mascotas
function populateHistoryPetSelect(mascotas) {
    const petSelect = document.getElementById('historyPet');
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

    // Event listeners para agregar elementos dinámicos
    setupDynamicFormListeners();
}

// Función para configurar listeners de formulario dinámico
function setupDynamicFormListeners() {
    const addVacunaBtn = document.getElementById('addVacunaBtn');
    const addAlergiaBtn = document.getElementById('addAlergiaBtn');
    const addCirugiaBtn = document.getElementById('addCirugiaBtn');
    const addEnfermedadBtn = document.getElementById('addEnfermedadBtn');
    const addMedicamentoBtn = document.getElementById('addMedicamentoBtn');

    if (addVacunaBtn) {
        addVacunaBtn.addEventListener('click', addVacunaField);
    }
    if (addAlergiaBtn) {
        addAlergiaBtn.addEventListener('click', addAlergiaField);
    }
    if (addCirugiaBtn) {
        addCirugiaBtn.addEventListener('click', addCirugiaField);
    }
    if (addEnfermedadBtn) {
        addEnfermedadBtn.addEventListener('click', addEnfermedadField);
    }
    if (addMedicamentoBtn) {
        addMedicamentoBtn.addEventListener('click', addMedicamentoField);
    }
}

// Funciones para agregar campos dinámicos
function addVacunaField() {
    const container = document.getElementById('vacunasContainer');
    const index = container.children.length;
    
    const vacunaItem = document.createElement('div');
    vacunaItem.className = 'vacuna-item';
    vacunaItem.innerHTML = `
        <div class="form-group">
            <label>Nombre de la Vacuna</label>
            <input type="text" name="vacunas[${index}][nombre]" required>
        </div>
        <div class="form-group">
            <label>Fecha de Aplicación</label>
            <input type="date" name="vacunas[${index}][fecha]" required>
        </div>
        <div class="form-group">
            <label>Próxima Fecha</label>
            <input type="date" name="vacunas[${index}][proxima_fecha]" required>
        </div>
        <div class="form-group">
            <label>Lote</label>
            <input type="text" name="vacunas[${index}][lote]">
        </div>
        <div class="form-group">
            <label>Veterinario</label>
            <input type="text" name="vacunas[${index}][veterinario]">
        </div>
        <button type="button" class="btn-remove" onclick="removeField(this)">Eliminar</button>
    `;
    
    container.appendChild(vacunaItem);
}

function addAlergiaField() {
    const container = document.getElementById('alergiasContainer');
    const index = container.children.length;
    
    const alergiaItem = document.createElement('div');
    alergiaItem.className = 'alergia-item';
    alergiaItem.innerHTML = `
        <div class="form-group">
            <label>Sustancia</label>
            <input type="text" name="alergias[${index}][sustancia]">
        </div>
        <div class="form-group">
            <label>Gravedad</label>
            <select name="alergias[${index}][gravedad]">
                <option value="">Seleccionar</option>
                <option value="Leve">Leve</option>
                <option value="Moderada">Moderada</option>
                <option value="Severa">Severa</option>
            </select>
        </div>
        <div class="form-group">
            <label>Reacción</label>
            <input type="text" name="alergias[${index}][reaccion]">
        </div>
        <button type="button" class="btn-remove" onclick="removeField(this)">Eliminar</button>
    `;
    
    container.appendChild(alergiaItem);
}

function addCirugiaField() {
    const container = document.getElementById('cirugiasContainer');
    const index = container.children.length;
    
    const cirugiaItem = document.createElement('div');
    cirugiaItem.className = 'cirugia-item';
    cirugiaItem.innerHTML = `
        <div class="form-group">
            <label>Nombre de la Cirugía</label>
            <input type="text" name="cirugias[${index}][nombre]">
        </div>
        <div class="form-group">
            <label>Fecha</label>
            <input type="date" name="cirugias[${index}][fecha]">
        </div>
        <div class="form-group">
            <label>Veterinario</label>
            <input type="text" name="cirugias[${index}][veterinario]">
        </div>
        <div class="form-group">
            <label>Descripción</label>
            <textarea name="cirugias[${index}][descripcion]"></textarea>
        </div>
        <div class="form-group">
            <label>Complicaciones</label>
            <textarea name="cirugias[${index}][complicaciones]"></textarea>
        </div>
        <button type="button" class="btn-remove" onclick="removeField(this)">Eliminar</button>
    `;
    
    container.appendChild(cirugiaItem);
}

function addEnfermedadField() {
    const container = document.getElementById('enfermedadesContainer');
    const index = container.children.length;
    
    const enfermedadItem = document.createElement('div');
    enfermedadItem.className = 'enfermedad-item';
    enfermedadItem.innerHTML = `
        <div class="form-group">
            <label>Enfermedad</label>
            <input type="text" name="enfermedades_cronicas[]">
        </div>
        <button type="button" class="btn-remove" onclick="removeField(this)">Eliminar</button>
    `;
    
    container.appendChild(enfermedadItem);
}

function addMedicamentoField() {
    const container = document.getElementById('medicamentosContainer');
    const index = container.children.length;
    
    const medicamentoItem = document.createElement('div');
    medicamentoItem.className = 'medicamento-item';
    medicamentoItem.innerHTML = `
        <div class="form-group">
            <label>Nombre del Medicamento</label>
            <input type="text" name="medicamentos_actuales[${index}][nombre]">
        </div>
        <div class="form-group">
            <label>Dosis</label>
            <input type="text" name="medicamentos_actuales[${index}][dosis]">
        </div>
        <div class="form-group">
            <label>Frecuencia</label>
            <input type="text" name="medicamentos_actuales[${index}][frecuencia]">
        </div>
        <button type="button" class="btn-remove" onclick="removeField(this)">Eliminar</button>
    `;
    
    container.appendChild(medicamentoItem);
}

// Función para eliminar campos dinámicos
function removeField(button) {
    button.parentElement.remove();
}

// Función para abrir modal de historial
function openHistoryModal(historyId = null) {
    const modal = document.getElementById('historyModal');
    const modalTitle = document.getElementById('historyModalTitle');
    const form = document.getElementById('historyForm');
    
    if (historyId) {
        modalTitle.textContent = 'Editar Historial';
        loadHistoryData(historyId);
        form.dataset.historyId = historyId;
    } else {
        modalTitle.textContent = 'Nuevo Historial';
        form.reset();
        delete form.dataset.historyId;
        // Limpiar campos dinámicos
        clearDynamicFields();
    }
    
    modal.style.display = 'block';
}

// Función para cerrar modal de historial
function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'none';
}

// Función para limpiar campos dinámicos
function clearDynamicFields() {
    const containers = ['vacunasContainer', 'alergiasContainer', 'cirugiasContainer', 'enfermedadesContainer', 'medicamentosContainer'];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            // Mantener solo el primer elemento
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
        }
    });
}

// Función para cargar datos de historial
async function loadHistoryData(historyId) {
    try {
        const response = await fetch(`${API_BASE_URL}/historiales/${historyId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (response.ok) {
            const historial = await response.json();
            fillHistoryForm(historial);
        } else {
            if (response.status === 404) {
                notifications.showError('El historial no fue encontrado.');
            } else {
                notifications.showContextError('historiales', 'load');
            }
        }
    } catch (error) {
        console.error('Error al cargar datos de historial:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('historiales', 'load');
        }
    }
}

// Función para llenar formulario con datos de historial
function fillHistoryForm(historial) {
    const form = document.getElementById('historyForm');
    
    // Campos básicos
    form.id_mascota.value = historial.id_mascota || '';
    form.notas_generales.value = historial.notas_generales || '';
    
    // Llenar arrays dinámicos
    fillVacunas(historial.vacunas || []);
    fillAlergias(historial.alergias || []);
    fillCirugias(historial.cirugias || []);
    fillEnfermedades(historial.enfermedades_cronicas || []);
    fillMedicamentos(historial.medicamentos_actuales || []);
}

// Funciones para llenar arrays específicos
function fillVacunas(vacunas) {
    const container = document.getElementById('vacunasContainer');
    container.innerHTML = '';
    
    if (vacunas.length === 0) {
        addVacunaField();
        return;
    }
    
    vacunas.forEach((vacuna, index) => {
        if (index === 0) {
            addVacunaField();
        } else {
            addVacunaField();
        }
        
        const item = container.lastElementChild;
        item.querySelector('[name*="[nombre]"]').value = vacuna.nombre || '';
        item.querySelector('[name*="[fecha]"]').value = vacuna.fecha ? new Date(vacuna.fecha).toISOString().split('T')[0] : '';
        item.querySelector('[name*="[proxima_fecha]"]').value = vacuna.proxima_fecha ? new Date(vacuna.proxima_fecha).toISOString().split('T')[0] : '';
        item.querySelector('[name*="[lote]"]').value = vacuna.lote || '';
        item.querySelector('[name*="[veterinario]"]').value = vacuna.veterinario || '';
    });
}

function fillAlergias(alergias) {
    const container = document.getElementById('alergiasContainer');
    container.innerHTML = '';
    
    if (alergias.length === 0) {
        addAlergiaField();
        return;
    }
    
    alergias.forEach((alergia, index) => {
        if (index === 0) {
            addAlergiaField();
        } else {
            addAlergiaField();
        }
        
        const item = container.lastElementChild;
        item.querySelector('[name*="[sustancia]"]').value = alergia.sustancia || '';
        item.querySelector('[name*="[gravedad]"]').value = alergia.gravedad || '';
        item.querySelector('[name*="[reaccion]"]').value = alergia.reaccion || '';
    });
}

function fillCirugias(cirugias) {
    const container = document.getElementById('cirugiasContainer');
    container.innerHTML = '';
    
    if (cirugias.length === 0) {
        addCirugiaField();
        return;
    }
    
    cirugias.forEach((cirugia, index) => {
        if (index === 0) {
            addCirugiaField();
        } else {
            addCirugiaField();
        }
        
        const item = container.lastElementChild;
        item.querySelector('[name*="[nombre]"]').value = cirugia.nombre || '';
        item.querySelector('[name*="[fecha]"]').value = cirugia.fecha ? new Date(cirugia.fecha).toISOString().split('T')[0] : '';
        item.querySelector('[name*="[veterinario]"]').value = cirugia.veterinario || '';
        item.querySelector('[name*="[descripcion]"]').value = cirugia.descripcion || '';
        item.querySelector('[name*="[complicaciones]"]').value = cirugia.complicaciones || '';
    });
}

function fillEnfermedades(enfermedades) {
    const container = document.getElementById('enfermedadesContainer');
    container.innerHTML = '';
    
    if (enfermedades.length === 0) {
        addEnfermedadField();
        return;
    }
    
    enfermedades.forEach((enfermedad, index) => {
        if (index === 0) {
            addEnfermedadField();
        } else {
            addEnfermedadField();
        }
        
        const item = container.lastElementChild;
        item.querySelector('[name*="enfermedades_cronicas"]').value = enfermedad || '';
    });
}

function fillMedicamentos(medicamentos) {
    const container = document.getElementById('medicamentosContainer');
    container.innerHTML = '';
    
    if (medicamentos.length === 0) {
        addMedicamentoField();
        return;
    }
    
    medicamentos.forEach((medicamento, index) => {
        if (index === 0) {
            addMedicamentoField();
        } else {
            addMedicamentoField();
        }
        
        const item = container.lastElementChild;
        item.querySelector('[name*="[nombre]"]').value = medicamento.nombre || '';
        item.querySelector('[name*="[dosis]"]').value = medicamento.dosis || '';
        item.querySelector('[name*="[frecuencia]"]').value = medicamento.frecuencia || '';
    });
}

// Función para manejar envío del formulario
async function handleHistorySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const historyId = form.dataset.historyId;
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const historyData = {
        id_mascota: formData.get('id_mascota'),
        notas_generales: formData.get('notas_generales')
    };
    
    // Procesar arrays dinámicos
    historyData.vacunas = processVacunas(formData);
    historyData.alergias = processAlergias(formData);
    historyData.cirugias = processCirugias(formData);
    historyData.enfermedades_cronicas = processEnfermedades(formData);
    historyData.medicamentos_actuales = processMedicamentos(formData);
    
    try {
        let response;
        if (historyId) {
            // Actualizar historial existente
            response = await fetch(`${API_BASE_URL}/historiales/${historyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(historyData)
            });
        } else {
            // Crear nuevo historial
            response = await fetch(`${API_BASE_URL}/historiales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(historyData)
            });
        }

        if (response.ok) {
            notifications.showSuccess(historyId ? 'Historial actualizado exitosamente' : 'Historial creado exitosamente');
            closeHistoryModal();
            loadHistories(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al guardar el historial';
            
            if (response.status === 400) {
                notifications.showError('Datos inválidos. Verifica la información ingresada.');
            } else if (response.status === 403) {
                notifications.showContextError('historiales', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al guardar historial:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('historiales', historyId ? 'update' : 'create');
        }
    }
}

// Funciones para procesar arrays del formulario
function processVacunas(formData) {
    const vacunas = [];
    let index = 0;
    
    while (formData.get(`vacunas[${index}][nombre]`)) {
        const vacuna = {
            nombre: formData.get(`vacunas[${index}][nombre]`),
            fecha: new Date(formData.get(`vacunas[${index}][fecha]`)),
            proxima_fecha: new Date(formData.get(`vacunas[${index}][proxima_fecha]`)),
            lote: formData.get(`vacunas[${index}][lote]`),
            veterinario: formData.get(`vacunas[${index}][veterinario]`)
        };
        
        if (vacuna.nombre && vacuna.fecha && vacuna.proxima_fecha) {
            vacunas.push(vacuna);
        }
        
        index++;
    }
    
    return vacunas;
}

function processAlergias(formData) {
    const alergias = [];
    let index = 0;
    
    while (formData.get(`alergias[${index}][sustancia]`)) {
        const alergia = {
            sustancia: formData.get(`alergias[${index}][sustancia]`),
            gravedad: formData.get(`alergias[${index}][gravedad]`),
            reaccion: formData.get(`alergias[${index}][reaccion]`)
        };
        
        if (alergia.sustancia) {
            alergias.push(alergia);
        }
        
        index++;
    }
    
    return alergias;
}

function processCirugias(formData) {
    const cirugias = [];
    let index = 0;
    
    while (formData.get(`cirugias[${index}][nombre]`)) {
        const cirugia = {
            nombre: formData.get(`cirugias[${index}][nombre]`),
            fecha: formData.get(`cirugias[${index}][fecha]`) ? new Date(formData.get(`cirugias[${index}][fecha]`)) : null,
            veterinario: formData.get(`cirugias[${index}][veterinario]`),
            descripcion: formData.get(`cirugias[${index}][descripcion]`),
            complicaciones: formData.get(`cirugias[${index}][complicaciones]`)
        };
        
        if (cirugia.nombre) {
            cirugias.push(cirugia);
        }
        
        index++;
    }
    
    return cirugias;
}

function processEnfermedades(formData) {
    const enfermedades = [];
    const enfermedadesData = formData.getAll('enfermedades_cronicas[]');
    
    enfermedadesData.forEach(enfermedad => {
        if (enfermedad.trim()) {
            enfermedades.push(enfermedad.trim());
        }
    });
    
    return enfermedades;
}

function processMedicamentos(formData) {
    const medicamentos = [];
    let index = 0;
    
    while (formData.get(`medicamentos_actuales[${index}][nombre]`)) {
        const medicamento = {
            nombre: formData.get(`medicamentos_actuales[${index}][nombre]`),
            dosis: formData.get(`medicamentos_actuales[${index}][dosis]`),
            frecuencia: formData.get(`medicamentos_actuales[${index}][frecuencia]`)
        };
        
        if (medicamento.nombre) {
            medicamentos.push(medicamento);
        }
        
        index++;
    }
    
    return medicamentos;
}

// Función para editar historial
function editHistory(historyId) {
    openHistoryModal(historyId);
}

// Función para eliminar historial
async function deleteHistory(historyId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este historial?')) {
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
            notifications.showSuccess('Historial eliminado exitosamente');
            loadHistories(); // Recargar lista
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.msg || errorData.message || 'Error al eliminar el historial';
            
            if (response.status === 404) {
                notifications.showError('El historial no fue encontrado.');
            } else if (response.status === 403) {
                notifications.showContextError('historiales', 'no_permission');
            } else {
                notifications.showError(errorMessage);
            }
        }
    } catch (error) {
        console.error('Error al eliminar historial:', error);
        
        if (error.type === 'network') {
            notifications.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            notifications.showContextError('historiales', 'delete');
        }
    }
}

// Función para filtrar historiales por mascota
function filterHistoriesByPet(petId) {
    const historyCards = document.querySelectorAll('.history-card');
    
    historyCards.forEach(card => {
        const petName = card.querySelector('p').textContent;
        
        if (petId === 'todos' || petName.includes(petId)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para buscar historiales
function searchHistories(query) {
    const historyCards = document.querySelectorAll('.history-card');
    const searchTerm = query.toLowerCase();

    historyCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        
        if (cardText.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Funciones de utilidad para mostrar mensajes (mantenidas para compatibilidad)
function showSuccess(message) {
    notifications.showSuccess(message);
}

function showError(message) {
    notifications.showError(message);
}

// Función para obtener el rol del usuario actual
function getCurrentUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.rol || '';
} 