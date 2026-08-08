// =============================================
// SISTEMA DE ACTIVIDADES - SIMPLIFICADO
// =============================================

let actividades = JSON.parse(localStorage.getItem('actividades')) || [];
let editandoId = null;

// =============================================
// INICIALIZAR
// =============================================

function inicializarApp() {
    if (actividades.length === 0) {
        actividades = [
            {
                id: 1,
                codigo: 'ACT-2026-001',
                fecha: '2026-01-15',
                organizacion: 'Hombres Jóvenes',
                nombre: 'Noche de Hogar',
                proposito: 'Fortalecer la unidad de los jóvenes.',
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
            }
        ];
        guardarDatos();
    }
    mostrarLista();
}

function guardarDatos() {
    localStorage.setItem('actividades', JSON.stringify(actividades));
}

// =============================================
// MOSTRAR LISTA
// =============================================

function mostrarLista() {
    document.getElementById('listaActividades').style.display = 'block';
    document.getElementById('formularioActividad').style.display = 'none';
    document.getElementById('navLista').classList.add('active');
    document.getElementById('navNueva').classList.remove('active');
    cargarTabla();
}

function cargarTabla() {
    if (actividades.length === 0) {
        document.getElementById('tablaActividades').innerHTML = `
            <div style="text-align:center;padding:60px;background:white;border-radius:12px;">
                <p style="font-size:60px;">📋</p>
                <h3>No hay actividades</h3>
                <p style="color:#666;">Crea tu primera actividad</p>
            </div>
        `;
        return;
    }
    
    document.getElementById('tablaActividades').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Organización</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${actividades.map(a => `
                    <tr>
                        <td><strong>${a.codigo}</strong></td>
                        <td>${a.nombre}</td>
                        <td>${a.fecha}</td>
                        <td>${a.organizacion}</td>
                        <td><span class="badge badge-${a.estado}">${a.estado.replace('_',' ')}</span></td>
                        <td>
                            <button onclick="editarActividad(${a.id})" class="btn btn-sm btn-secondary">✏️</button>
                            <button onclick="generarPDFactividad(${a.id})" class="btn btn-sm btn-danger">📄</button>
                            <button onclick="eliminarActividad(${a.id})" class="btn btn-sm btn-danger">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// =============================================
// FORMULARIO
// =============================================

function mostrarFormulario() {
    editandoId = null;
    document.getElementById('tituloFormulario').textContent = 'Nueva Actividad';
    document.getElementById('editandoId').value = '';
    document.getElementById('listaActividades').style.display = 'none';
    document.getElementById('formularioActividad').style.display = 'block';
    document.getElementById('navLista').classList.remove('active');
    document.getElementById('navNueva').classList.add('active');
    
    const año = new Date().getFullYear();
    const count = actividades.filter(a => a.codigo.includes(String(año))).length + 1;
    document.getElementById('codigo').value = `ACT-${año}-${String(count).padStart(3,'0')}`;
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('organizacion').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('proposito').value = '';
    document.getElementById('asistentes').value = 0;
    document.getElementById('responsable').value = '';
    document.getElementById('estado').value = 'borrador';
    document.getElementById('itemsPresupuesto').innerHTML = '';
    document.getElementById('itemsGastos').innerHTML = '';
    
    document.querySelectorAll('.meta-check input').forEach(cb => cb.checked = false);
    
    agregarItemPresupuesto();
    actualizarComparativo();
    document.getElementById('formularioActividad').scrollIntoView({ behavior: 'smooth' });
}

function cancelarFormulario() {
    mostrarLista();
}

function editarActividad(id) {
    const a = actividades.find(act => act.id === id);
    if (!a) return;
    
    editandoId = id;
    document.getElementById('tituloFormulario').textContent = 'Editar Actividad';
    document.getElementById('editandoId').value = id;
    document.getElementById('listaActividades').style.display = 'none';
    document.getElementById('formularioActividad').style.display = 'block';
    document.getElementById('navLista').classList.remove('active');
    document.getElementById('navNueva').classList.add('active');
    
    document.getElementById('codigo').value = a.codigo;
    document.getElementById('fecha').value = a.fecha;
    document.getElementById('organizacion').value = a.organizacion;
    document.getElementById('nombre').value = a.nombre;
    document.getElementById('proposito').value = a.proposito || '';
    document.getElementById('asistentes').value = a.asistentes || 0;
    document.getElementById('responsable').value = a.responsable || '';
    document.getElementById('estado').value = a.estado;
    
    document.querySelectorAll('.meta-check input').forEach(cb => {
        cb.checked = a.metas && a.metas.includes(cb.value);
    });
    
    document.getElementById('itemsPresupuesto').innerHTML = '';
    a.presupuesto.length > 0 ? a.presupuesto.forEach(item => agregarItemPresupuesto(item)) : agregarItemPresupuesto();
    
    document.getElementById('itemsGastos').innerHTML = '';
    a.gastos.forEach(item => agregarItemGasto(item));
    
    calcularTotalPresupuesto();
    calcularTotalGastos();
    actualizarComparativo();
    document.getElementById('formularioActividad').scrollIntoView({ behavior: 'smooth' });
}

function eliminarActividad(id) {
    const a = actividades.find(act => act.id === id);
    if (a && confirm(`¿Eliminar "${a.nombre}"?`)) {
        actividades = actividades.filter(act => act.id !== id);
        guardarDatos();
        cargarTabla();
    }
}

// =============================================
// PRESUPUESTO
// =============================================

function agregarItemPresupuesto(item = {}) {
    document.getElementById('itemsPresupuesto').insertAdjacentHTML('beforeend', `
        <div class="form-row presupuesto-item" style="margin-bottom:8px;">
            <input type="number" placeholder="Cantidad" value="${item.cantidad || 1}" min="1" class="form-control" onchange="calcularTotalPresupuesto();actualizarComparativo();" style="width:100px;">
            <input type="text" placeholder="Concepto" value="${item.concepto || ''}" class="form-control" style="flex:1;">
            <input type="number" placeholder="Costo Unit." value="${item.costo || 0}" step="0.01" min="0" class="form-control" onchange="calcularTotalPresupuesto();actualizarComparativo();" style="width:140px;">
            <span class="subtotal-item" style="font-weight:bold;min-width:90px;text-align:right;color:#1a237e;">Bs. ${((item.cantidad||0)*(item.costo||0)).toFixed(2)}</span>
            <button onclick="this.parentElement.remove();calcularTotalPresupuesto();actualizarComparativo();" class="btn btn-sm btn-danger">✕</button>
        </div>
    `);
}

function calcularTotalPresupuesto() {
    let total = 0;
    document.querySelectorAll('.presupuesto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const subtotal = (parseFloat(inputs[0].value) || 0) * (parseFloat(inputs[2].value) || 0);
        row.querySelector('.subtotal-item').textContent = 'Bs. ' + subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById('totalPresupuestoForm').textContent = 'Bs. ' + total.toFixed(2);
    document.getElementById('compPresupuesto').textContent = 'Bs. ' + total.toFixed(2);
}

// =============================================
// GASTOS
// =============================================

function agregarItemGasto(item = {}) {
    document.getElementById('itemsGastos').insertAdjacentHTML('beforeend', `
        <div class="form-row gasto-item" style="margin-bottom:8px;">
            <input type="text" placeholder="Comprobante" value="${item.comprobante || ''}" class="form-control" style="width:120px;">
            <input type="text" placeholder="Concepto" value="${item.concepto || ''}" class="form-control" style="flex:1;">
            <input type="number" placeholder="Monto" value="${item.monto || 0}" step="0.01" min="0" class="form-control" onchange="calcularTotalGastos();actualizarComparativo();" style="width:140px;">
            <button onclick="this.parentElement.remove();calcularTotalGastos();actualizarComparativo();" class="btn btn-sm btn-danger">✕</button>
        </div>
    `);
}

function calcularTotalGastos() {
    let total = 0;
    document.querySelectorAll('.gasto-item').forEach(row => {
        total += parseFloat(row.querySelectorAll('input')[2].value) || 0;
    });
    document.getElementById('totalGastosForm').textContent = 'Bs. ' + total.toFixed(2);
    document.getElementById('compEjecutado').textContent = 'Bs. ' + total.toFixed(2);
}

// =============================================
// COMPARATIVO EN TIEMPO REAL
// =============================================

function actualizarComparativo() {
    let pres = 0, ejec = 0;
    
    document.querySelectorAll('.presupuesto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        pres += (parseFloat(inputs[0].value) || 0) * (parseFloat(inputs[2].value) || 0);
    });
    
    document.querySelectorAll('.gasto-item').forEach(row => {
        ejec += parseFloat(row.querySelectorAll('input')[2].value) || 0;
    });
    
    document.getElementById('compPresupuesto').textContent = 'Bs. ' + pres.toFixed(2);
    document.getElementById('compEjecutado').textContent = 'Bs. ' + ejec.toFixed(2);
    
    const dif = pres - ejec;
    const diffEl = document.getElementById('compDiferencia');
    const indEl = document.getElementById('compIndicador');
    
    if (dif >= 0) {
        diffEl.innerHTML = '<span>Diferencia:</span><strong style="color:#2e7d32;">Bs. ' + dif.toFixed(2) + '</strong>';
        indEl.className = 'comp-indicador ok';
        indEl.textContent = '✅ Dentro del presupuesto - Ahorro: Bs. ' + dif.toFixed(2);
    } else {
        diffEl.innerHTML = '<span>Diferencia:</span><strong style="color:#c62828;">Bs. ' + Math.abs(dif).toFixed(2) + '</strong>';
        indEl.className = 'comp-indicador mal';
        indEl.textContent = '❌ Excedido en Bs. ' + Math.abs(dif).toFixed(2);
    }
}

// =============================================
// GUARDAR
// =============================================

function guardarActividad() {
    const nombre = document.getElementById('nombre').value.trim();
    const organizacion = document.getElementById('organizacion').value;
    
    if (!nombre) { alert('Ingrese el nombre'); return; }
    if (!organizacion) { alert('Seleccione una organización'); return; }
    
    const metas = [];
    document.querySelectorAll('.meta-check input:checked').forEach(cb => metas.push(cb.value));
    
    const presupuesto = [];
    document.querySelectorAll('.presupuesto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[1].value.trim()) {
            presupuesto.push({
                cantidad: parseInt(inputs[0].value) || 0,
                concepto: inputs[1].value.trim(),
                costo: parseFloat(inputs[2].value) || 0
            });
        }
    });
    
    const gastos = [];
    document.querySelectorAll('.gasto-item').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[1].value.trim()) {
            gastos.push({
                comprobante: inputs[0].value.trim(),
                concepto: inputs[1].value.trim(),
                monto: parseFloat(inputs[2].value) || 0
            });
        }
    });
    
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
    
    if (editandoId) {
        actividades = actividades.map(a => a.id === editandoId ? actividad : a);
    } else {
        actividades.push(actividad);
    }
    
    guardarDatos();
    mostrarLista();
    alert('✅ Actividad guardada exitosamente');
}

// =============================================
// GENERAR PDF
// =============================================

function generarPDF() {
    generarPDFactividad(editandoId || 'actual');
}

function generarPDFactividad(id) {
    let a;
    
    if (id === 'actual') {
        // Tomar datos del formulario actual
        const metas = [];
        document.querySelectorAll('.meta-check input:checked').forEach(cb => metas.push(cb.value));
        
        const presupuesto = [];
        document.querySelectorAll('.presupuesto-item').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs[1].value.trim()) {
                presupuesto.push({
                    cantidad: parseInt(inputs[0].value) || 0,
                    concepto: inputs[1].value.trim(),
                    costo: parseFloat(inputs[2].value) || 0
                });
            }
        });
        
        const gastos = [];
        document.querySelectorAll('.gasto-item').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs[1].value.trim()) {
                gastos.push({
                    comprobante: inputs[0].value.trim(),
                    concepto: inputs[1].value.trim(),
                    monto: parseFloat(inputs[2].value) || 0
                });
            }
        });
        
        a = {
            codigo: document.getElementById('codigo').value,
            fecha: document.getElementById('fecha').value,
            organizacion: document.getElementById('organizacion').value,
            nombre: document.getElementById('nombre').value,
            proposito: document.getElementById('proposito').value,
            metas: metas,
            asistentes: document.getElementById('asistentes').value,
            responsable: document.getElementById('responsable').value,
            presupuesto: presupuesto,
            gastos: gastos,
            estado: document.getElementById('estado').value
        };
    } else {
        a = actividades.find(act => act.id === id);
        if (!a) return;
    }
    
    let totalPres = 0, totalEjec = 0;
    a.presupuesto.forEach(p => totalPres += p.cantidad * p.costo);
    a.gastos.forEach(g => totalEjec += g.monto);
    
    const ventana = window.open('', '_blank', 'width=900,height=700');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${a.codigo} - ${a.nombre}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 800px; margin: auto; }
                h1 { color: #1a237e; text-align: center; border-bottom: 3px solid #1a237e; padding-bottom: 10px; font-size: 22px; }
                h2 { color: #1a237e; margin-top: 20px; font-size: 16px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { background: #1a237e; color: white; padding: 8px; text-align: left; font-size: 11px; }
                td { padding: 8px; border-bottom: 1px solid #e0e0e0; font-size: 12px; }
                .total { font-size: 16px; font-weight: bold; text-align: right; padding: 10px; background: #e8eaf6; }
                .info { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 10px 0; }
                .info-item { padding: 5px; }
                .info-label { font-weight: bold; font-size: 11px; color: #666; }
                .ok { color: #2e7d32; }
                .mal { color: #c62828; }
                .firmas { display: flex; justify-content: space-around; margin-top: 50px; }
                .firma { text-align: center; }
                .linea { border-top: 1px solid #333; width: 200px; margin: 40px auto 5px; }
                button { background: #1a237e; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-size: 14px; margin: 5px; }
                @media print { button { display: none; } body { padding: 10px; } }
            </style>
        </head>
        <body>
            <div style="text-align:center;margin-bottom:15px;">
                <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                <button onclick="window.close()">Cerrar</button>
            </div>
            
            <h1>PLAN DE ACTIVIDAD Y RENDICIÓN</h1>
            
            <h2>📋 Datos Generales</h2>
            <div class="info">
                <div class="info-item"><span class="info-label">Código:</span> ${a.codigo}</div>
                <div class="info-item"><span class="info-label">Fecha:</span> ${a.fecha}</div>
                <div class="info-item"><span class="info-label">Organización:</span> ${a.organizacion}</div>
                <div class="info-item"><span class="info-label">Estado:</span> ${a.estado}</div>
                <div class="info-item"><span class="info-label">Responsable:</span> ${a.responsable || 'N/A'}</div>
                <div class="info-item"><span class="info-label">Asistentes:</span> ${a.asistentes || 0}</div>
            </div>
            
            <h2>🎯 Propósito</h2>
            <p>${a.proposito || 'No especificado'}</p>
            
            ${a.metas && a.metas.length > 0 ? `
                <h2>✅ Metas</h2>
                <ul>${a.metas.map(m => `<li>${m}</li>`).join('')}</ul>
            ` : ''}
            
            <h2>💰 Presupuesto</h2>
            <table>
                <thead><tr><th>Cant.</th><th>Concepto</th><th>Costo Unit.</th><th>Subtotal</th></tr></thead>
                <tbody>
                    ${a.presupuesto.map(p => `
                        <tr>
                            <td>${p.cantidad}</td>
                            <td>${p.concepto}</td>
                            <td>Bs. ${p.costo.toFixed(2)}</td>
                            <td>Bs. ${(p.cantidad * p.costo).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="total">Total Presupuestado: Bs. ${totalPres.toFixed(2)}</p>
            
            ${a.gastos.length > 0 ? `
                <h2>💳 Gastos Ejecutados</h2>
                <table>
                    <thead><tr><th>Comp.</th><th>Concepto</th><th>Monto</th></tr></thead>
                    <tbody>
                        ${a.gastos.map(g => `
                            <tr>
                                <td>${g.comprobante || '-'}</td>
                                <td>${g.concepto}</td>
                                <td>Bs. ${g.monto.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p class="total">Total Ejecutado: Bs. ${totalEjec.toFixed(2)}</p>
            ` : ''}
            
            <h2>📊 Comparativo</h2>
            <div class="info">
                <div class="info-item"><span class="info-label">Presupuestado:</span> Bs. ${totalPres.toFixed(2)}</div>
                <div class="info-item"><span class="info-label">Ejecutado:</span> Bs. ${totalEjec.toFixed(2)}</div>
                <div class="info-item ${totalPres >= totalEjec ? 'ok' : 'mal'}">
                    <span class="info-label">Diferencia:</span> Bs. ${(totalPres - totalEjec).toFixed(2)}
                </div>
                <div class="info-item ${totalPres >= totalEjec ? 'ok' : 'mal'}">
                    ${totalPres >= totalEjec ? '✅ Dentro del presupuesto' : '❌ Excedido'}
                </div>
            </div>
            
            <div class="firmas">
                <div class="firma"><div class="linea"></div>Comprador</div>
                <div class="firma"><div class="linea"></div>Líder de Organización</div>
                <div class="firma"><div class="linea"></div>Obispo / Presidente</div>
            </div>
            
            <p style="text-align:center;color:#999;font-size:10px;margin-top:30px;">
                Generado: ${new Date().toLocaleDateString()} - Sistema de Actividades
            </p>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

// =============================================
// INICIAR
// =============================================

document.addEventListener('DOMContentLoaded', inicializarApp);