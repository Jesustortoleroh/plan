// =============================================
// SISTEMA DE ACTIVIDADES - LÓGICA PRINCIPAL
// =============================================

// Datos guardados en el navegador
let actividades = JSON.parse(localStorage.getItem('actividades')) || [];
let editandoId = null;

// =============================================
// INICIALIZAR
// =============================================

function inicializarApp() {
    if (actividades.length === 0) {
        // Datos de ejemplo
        actividades = [
            {
                id: 1,
                codigo: 'ACT-2026-001',
                fecha: '2026-01-15',
                organizacion: 'Hombres Jóvenes',
                nombre: 'Noche de Hogar',
                proposito: 'Fortalecer la unidad de los jóvenes mediante actividades recreativas y espirituales.',
                metas: ['Fortalecer Familias', 'Integración'],
                asistentes: 30,
                responsable: 'Juan Pérez',
                presupuesto: [
                    { cantidad: 10, concepto: 'Refrescos', costo: 5 },
                    { cantidad: 5, concepto: 'Pizzas', costo: 15 }
                ],
                gastos: [
                    { comprobante: 'FAC-001', concepto: 'Refrescos', monto: 45 },
                    { comprobante: 'FAC-002', concepto: 'Pizzas', monto: 70 }
                ],
                estado: 'aprobada'
            },
            {
                id: 2,
                codigo: 'ACT-2026-002',
                fecha: '2026-02-20',
                organizacion: 'Mujeres Jóvenes',
                nombre: 'Actividad de Servicio',
                proposito: 'Realizar servicio comunitario en el barrio.',
                metas: ['Servicio', 'Integración'],
                asistentes: 25,
                responsable: 'María García',
                presupuesto: [
                    { cantidad: 20, concepto: 'Bolsas de basura', costo: 2 },
                    { cantidad: 15, concepto: 'Guantes', costo: 3 }
                ],
                gastos: [
                    { comprobante: 'FAC-003', concepto: 'Bolsas', monto: 35 },
                    { comprobante: 'FAC-004', concepto: 'Guantes', monto: 40 }
                ],
                estado: 'ejecutada'
            }
        ];
        guardarDatos();
    }
    mostrarPagina('dashboard');
}

function guardarDatos() {
    localStorage.setItem('actividades', JSON.stringify(actividades));
}

// =============================================
// NAVEGACIÓN ENTRE PÁGINAS
// =============================================

function mostrarPagina(pagina) {
    // Ocultar todas las páginas
    document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
    
    // Quitar active de todos los links
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    
    // Mostrar la página seleccionada
    document.getElementById(pagina).style.display = 'block';
    
    // Activar el link correspondiente
    const navId = 'nav' + pagina.charAt(0).toUpperCase() + pagina.slice(1);
    document.getElementById(navId).classList.add('active');
    
    // Cargar datos según la página
    if (pagina === 'dashboard') cargarDashboard();
    if (pagina === 'actividades') cargarListaActividades();
    if (pagina === 'reportes') cargarReportes();
}

// =============================================
// DASHBOARD
// =============================================

