// =============================================
// INICIALIZAR
// =============================================

function inicializarApp() {
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    agregarItemPresupuesto();
    
    // Quitar borde rojo al escribir en cualquier campo
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
    });
}

function nuevoPlan() {
    location.reload();
}

// =============================================
// PRESUPUESTO
// =============================================

function agregarItemPresupuesto(item = {}) {
    document.getElementById('itemsPresupuesto').insertAdjacentHTML('beforeend', `
        <div class="item-presupuesto">
            <input type="number" value="${item.cantidad || 1}" min="0" class="cantidad-input" placeholder="0" onchange="calcularTotal()">
            <input type="text" value="${item.concepto || ''}" class="descripcion-input" placeholder="Descripción del gasto">
            <input type="number" value="${item.costo || 0}" min="0" step="0.01" class="costo-input" placeholder="0,00" onchange="calcularTotal()">
            <div class="subtotal-item">Bs. ${((item.cantidad || 0) * (item.costo || 0)).toFixed(2)}</div>
            <button onclick="this.parentElement.remove();calcularTotal();" class="btn-eliminar-item">✕</button>
        </div>
    `);
    
    // Agregar evento para quitar borde rojo
    const lastItem = document.querySelector('#itemsPresupuesto .item-presupuesto:last-child');
    lastItem.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
    });
}

function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.item-presupuesto').forEach(row => {
        const cantidad = parseFloat(row.querySelector('.cantidad-input').value) || 0;
        const costo = parseFloat(row.querySelector('.costo-input').value) || 0;
        const subtotal = cantidad * costo;
        row.querySelector('.subtotal-item').textContent = 'Bs. ' + subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById('totalPresupuestoForm').textContent = 'Bs. ' + total.toFixed(2);
}

// =============================================
// VALIDACIÓN
// =============================================

