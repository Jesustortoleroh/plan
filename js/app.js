// ============================================================
//  GASTOS - FUNCIONALIDAD DINÁMICA COMPLETA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== ELEMENTOS DEL DOM =====
    const gastosBody = document.getElementById('gastosBody');
    const agregarBtn = document.getElementById('agregarGasto');
    const gastosForm = document.getElementById('gastosForm');
    const gastoCount = document.getElementById('gastoCount');
    const themeToggle = document.getElementById('themeToggle');

    // ===== VARIABLES GLOBALES =====
    let contadorFilas = document.querySelectorAll('.gasto-row').length;
    let toastTimeout = null;

    // ============================================================
    //  FUNCIÓN: AGREGAR GASTO
    // ============================================================
    agregarBtn.addEventListener('click', function() {
        contadorFilas++;
        
        const nuevaFila = document.createElement('tr');
        nuevaFila.className = 'gasto-row';
        nuevaFila.dataset.id = contadorFilas;
        
        nuevaFila.innerHTML = `
            <td>
                <input type="text" 
                       id="comprobante_${contadorFilas}" 
                       name="comprobante_${contadorFilas}"
                       placeholder="Ej: FAC-00${contadorFilas}" 
                       aria-label="Número de comprobante" 
                       autocomplete="off"
                       required>
            </td>
            <td>
                <input type="text" 
                       id="concepto_${contadorFilas}" 
                       name="concepto_${contadorFilas}"
                       placeholder="Ej: Nuevo concepto" 
                       aria-label="Concepto del gasto" 
                       autocomplete="off"
                       required>
            </td>
            <td>
                <input type="date" 
                       id="fecha_${contadorFilas}" 
                       name="fecha_${contadorFilas}"
                       aria-label="Fecha del gasto" 
                       required>
            </td>
            <td>
                <input type="text" 
                       id="proveedor_${contadorFilas}" 
                       name="proveedor_${contadorFilas}"
                       placeholder="Ej: Nuevo proveedor" 
                       aria-label="Nombre del proveedor" 
                       autocomplete="off"
                       required>
            </td>
            <td>
                <input type="number" 
                       id="monto_${contadorFilas}" 
                       name="monto_${contadorFilas}"
                       placeholder="0.00" 
                       step="0.01" 
                       min="0" 
                       aria-label="Monto del gasto" 
                       required>
            </td>
            <td>
                <button type="button" 
                        class="btn-eliminar" 
                        aria-label="Eliminar este gasto" 
                        onclick="eliminarGasto(this)">
                    ✕
                </button>
            </td>
        `;
        
        gastosBody.appendChild(nuevaFila);
        actualizarContador();
        
        // Enfocar el primer input de la nueva fila
        const primerInput = nuevaFila.querySelector('input');
        if (primerInput) {
            setTimeout(() => {
                primerInput.focus();
                primerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);
        }
        
        // Mostrar notificación
        mostrarNotificacion('Nuevo gasto agregado', 'success');
    });

    // ============================================================
    //  FUNCIÓN: ELIMINAR GASTO
    // ============================================================
    window.eliminarGasto = function(btn) {
        const fila = btn.closest('tr');
        const totalFilas = document.querySelectorAll('.gasto-row').length;
        
        // Validar que no sea la última fila
        if (totalFilas <= 1) {
            mostrarNotificacion('Debe haber al menos un gasto', 'warning');
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 300);
            return;
        }
        
        // Confirmar eliminación
        if (confirm('¿Estás seguro de eliminar este gasto?')) {
            fila.style.animation = 'fadeOut 0.3s ease';
            fila.classList.add('removing');
            
            setTimeout(() => {
                fila.remove();
                actualizarContador();
                mostrarNotificacion('Gasto eliminado correctamente', 'success');
                
                // Re-indexar IDs
                reindexarFilas();
            }, 300);
        }
    };

    // ============================================================
    //  FUNCIÓN: REINDEXAR FILAS
    // ============================================================
    function reindexarFilas() {
        const filas = document.querySelectorAll('.gasto-row');
        filas.forEach((fila, index) => {
            const nuevoId = index + 1;
            fila.dataset.id = nuevoId;
            
            const inputs = fila.querySelectorAll('input');
            const ids = ['comprobante', 'concepto', 'fecha', 'proveedor', 'monto'];
            
            inputs.forEach((input, i) => {
                if (i < ids.length) {
                    input.id = `${ids[i]}_${nuevoId}`;
                    input.name = `${ids[i]}_${nuevoId}`;
                }
            });
            
            // Actualizar placeholder del comprobante
            const comprobanteInput = inputs[0];
            if (comprobanteInput) {
                comprobanteInput.placeholder = `Ej: FAC-00${nuevoId}`;
            }
        });
    }

    // ============================================================
    //  FUNCIÓN: ACTUALIZAR CONTADOR
    // ============================================================
    function actualizarContador() {
        const total = document.querySelectorAll('.gasto-row').length;
        const texto = total === 1 ? 'gasto' : 'gastos';
        gastoCount.textContent = `${total} ${texto}`;
        
        // Animación sutil
        gastoCount.style.animation = 'none';
        setTimeout(() => {
            gastoCount.style.animation = 'pulse 0.3s ease';
        }, 10);
    }

    // ============================================================
    //  FUNCIÓN: VALIDAR FORMULARIO
    // ============================================================
    function validarFormulario(form) {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        let firstInvalid = null;
        
        inputs.forEach(input => {
            // Remover estilos de error previos
            input.style.borderColor = '';
            
            // Validar campo vacío
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--danger)';
                if (!firstInvalid) firstInvalid = input;
            }
            
            // Validar formato de número
            if (input.type === 'number' && input.value.trim()) {
                const valor = parseFloat(input.value);
                if (isNaN(valor) || valor < 0) {
                    isValid = false;
                    input.style.borderColor = 'var(--danger)';
                    if (!firstInvalid) firstInvalid = input;
                }
            }
            
            // Validar fecha
            if (input.type === 'date' && input.value.trim()) {
                const fecha = new Date(input.value);
                if (isNaN(fecha.getTime())) {
                    isValid = false;
                    input.style.borderColor = 'var(--danger)';
                    if (!firstInvalid) firstInvalid = input;
                }
            }
        });
        
        if (!isValid && firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return { isValid, firstInvalid };
    }

    // ============================================================
    //  FUNCIÓN: RECOPILAR DATOS
    // ============================================================
    function recopilarDatos() {
        const gastos = [];
        const filas = document.querySelectorAll('.gasto-row');
        
        filas.forEach((fila, index) => {
            const inputs = fila.querySelectorAll('input');
            if (inputs.length >= 5) {
                const comprobante = inputs[0].value.trim();
                const concepto = inputs[1].value.trim();
                const fecha = inputs[2].value.trim();
                const proveedor = inputs[3].value.trim();
                const monto = parseFloat(inputs[4].value) || 0;
                
                gastos.push({
                    id: index + 1,
                    comprobante: comprobante || 'Sin comprobante',
                    concepto: concepto || 'Sin concepto',
                    fecha: fecha || new Date().toISOString().split('T')[0],
                    proveedor: proveedor || 'Sin proveedor',
                    monto: monto
                });
            }
        });
        
        return gastos;
    }

    // ============================================================
    //  FUNCIÓN: GUARDAR GASTOS
    // ============================================================
    gastosForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulario
        const { isValid, firstInvalid } = validarFormulario(this);
        
        if (!isValid) {
            mostrarNotificacion('Por favor, complete todos los campos correctamente', 'error');
            return;
        }
        
        // Recopilar datos
        const gastos = recopilarDatos();
        
        // Guardar en localStorage
        try {
            localStorage.setItem('gastos', JSON.stringify(gastos));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
        
        // Mostrar éxito
        console.log('📊 Gastos guardados:', gastos);
        mostrarNotificacion(`✅ ${gastos.length} gastos guardados correctamente`, 'success');
        
        // Disparar evento personalizado
        const event = new CustomEvent('gastosGuardados', {
            detail: { gastos }
        });
        document.dispatchEvent(event);
    });

    // ============================================================
    //  FUNCIÓN: CARGAR GASTOS GUARDADOS
    // ============================================================
    function cargarGastosGuardados() {
        try {
            const data = localStorage.getItem('gastos');
            if (!data) return false;
            
            const gastos = JSON.parse(data);
            if (!Array.isArray(gastos) || gastos.length === 0) return false;
            
            // Limpiar tabla actual
            gastosBody.innerHTML = '';
            
            // Crear filas con los datos guardados
            gastos.forEach((gasto, index) => {
                const fila = document.createElement('tr');
                fila.className = 'gasto-row';
                fila.dataset.id = index + 1;
                
                fila.innerHTML = `
                    <td>
                        <input type="text" 
                               id="comprobante_${index + 1}" 
                               name="comprobante_${index + 1}"
                               value="${escapeHTML(gasto.comprobante || '')}"
                               placeholder="Ej: FAC-00${index + 1}" 
                               aria-label="Número de comprobante" 
                               autocomplete="off"
                               required>
                    </td>
                    <td>
                        <input type="text" 
                               id="concepto_${index + 1}" 
                               name="concepto_${index + 1}"
                               value="${escapeHTML(gasto.concepto || '')}"
                               placeholder="Ej: Concepto" 
                               aria-label="Concepto del gasto" 
                               autocomplete="off"
                               required>
                    </td>
                    <td>
                        <input type="date" 
                               id="fecha_${index + 1}" 
                               name="fecha_${index + 1}"
                               value="${escapeHTML(gasto.fecha || '')}"
                               aria-label="Fecha del gasto" 
                               required>
                    </td>
                    <td>
                        <input type="text" 
                               id="proveedor_${index + 1}" 
                               name="proveedor_${index + 1}"
                               value="${escapeHTML(gasto.proveedor || '')}"
                               placeholder="Ej: Proveedor" 
                               aria-label="Nombre del proveedor" 
                               autocomplete="off"
                               required>
                    </td>
                    <td>
                        <input type="number" 
                               id="monto_${index + 1}" 
                               name="monto_${index + 1}"
                               value="${gasto.monto || ''}"
                               placeholder="0.00" 
                               step="0.01" 
                               min="0" 
                               aria-label="Monto del gasto" 
                               required>
                    </td>
                    <td>
                        <button type="button" 
                                class="btn-eliminar" 
                                aria-label="Eliminar este gasto" 
                                onclick="eliminarGasto(this)">
                            ✕
                        </button>
                    </td>
                `;
                
                gastosBody.appendChild(fila);
            });
            
            contadorFilas = gastos.length;
            actualizarContador();
            return true;
        } catch (error) {
            console.error('Error al cargar gastos guardados:', error);
            return false;
        }
    }

    // ============================================================
    //  FUNCIÓN: ESCAPE HTML (seguridad)
    // ============================================================
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================================
    //  FUNCIÓN: NOTIFICACIONES
    // ============================================================
    function mostrarNotificacion(mensaje, tipo = 'info') {
        // Eliminar notificación anterior
        const existing = document.querySelector('.toast-notification');
        if (existing) {
            existing.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => existing.remove(), 300);
        }
        
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
        
        // Crear nueva notificación
        const toast = document.createElement('div');
        toast.className = `toast-notification ${tipo}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = mensaje;
        
        document.body.appendChild(toast);
        
        // Auto-cerrar después de 4 segundos
        toastTimeout = setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                    toastTimeout = null;
                }, 300);
            }
        }, 4000);
    }

    // ============================================================
    //  FUNCIÓN: TOGGLE TEMA
    // ============================================================
    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Actualizar ícono del botón
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌓';
        
        // Mostrar notificación
        mostrarNotificacion(
            `Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
            'info'
        );
    }

    // ============================================================
    //  EVENTOS Y CONFIGURACIÓN INICIAL
    // ============================================================
    
    // 1. Cargar tema guardado
    (function cargarTema() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const html = document.documentElement;
        html.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌓';
    })();

    // 2. Evento del toggle de tema
    themeToggle.addEventListener('click', toggleTheme);

    // 3. Cargar gastos guardados (si existen)
    const cargados = cargarGastosGuardados();
    if (!cargados) {
        // Si no hay datos guardados, mantener las filas de ejemplo
        contadorFilas = document.querySelectorAll('.gasto-row').length;
        actualizarContador();
    }

    // 4. Evento para tecla Escape (cerrar notificaciones)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const toast = document.querySelector('.toast-notification');
            if (toast) {
                toast.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }
    });

    // 5. Evento para limpiar validación al escribir
    document.addEventListener('input', function(e) {
        if (e.target.closest('.gastos-table') && e.target.tagName === 'INPUT') {
            e.target.style.borderColor = '';
        }
    });

    // ============================================================
    //  INYECTAR ESTILOS ADICIONALES
    // ============================================================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { 
                opacity: 0; 
                transform: translateY(-10px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }
        
        @keyframes fadeOut {
            from { 
                opacity: 1; 
                transform: translateX(0); 
            }
            to { 
                opacity: 0; 
                transform: translateX(20px); 
            }
        }
        
        @keyframes slideUp {
            from { 
                opacity: 0; 
                transform: translateY(20px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }
        
        @keyframes slideDown {
            from { 
                opacity: 1; 
                transform: translateY(0); 
            }
            to { 
                opacity: 0; 
                transform: translateY(20px); 
            }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .gasto-row.removing {
            animation: fadeOut 0.3s ease forwards;
        }
    `;
    document.head.appendChild(style);

    // ============================================================
    //  EXPORTAR FUNCIONES PARA USO GLOBAL
    // ============================================================
    window.gastosApp = {
        agregarGasto: function() {
            agregarBtn.click();
        },
        eliminarGasto: window.eliminarGasto,
        recopilarDatos: recopilarDatos,
        guardarGastos: function() {
            gastosForm.dispatchEvent(new Event('submit'));
        },
        limpiarGastos: function() {
            if (confirm('¿Eliminar todos los gastos?')) {
                const filas = document.querySelectorAll('.gasto-row');
                if (filas.length <= 1) {
                    mostrarNotificacion('Debe haber al menos un gasto', 'warning');
                    return;
                }
                filas.forEach((fila, index) => {
                    if (index > 0) {
                        fila.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => fila.remove(), 300);
                    }
                });
                setTimeout(() => {
                    actualizarContador();
                    mostrarNotificacion('Gastos eliminados', 'success');
                }, 350);
            }
        }
    };

    console.log('✅ Gastos App inicializada correctamente');
    console.log('📊 Funciones disponibles: window.gastosApp');
});