function cargarDashboard() {
    let totalPres = 0, totalEjec = 0;
    
    actividades.forEach(a => {
        a.presupuesto.forEach(p => totalPres += p.cantidad * p.costo);
        a.gastos.forEach(g => totalEjec += g.monto);
    });
    
    document.getElementById('totalActividades').textContent = actividades.length;
    document.getElementById('totalPresupuesto').textContent = 'Bs. ' + totalPres.toFixed(2);
    document.getElementById('totalEjecutado').textContent = 'Bs. ' + totalEjec.toFixed(2);
    
    const ahorro = totalPres - totalEjec;
    document.getElementById('totalAhorro').textContent = 'Bs. ' + Math.abs(ahorro).toFixed(2);
    document.getElementById('labelAhorro').textContent = ahorro >= 0 ? 'Ahorro' : 'Excedido';
    
    // Últimas 5 actividades
    const html = actividades.slice(-5).reverse().map(a => {
        let pres = 0, ejec = 0;
        a.presupuesto.forEach(p => pres += p.cantidad * p.costo);
        a.gastos.forEach(g => ejec += g.monto);
        
        return `
            <div class="actividad-item">
                <div>
                    <strong>${a.codigo}</strong> - ${a.nombre}
                    <br><small>${a.fecha} | ${a.organizacion} | ${a.responsable || 'Sin responsable'}</small>
                </div>
                <div style="text-align:right;">
                    <span class="badge badge-${a.estado}">${a.estado.replace('_',' ')}</span>
                    <br><small>Pres: Bs.${pres.toFixed(2)} | Gast: Bs.${ejec.toFixed(2)}</small>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('ultimasActividades').innerHTML = html || 
        '<p style="color:#999;text-align:center;padding:30px;">No hay actividades registradas</p>';
}

// =============================================
// LISTA DE ACTIVIDADES
// =============================================

function cargarListaActividades() {
    if (actividades.length === 0) {
        document.getElementById('listaActividades').innerHTML = `
            <div style="text-align:center;padding:60px;color:#999;">
                <p style="font-size:60px;">📋</p>
                <h3>No hay actividades</h3>
                <p>Crea tu primera actividad</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Organización</th>
                    <th>Presupuesto</th>
                    <th>Ejecutado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${actividades.map(a => {
                    let pres = 0, ejec = 0;
                    a.presupuesto.forEach(p => pres += p.cantidad * p.costo);
                    a.gastos.forEach(g => ejec += g.monto);
                    
                    return `
                        <tr>
                            <td><strong>${a.codigo}</strong></td>
                            <td>${a.nombre}</td>
                            <td>${a.fecha}</td>
                            <td>${a.organizacion}</td>
                            <td style="color:#1a237e;">Bs. ${pres.toFixed(2)}</td>
                            <td style="color:#c62828;">Bs. ${ejec.toFixed(2)}</td>
                            <td><span class="badge badge-${a.estado}">${a.estado.replace('_',' ')}</span></td>
                            <td>
                                <button onclick="editarActividad(${a.id})" class="btn btn-sm btn-secondary" title="Editar">✏️</button>
                                <button onclick="eliminarActividad(${a.id})" class="btn btn-sm btn-danger" title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('listaActividades').innerHTML = html;
}

// =============================================
// FORMULARIO - MOSTRAR / CANCELAR
// =============================================

function mostrarFormulario() {
    editandoId = null;
    document.getElementById('tituloFormulario').textContent = 'Nueva Actividad';
    document.getElementById('editandoId').value = '';
    document.getElementById('listaActividades').style.display = 'none';
    document.getElementById('formularioActividad').style.display = 'block';
    
    // Generar código automático
    const año = new Date().getFullYear();
    const count = actividades.filter(a => a.codigo.includes(String(año))).length + 1;
    document.getElementById('codigo').value = `ACT-${año}-${String(count).padStart(3,'0')}`;
    
    // Valores por defecto
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('organizacion').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('proposito').value = '';
    document.getElementById('asistentes').value = 0;
    document.getElementById('responsable').value = '';
    document.getElementById('estado').value = 'borrador';
    
    // Limpiar metas
    document.querySelectorAll('.meta-check input').forEach(cb => cb.checked = false);
    
    // Limpiar presupuesto y gastos
    document.getElementById('itemsPresupuesto').innerHTML = '';
    document.getElementById('itemsGastos').innerHTML = '';
    document.getElementById('totalPresupuestoForm').textContent = 'Bs. 0,00';
    document.getElementById('totalGastosForm').textContent = 'Bs. 0,00';
    
    // Agregar primer item de presupuesto vacío
    agregarItemPresupuesto();
    
    // Scroll al formulario
    document.getElementById('formularioActividad').scrollIntoView({ behavior: 'smooth' });
}

function cancelarFormulario() {
    document.getElementById('formularioActividad').style.display = 'none';
    document.getElementById('listaActividades').style.display = 'block';
    cargarListaActividades();
}

// =============================================
// FORMULARIO - EDITAR
// =============================================

function editarActividad(id) {
    const a = actividades.find(act => act.id === id);
    if (!a) return;
    
    editandoId = id;
    document.getElementById('tituloFormulario').textContent = 'Editar Actividad';
    document.getElementById('editandoId').value = id;
    document.getElementById('listaActividades').style.display = 'none';
    document.getElementById('formularioActividad').style.display = 'block';
    
    // Llenar campos
    document.getElementById('codigo').value = a.codigo;
    document.getElementById('fecha').value = a.fecha;
    document.getElementById('organizacion').value = a.organizacion;
    document.getElementById('nombre').value = a.nombre;
    document.getElementById('proposito').value = a.proposito || '';
    document.getElementById('asistentes').value = a.asistentes || 0;
    document.getElementById('responsable').value = a.responsable || '';
    document.getElementById('estado').value = a.estado;
    
    // Metas
    document.querySelectorAll('.meta-check input').forEach(cb => {
        cb.checked = a.metas && a.metas.includes(cb.value);
    });
    
    // Presupuesto
    document.getElementById('itemsPresupuesto').innerHTML = '';
    if (a.presupuesto.length > 0) {
        a.presupuesto.forEach(item => agregarItemPresupuesto(item));
    } else {
        agregarItemPresupuesto();
    }
    
    // Gastos
    document.getElementById('itemsGastos').innerHTML = '';
    a.gastos.forEach(item => agregarItemGasto(item));
    
    // Calcular totales
    calcularTotalPresupuesto();
    calcularTotalGastos();
    
    // Scroll al formulario
    document.getElementById('formularioActividad').scrollIntoView({ behavior: 'smooth' });
}

// =============================================
// ELIMINAR ACTIVIDAD
// =============================================

function eliminarActividad(id) {
    const a = actividades.find(act => act.id === id);
    if (!a) return;
    
    if (confirm(`¿Está seguro de eliminar la actividad "${a.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        actividades = actividades.filter(act => act.id !== id);
        guardarDatos();
        cargarListaActividades();
    }
}

// =============================================
// PRESUPUESTO - AGREGAR ITEM
// =============================================

function agregarItemPresupuesto(item = {}) {
    const html = `
        <div class="form-row presupuesto-item" style="margin-bottom:8px;">
            <input type="number" placeholder="Cantidad" value="${item.cantidad || 1}" min="1" 
                   class="form-control" onchange="calcularTotalPresupuesto()" style="width:100px;">
            <input type="text" placeholder="Concepto (ej: Refrescos)" value="${item.concepto || ''}" 
                   class="form-control" style="flex:1;">
            <input type="number" placeholder="Costo Unit. Bs." value="${item.costo || 0}" step="0.01" min="0" 
                   class="form-control" onchange="calcularTotalPresupuesto()" style="width:140px;">
            <span class="subtotal-item" style="font-weight:bold;min-width:90px;text-align:right;color:#1a237e;">
                Bs. ${((item.cantidad || 0) * (item.costo || 0)).toFixed(2)}
            </span>
            <button onclick="this.parentElement.remove();calcularTotalPresupuesto();" 
                    class="btn btn-sm btn-danger" title="Eliminar item">✕</button>
        </div>
    `;
    document.getElementById('itemsPresupuesto').insertAdjacentHTML('beforeend', html);
}

function calcularTotalPresupuesto() {
    let total = 0;
    document.querySelectorAll('.presupuesto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const cantidad = parseFloat(inputs[0].value) || 0;
        const costo = parseFloat(inputs[2].value) || 0;
        const subtotal = cantidad * costo;
        row.querySelector('.subtotal-item').textContent = 'Bs. ' + subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById('totalPresupuestoForm').textContent = 'Bs. ' + total.toFixed(2);
}

// =============================================
// GASTOS - AGREGAR ITEM
// =============================================

function agregarItemGasto(item = {}) {
    const html = `
        <div class="form-row gasto-item" style="margin-bottom:8px;">
            <input type="text" placeholder="Comp. (FAC-001)" value="${item.comprobante || ''}" 
                   class="form-control" style="width:120px;">
            <input type="text" placeholder="Concepto del gasto" value="${item.concepto || ''}" 
                   class="form-control" style="flex:1;">
            <input type="number" placeholder="Monto Bs." value="${item.monto || 0}" step="0.01" min="0" 
                   class="form-control" onchange="calcularTotalGastos()" style="width:140px;">
            <button onclick="this.parentElement.remove();calcularTotalGastos();" 
                    class="btn btn-sm btn-danger" title="Eliminar gasto">✕</button>
        </div>
    `;
    document.getElementById('itemsGastos').insertAdjacentHTML('beforeend', html);
}

function calcularTotalGastos() {
    let total = 0;
    document.querySelectorAll('.gasto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        total += parseFloat(inputs[2].value) || 0;
    });
    document.getElementById('totalGastosForm').textContent = 'Bs. ' + total.toFixed(2);
}

// =============================================
// GUARDAR ACTIVIDAD
// =============================================

function guardarActividad() {
    const nombre = document.getElementById('nombre').value.trim();
    const organizacion = document.getElementById('organizacion').value;
    
    // Validar campos requeridos
    if (!nombre) {
        alert('⚠️ Por favor ingrese el nombre de la actividad');
        document.getElementById('nombre').focus();
        return;
    }
    if (!organizacion) {
        alert('⚠️ Por favor seleccione una organización');
        document.getElementById('organizacion').focus();
        return;
    }
    
    // Recoger metas seleccionadas
    const metas = [];
    document.querySelectorAll('.meta-check input:checked').forEach(cb => {
        metas.push(cb.value);
    });
    
    // Recoger items de presupuesto
    const presupuesto = [];
    document.querySelectorAll('.presupuesto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const cantidad = parseInt(inputs[0].value) || 0;
        const concepto = inputs[1].value.trim();
        const costo = parseFloat(inputs[2].value) || 0;
        
        if (concepto && cantidad > 0) {
            presupuesto.push({ cantidad, concepto, costo });
        }
    });
    
    // Recoger gastos
    const gastos = [];
    document.querySelectorAll('.gasto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const concepto = inputs[1].value.trim();
        const monto = parseFloat(inputs[2].value) || 0;
        
        if (concepto && monto > 0) {
            gastos.push({
                comprobante: inputs[0].value.trim(),
                concepto: concepto,
                monto: monto
            });
        }
    });
    
    // Crear objeto actividad
    const actividad = {
        id: editandoId || Date.now(),
        codigo: document.getElementById('codigo').value,
        fecha: document.getElementById('fecha').value,
        organizacion: organizacion,
        nombre: nombre,
        proposito: document.getElementById('proposito').value.trim(),
        metas: metas,
        asistentes: parseInt(document.getElementById('asistentes').value) || 0,
        responsable: document.getElementById('responsable').value.trim(),
        presupuesto: presupuesto,
        gastos: gastos,
        estado: document.getElementById('estado').value
    };
    
    // Guardar (actualizar o crear)
    if (editandoId) {
        actividades = actividades.map(a => a.id === editandoId ? actividad : a);
    } else {
        actividades.push(actividad);
    }
    
    guardarDatos();
    
    // Volver a la lista
    cancelarFormulario();
    
    // Mensaje de éxito
    mostrarMensaje('✅ Actividad guardada exitosamente');
}

// =============================================
// MENSAJE TEMPORAL
// =============================================

function mostrarMensaje(texto) {
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        font-weight: 500;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    mensaje.textContent = texto;
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.style.opacity = '0';
        mensaje.style.transition = 'opacity 0.5s';
        setTimeout(() => mensaje.remove(), 500);
    }, 2500);
}