function marcarError(elemento) {
    elemento.style.borderColor = '#c62828';
    elemento.style.boxShadow = '0 0 0 3px rgba(198,40,40,0.2)';
    elemento.focus();
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limpiarError(elemento) {
    elemento.style.borderColor = '';
    elemento.style.boxShadow = '';
}

function validarFormulario() {
    
    // 1. Validar Estaca
    const estaca = document.getElementById('estaca');
    if (!estaca.value.trim()) {
        marcarError(estaca);
        alert('⚠️ El campo "Estaca" es obligatorio.\n\nPor favor ingrese el nombre de la estaca.');
        return false;
    }
    limpiarError(estaca);
    
    // 2. Validar Organización
    const organizacion = document.getElementById('organizacion');
    if (!organizacion.value.trim()) {
        marcarError(organizacion);
        alert('⚠️ El campo "Organización" es obligatorio.\n\nPor favor ingrese el nombre de la organización.');
        return false;
    }
    limpiarError(organizacion);
    
    // 3. Validar Barrio
    const barrio = document.getElementById('barrio');
    if (!barrio.value.trim()) {
        marcarError(barrio);
        alert('⚠️ El campo "Barrio" es obligatorio.\n\nPor favor ingrese el nombre del barrio.');
        return false;
    }
    limpiarError(barrio);
    
    // 4. Validar Fecha
    const fecha = document.getElementById('fecha');
    if (!fecha.value.trim()) {
        marcarError(fecha);
        alert('⚠️ El campo "Fecha de Actividad" es obligatorio.\n\nPor favor seleccione una fecha.');
        return false;
    }
    limpiarError(fecha);
    
    // 5. Validar Propósito
    const proposito = document.getElementById('proposito');
    if (!proposito.value.trim()) {
        marcarError(proposito);
        alert('⚠️ El campo "Propósito Sagrado" es obligatorio.\n\nPor favor describa el propósito de la actividad.');
        return false;
    }
    limpiarError(proposito);
    
    // 6. Validar Metas (al menos una seleccionada)
    const metasSeleccionadas = document.querySelectorAll('.meta-check input:checked');
    if (metasSeleccionadas.length === 0) {
        // Resaltar todas las metas
        document.querySelectorAll('.meta-check').forEach(el => {
            el.style.borderColor = '#c62828';
            el.style.background = '#ffebee';
            setTimeout(() => {
                el.style.borderColor = '';
                el.style.background = '';
            }, 3000);
        });
        document.querySelector('.metas-grid').scrollIntoView({ behavior: 'smooth', block: 'center' });
        alert('⚠️ Debe seleccionar al menos una meta de la actividad.\n\nPor favor marque una o más metas.');
        return false;
    }
    
    // 7. Validar Asistentes
    const asistentes = document.getElementById('asistentes');
    if (!asistentes.value.trim()) {
        marcarError(asistentes);
        alert('⚠️ El campo "Total estimado de asistentes" es obligatorio.\n\nPor favor ingrese la cantidad estimada de asistentes.');
        return false;
    }
    limpiarError(asistentes);
    
    // 8. Validar Responsables de la actividad
    const responsables = document.getElementById('responsables');
    if (!responsables.value.trim()) {
        marcarError(responsables);
        alert('⚠️ El campo "Responsables de la actividad" es obligatorio.\n\nPor favor ingrese los nombres de los responsables.');
        return false;
    }
    limpiarError(responsables);
    
    // 9. Validar Responsables de limpieza
    const limpieza = document.getElementById('limpieza');
    if (!limpieza.value.trim()) {
        marcarError(limpieza);
        alert('⚠️ El campo "Responsables limpieza capilla" es obligatorio.\n\nPor favor ingrese los nombres de los responsables de limpieza.');
        return false;
    }
    limpiarError(limpieza);
    
    // 10. Validar Nombre del Responsable (Solicitante)
    const firmaResponsable = document.getElementById('firmaResponsable');
    if (!firmaResponsable.value.trim()) {
        marcarError(firmaResponsable);
        alert('⚠️ El campo "Nombre del Responsable (Solicitante)" es obligatorio.\n\nPor favor ingrese el nombre del responsable.');
        return false;
    }
    limpiarError(firmaResponsable);
    
    // 11. Validar Nombre del Líder de Organización
    const firmaLider = document.getElementById('firmaLider');
    if (!firmaLider.value.trim()) {
        marcarError(firmaLider);
        alert('⚠️ El campo "Nombre del Líder de Organización" es obligatorio.\n\nPor favor ingrese el nombre del líder.');
        return false;
    }
    limpiarError(firmaLider);
    
    // 12. Validar Nombre del Obispo / Presidente
    const firmaObispo = document.getElementById('firmaObispo');
    if (!firmaObispo.value.trim()) {
        marcarError(firmaObispo);
        alert('⚠️ El campo "Nombre del Obispo / Presidente" es obligatorio.\n\nPor favor ingrese el nombre del obispo o presidente.');
        return false;
    }
    limpiarError(firmaObispo);
    
    // 13. Validar presupuesto (al menos un item válido)
    let itemsValidos = 0;
    const itemsPresupuesto = document.querySelectorAll('.item-presupuesto');
    
    itemsPresupuesto.forEach(row => {
        const cantidad = parseInt(row.querySelector('.cantidad-input').value) || 0;
        const descripcion = row.querySelector('.descripcion-input').value.trim();
        const costo = parseFloat(row.querySelector('.costo-input').value) || 0;
        
        if (cantidad > 0 && descripcion !== '' && costo > 0) {
            itemsValidos++;
        }
    });
    
    if (itemsValidos === 0) {
        // Resaltar el primer item de presupuesto
        const primerItem = document.querySelector('.item-presupuesto');
        if (primerItem) {
            primerItem.querySelectorAll('input').forEach(input => {
                input.style.borderColor = '#c62828';
                input.style.boxShadow = '0 0 0 3px rgba(198,40,40,0.2)';
            });
            primerItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('⚠️ Debe agregar al menos un gasto anticipado válido.\n\nVerifique que cada item tenga:\n• Cantidad mayor a 0\n• Descripción\n• Costo Unitario mayor a 0');
        return false;
    }
    
    // Si todo está bien
    return true;
}

// =============================================
// GENERAR PDF
// =============================================

function generarPDF() {
    
    // Validar antes de generar
    if (!validarFormulario()) {
        return;
    }
    
    const metas = [];
    document.querySelectorAll('.meta-check input:checked').forEach(cb => metas.push(cb.value));
    
    const presupuesto = [];
    document.querySelectorAll('.item-presupuesto').forEach(row => {
        const concepto = row.querySelector('.descripcion-input').value.trim();
        const cantidad = parseInt(row.querySelector('.cantidad-input').value) || 0;
        const costo = parseFloat(row.querySelector('.costo-input').value) || 0;
        
        if (concepto && cantidad > 0 && costo > 0) {
            presupuesto.push({
                cantidad: cantidad,
                concepto: concepto,
                costo: costo
            });
        }
    });
    
    const datos = {
        estaca: document.getElementById('estaca').value.trim(),
        organizacion: document.getElementById('organizacion').value.trim(),
        barrio: document.getElementById('barrio').value.trim(),
        fecha: document.getElementById('fecha').value,
        proposito: document.getElementById('proposito').value.trim(),
        metas: metas,
        asistentes: document.getElementById('asistentes').value.trim(),
        responsables: document.getElementById('responsables').value.trim(),
        limpieza: document.getElementById('limpieza').value.trim(),
        firmaResponsable: document.getElementById('firmaResponsable').value.trim(),
        firmaLider: document.getElementById('firmaLider').value.trim(),
        firmaObispo: document.getElementById('firmaObispo').value.trim(),
        presupuesto: presupuesto
    };
    
    let total = 0;
    presupuesto.forEach(p => total += p.cantidad * p.costo);
    
    const ventana = window.open('', '_blank', 'width=900,height=700');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Plan de Actividad</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 800px; margin: auto; }
                h1 { color: #1a237e; text-align: center; border-bottom: 3px solid #1a237e; padding-bottom: 10px; font-size: 20px; }
                h2 { color: #1a237e; margin-top: 20px; font-size: 16px; }
                h3 { color: #1a237e; font-size: 14px; }
                .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
                .dato-label { font-weight: bold; font-size: 11px; color: #666; }
                .dato-valor { font-size: 13px; border-bottom: 1px solid #ccc; padding: 2px 0; min-height: 18px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { background: #1a237e; color: white; padding: 8px; text-align: left; font-size: 11px; }
                td { padding: 8px; border-bottom: 1px solid #e0e0e0; font-size: 12px; }
                .total { font-size: 16px; font-weight: bold; text-align: right; padding: 10px; background: #e8eaf6; margin-top: 5px; }
                ul { margin: 5px 0; padding-left: 20px; }
                li { font-size: 13px; padding: 2px 0; }
                .seccion-aprobaciones { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                .firmas-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 15px; }
                .firma-item { text-align: center; }
                .firma-titulo { font-weight: bold; font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
                .firma-nombre { font-size: 14px; font-weight: 600; color: #1a237e; padding: 5px 0; min-height: 20px; }
                .firma-linea { border-top: 1px solid #333; width: 100%; margin-top: 25px; }
                button { background: #1a237e; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-size: 14px; margin: 5px; }
                @media print { button { display: none; } body { padding: 10px; } }
            </style>
        </head>
        <body>
            <div style="text-align:center;margin-bottom:15px;">
                <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                <button onclick="window.close()">Cerrar</button>
            </div>
            
            <h1>PLAN DE ACTIVIDAD</h1>
            
            <div class="datos">
                <div><span class="dato-label">Estaca:</span> <span class="dato-valor">${datos.estaca}</span></div>
                <div><span class="dato-label">Organización:</span> <span class="dato-valor">${datos.organizacion}</span></div>
                <div><span class="dato-label">Barrio:</span> <span class="dato-valor">${datos.barrio}</span></div>
                <div><span class="dato-label">Fecha:</span> <span class="dato-valor">${datos.fecha}</span></div>
            </div>
            
            <h2>PROPÓSITO SAGRADO</h2>
            <p style="font-size:11px;color:#666;">(para satisfacer las necesidades espirituales y temporales de los participantes)</p>
            <p style="border:1px solid #ccc;padding:10px;min-height:50px;border-radius:5px;">${datos.proposito}</p>
            
            <h2>META(S):</h2>
            <ul>${datos.metas.map(m => `<li>${m}</li>`).join('')}</ul>
            
            <div class="datos">
                <div><span class="dato-label">Total estimado de asistentes:</span> <span class="dato-valor">${datos.asistentes}</span></div>
                <div><span class="dato-label">Responsables:</span> <span class="dato-valor">${datos.responsables}</span></div>
                <div style="grid-column: span 2;"><span class="dato-label">Responsables limpieza capilla:</span> <span class="dato-valor">${datos.limpieza}</span></div>
            </div>
            
            <h2>PLAN DE PRESUPUESTO</h2>
            <h3>GASTOS ANTICIPADOS</h3>
            <table>
                <thead><tr><th>Cantidad</th><th>Descripción</th><th>Costo Unitario (Bs.)</th><th>Subtotal</th></tr></thead>
                <tbody>
                    ${presupuesto.map(p => `
                        <tr><td>${p.cantidad}</td><td>${p.concepto}</td><td>Bs. ${p.costo.toFixed(2)}</td><td>Bs. ${(p.cantidad*p.costo).toFixed(2)}</td></tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="total">TOTAL DE GASTOS ANTICIPADOS: Bs. ${total.toFixed(2)}</p>
            
            <div class="seccion-aprobaciones">
                <h2>✍️ APROBACIONES Y FIRMAS</h2>
                <div class="firmas-grid">
                    <div class="firma-item">
                        <div class="firma-titulo">Responsable (Solicitante)</div>
                        <div class="firma-nombre">${datos.firmaResponsable}</div>
                        <div class="firma-linea"></div>
                    </div>
                    <div class="firma-item">
                        <div class="firma-titulo">Líder de Organización</div>
                        <div class="firma-nombre">${datos.firmaLider}</div>
                        <div class="firma-linea"></div>
                    </div>
                    <div class="firma-item">
                        <div class="firma-titulo">Obispo / Presidente</div>
                        <div class="firma-nombre">${datos.firmaObispo}</div>
                        <div class="firma-linea"></div>
                    </div>
                </div>
            </div>
            
            <p style="text-align:center;color:#999;font-size:10px;margin-top:30px;">Generado: ${new Date().toLocaleDateString()}</p>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

document.addEventListener('DOMContentLoaded', inicializarApp);