// =============================================
// REPORTES
// =============================================

function cargarReportes() {
    let totalPres = 0, totalEjec = 0;
    
    actividades.forEach(a => {
        a.presupuesto.forEach(p => totalPres += p.cantidad * p.costo);
        a.gastos.forEach(g => totalEjec += g.monto);
    });
    
    document.getElementById('rptActividades').textContent = actividades.length;
    document.getElementById('rptPresupuesto').textContent = 'Bs. ' + totalPres.toFixed(2);
    document.getElementById('rptEjecutado').textContent = 'Bs. ' + totalEjec.toFixed(2);
    
    const ahorro = totalPres - totalEjec;
    document.getElementById('rptAhorro').textContent = 'Bs. ' + Math.abs(ahorro).toFixed(2);
    document.getElementById('rptLabelAhorro').textContent = ahorro >= 0 ? 'Ahorro' : 'Excedido';
}

// =============================================
// EXPORTAR PDF
// =============================================

function exportarPDF() {
    let totalPres = 0, totalEjec = 0;
    actividades.forEach(a => {
        a.presupuesto.forEach(p => totalPres += p.cantidad * p.costo);
        a.gastos.forEach(g => totalEjec += g.monto);
    });
    
    const ventana = window.open('', '_blank', 'width=900,height=700');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Actividades</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
                h1 { color: #1a237e; text-align: center; border-bottom: 3px solid #1a237e; padding-bottom: 10px; }
                h2 { color: #1a237e; margin-top: 25px; }
                .fecha { text-align: center; color: #666; margin-bottom: 20px; }
                
                .resumen { display: flex; justify-content: space-around; margin: 20px 0; gap: 15px; }
                .caja { 
                    background: #f5f5f5; padding: 15px 25px; border-radius: 8px; 
                    text-align: center; border: 1px solid #e0e0e0; flex: 1;
                }
                .caja .numero { font-size: 22px; font-weight: bold; color: #1a237e; }
                .caja .etiqueta { font-size: 11px; color: #666; }
                
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th { background: #1a237e; color: white; padding: 10px; text-align: left; font-size: 12px; }
                td { padding: 8px 10px; border-bottom: 1px solid #e0e0e0; font-size: 12px; }
                tr:nth-child(even) { background: #f9f9f9; }
                
                .estado {
                    display: inline-block; padding: 3px 10px; border-radius: 12px;
                    font-size: 10px; font-weight: bold; text-transform: uppercase;
                }
                .aprobada { background: #e8f5e9; color: #2e7d32; }
                .borrador { background: #f5f5f5; color: #757575; }
                .ejecutada { background: #e3f2fd; color: #1565c0; }
                .rendida { background: #f3e5f5; color: #7b1fa2; }
                .cerrada { background: #eceff1; color: #546e7a; }
                .en_revision { background: #fff3e0; color: #ef6c00; }
                
                .firma { margin-top: 50px; display: flex; justify-content: space-around; }
                .firma-linea { text-align: center; }
                .firma-linea .linea { border-top: 1px solid #333; width: 200px; margin: 40px auto 5px; }
                
                button {
                    background: #1a237e; color: white; border: none;
                    padding: 10px 25px; border-radius: 5px; cursor: pointer;
                    font-size: 14px; margin: 5px;
                }
                button:hover { background: #283593; }
                
                @media print { button { display: none; } body { padding: 0; } }
            </style>
        </head>
        <body>
            <div style="text-align:center;margin-bottom:15px;">
                <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                <button onclick="window.close()">❌ Cerrar</button>
            </div>
            
            <h1>📋 REPORTE DE ACTIVIDADES</h1>
            <p class="fecha">Generado: ${new Date().toLocaleDateString('es-VE', {year:'numeric', month:'long', day:'numeric'})}</p>
            
            <h2>📊 Resumen General</h2>
            <div class="resumen">
                <div class="caja">
                    <div class="numero">${actividades.length}</div>
                    <div class="etiqueta">Actividades</div>
                </div>
                <div class="caja">
                    <div class="numero">Bs. ${totalPres.toFixed(2)}</div>
                    <div class="etiqueta">Presupuestado</div>
                </div>
                <div class="caja">
                    <div class="numero">Bs. ${totalEjec.toFixed(2)}</div>
                    <div class="etiqueta">Ejecutado</div>
                </div>
                <div class="caja">
                    <div class="numero">Bs. ${(totalPres - totalEjec).toFixed(2)}</div>
                    <div class="etiqueta">${totalPres >= totalEjec ? 'Ahorro' : 'Excedido'}</div>
                </div>
            </div>
            
            <h2>📋 Detalle de Actividades</h2>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Fecha</th>
                        <th>Organización</th>
                        <th>Estado</th>
                        <th>Presupuesto</th>
                        <th>Ejecutado</th>
                    </tr>
                </thead>
                <tbody>
                    ${actividades.map(a => {
                        let pres = 0, ejec = 0;
                        a.presupuesto.forEach(p => pres += p.cantidad * p.costo);
                        a.gastos.forEach(g => ejec += g.monto);
                        return `
                            <tr>
                                <td><strong>${a.codigo}</strong></td>
                                <td>${a.nombre}</td>
                                <td>${a.fecha}</td>
                                <td>${a.organizacion}</td>
                                <td><span class="estado ${a.estado}">${a.estado.replace('_',' ')}</span></td>
                                <td>Bs. ${pres.toFixed(2)}</td>
                                <td>Bs. ${ejec.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="firma">
                <div class="firma-linea">
                    <div class="linea"></div>
                    <span>Presidente / Obispo</span>
                </div>
                <div class="firma-linea">
                    <div class="linea"></div>
                    <span>Secretario</span>
                </div>
            </div>
            
            <p style="text-align:center;color:#999;font-size:10px;margin-top:30px;">
                Sistema de Actividades v1.0 - Generado el ${new Date().toLocaleDateString()}
            </p>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

// =============================================
// EXPORTAR EXCEL (CSV)
// =============================================

function exportarExcel() {
    if (actividades.length === 0) {
        alert('No hay actividades para exportar');
        return;
    }
    
    let csv = 'Código,Nombre,Fecha,Organización,Estado,Presupuesto,Ejecutado,Diferencia\n';
    
    actividades.forEach(a => {
        let pres = 0, ejec = 0;
        a.presupuesto.forEach(p => pres += p.cantidad * p.costo);
        a.gastos.forEach(g => ejec += g.monto);
        
        csv += `"${a.codigo}","${a.nombre}","${a.fecha}","${a.organizacion}","${a.estado}",${pres.toFixed(2)},${ejec.toFixed(2)},${(pres - ejec).toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'actividades_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    
    mostrarMensaje('📥 Archivo CSV descargado');
}

// =============================================
// LIMPIAR DATOS
// =============================================

function limpiarDatos() {
    if (confirm('⚠️ ¿Está seguro de eliminar TODAS las actividades?\n\nEsta acción no se puede deshacer.')) {
        if (confirm('¿Realmente desea borrar todos los datos?')) {
            actividades = [];
            guardarDatos();
            cargarReportes();
            mostrarMensaje('🗑️ Todos los datos han sido eliminados');
        }
    }
}

// =============================================
// INICIAR APLICACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Actividades iniciado');
    inicializarApp();
});