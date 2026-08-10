/**
 * SISTEMA DE ACTIVIDADES
 * Versión: 2.0
 */

// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================
const CONFIG = {
    MAX_CARACTERES_PROPOSITO: 500,
    MAX_ASISTENTES: 9999,
    DELAY_IMPRESION: 500,
    STORAGE_KEY: 'planActividad_SUD_v2'
};

// ==========================================
// 1. NAVEGACIÓN Y MENÚ SUPERIOR
// ==========================================
const btnHamburger = document.getElementById('hamburgerBtn');
const topbarMenu = document.getElementById('menuNav');
const navLinks = document.querySelectorAll('.nav-link');

btnHamburger.addEventListener('click', () => {
    topbarMenu.classList.toggle('show');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');
        mostrarSeccion(target);
        
        if (window.innerWidth <= 768) {
            topbarMenu.classList.remove('show');
        }
    });
});

function mostrarSeccion(tipo) {
    document.getElementById('planSection').style.display = tipo === 'plan' ? 'block' : 'none';
    document.getElementById('rendicionSection').style.display = tipo === 'rendicion' ? 'block' : 'none';
    
    navLinks.forEach(link => link.classList.remove('active'));
    if (tipo === 'plan') {
        navLinks[0].classList.add('active');
    } else {
        navLinks[1].classList.add('active');
    }
}

// ==========================================
// 2. CONTADOR DE CARACTERES (PROPÓSITO)
// ==========================================
const propositoTextarea = document.getElementById('pProposito');
const propositoCount = document.getElementById('propositoCount');

if (propositoTextarea && propositoCount) {
    propositoTextarea.addEventListener('input', () => {
        const length = propositoTextarea.value.length;
        propositoCount.textContent = `${length}/${CONFIG.MAX_CARACTERES_PROPOSITO}`;
        
        if (length > CONFIG.MAX_CARACTERES_PROPOSITO) {
            propositoCount.style.color = '#c62828';
        } else if (length > CONFIG.MAX_CARACTERES_PROPOSITO * 0.8) {
            propositoCount.style.color = '#ff9800';
        } else {
            propositoCount.style.color = '#666';
        }
    });
}

// ==========================================
// 3. TABLA: PLAN DE PRESUPUESTO
// ==========================================
const btnAgregarGastoPlan = document.getElementById('btnAgregarGastoPlan');
const itemsPlan = document.getElementById('itemsPlan');

btnAgregarGastoPlan.addEventListener('click', () => {
    agregarFilaPlan();
});

function agregarFilaPlan(datos = {}) {
    const fila = document.createElement('div');
    fila.className = 'item-plan';
    
    // Sanitizar datos
    const cantidad = sanitizarNumero(datos.cantidad, 0);
    const concepto = sanitizarTexto(datos.concepto || '');
    const importe = sanitizarNumero(datos.importe, 0);
    
    fila.innerHTML = `
        <div class="border-right">
            <input type="number" min="0" max="9999" value="${cantidad}" 
                   class="cantidad form-control-line" placeholder="Cant." 
                   aria-label="Cantidad">
        </div>
        <div class="border-right">
            <input type="text" value="${concepto}" 
                   class="descripcion form-control-line text-left" 
                   placeholder="Descripción del gasto" maxlength="200" 
                   aria-label="Descripción">
        </div>
        <div>
            <input type="number" min="0" step="0.01" value="${importe}" 
                   class="importe form-control-line" placeholder="0.00" 
                   aria-label="Importe">
        </div>
        <div class="no-print text-center">
            <button type="button" class="btn-eliminar" 
                    aria-label="Eliminar gasto" title="Eliminar">❌</button>
        </div>
    `;
    itemsPlan.appendChild(fila);
}

// ==========================================
// 4. TABLA: RENDICIÓN DE CUENTAS
// ==========================================
const btnAgregarGastoRendicion = document.getElementById('btnAgregarGasto');
const itemsRendicion = document.getElementById('itemsRendicion');

btnAgregarGastoRendicion.addEventListener('click', () => {
    agregarFilaRendicion();
});

function agregarFilaRendicion(datos = {}) {
    const fila = document.createElement('div');
    fila.className = 'item-rendicion';
    
    fila.innerHTML = `
        <input type="text" class="form-control comprobante" 
               value="${sanitizarTexto(datos.comprobante || '')}" 
               placeholder="Comprobante" maxlength="50" aria-label="Comprobante">
        <input type="text" class="form-control concepto" 
               value="${sanitizarTexto(datos.concepto || '')}" 
               placeholder="Concepto" maxlength="200" aria-label="Concepto">
        <input type="date" class="form-control" 
               value="${datos.fecha || ''}" aria-label="Fecha">
        <input type="text" class="form-control proveedor" 
               value="${sanitizarTexto(datos.proveedor || '')}" 
               placeholder="Proveedor" maxlength="100" aria-label="Proveedor">
        <input type="number" min="0" step="0.01" class="form-control monto" 
               value="${sanitizarNumero(datos.monto, 0)}" 
               placeholder="0.00" aria-label="Monto">
        <button type="button" class="btn-eliminar no-print" 
                aria-label="Eliminar gasto" title="Eliminar">❌</button>
    `;
    itemsRendicion.appendChild(fila);
}

// ==========================================
// 5. UTILIDADES DE SANITIZACIÓN
// ==========================================
function sanitizarTexto(texto) {
    if (!texto) return '';
    return texto
        .replace(/[<>]/g, '')  // Eliminar etiquetas HTML
        .replace(/['"]/g, '')  // Eliminar comillas
        .trim()
        .substring(0, 500);
}

function sanitizarNumero(valor, defecto = 0) {
    const num = parseFloat(valor);
    return isNaN(num) || num < 0 ? defecto : num;
}

// ==========================================
// 6. ELIMINACIÓN Y CÁLCULOS
// ==========================================
itemsPlan.addEventListener('input', (e) => {
    if (e.target.classList.contains('importe')) calcularTotalPlan();
});

itemsPlan.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
        if (confirm('¿Eliminar este gasto anticipado?')) {
            e.target.closest('.item-plan').remove();
            calcularTotalPlan();
        }
    }
});

itemsRendicion.addEventListener('input', (e) => {
    if (e.target.classList.contains('monto')) calcularTotalRendicion();
});

itemsRendicion.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
        if (confirm('¿Eliminar este gasto?')) {
            e.target.closest('.item-rendicion').remove();
            calcularTotalRendicion();
        }
    }
});

function calcularTotalPlan() {
    let total = 0;
    document.querySelectorAll('.importe').forEach(item => {
        total += sanitizarNumero(item.value, 0);
    });
    document.getElementById('totalPlan').textContent = total.toLocaleString('es-VE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function calcularTotalRendicion() {
    let total = 0;
    document.querySelectorAll('.monto').forEach(item => {
        total += sanitizarNumero(item.value, 0);
    });
    document.getElementById('totalRendicion').textContent = 'Bs. ' + total.toLocaleString('es-VE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// ==========================================
// 7. VALIDACIÓN
// ==========================================
function validarPlanActividad() {
    const campos = [
        { id: 'pEstaca', nombre: 'Estaca' },
        { id: 'pOrganizacion', nombre: 'Organización' },
        { id: 'pBarrio', nombre: 'Barrio' },
        { id: 'pFecha', nombre: 'Fecha de actividad' },
        { id: 'pProposito', nombre: 'Propósito Sagrado' }
    ];
    
    for (const campo of campos) {
        const el = document.getElementById(campo.id);
        if (!el.value.trim()) {
            marcarError(el, `El campo "${campo.nombre}" es obligatorio.`);
            return false;
        }
        limpiarError(el);
    }
    
    // Validar metas
    const metasSeleccionadas = document.querySelectorAll('input[name="meta"]:checked');
    if (metasSeleccionadas.length === 0) {
        alert('⚠️ Debe seleccionar al menos una meta de la actividad.');
        document.querySelector('.checkbox-list').scrollIntoView({ behavior: 'smooth' });
        return false;
    }
    
    return true;
}

function marcarError(elemento, mensaje) {
    elemento.style.borderBottom = '2px solid #c62828';
    elemento.style.backgroundColor = '#fff5f5';
    elemento.focus();
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alert('⚠️ ' + mensaje);
}

function limpiarError(elemento) {
    elemento.style.borderBottom = '';
    elemento.style.backgroundColor = '';
}

// Limpiar errores al escribir
document.addEventListener('input', function(e) {
    if (e.target.matches('input, textarea, select')) {
        limpiarError(e.target);
    }
});

// ==========================================
// 8. LOCALSTORAGE (GUARDADO SEGURO)
// ==========================================
const formPlan = document.getElementById('formPlan');

formPlan.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validarPlanActividad()) return;
    
    try {
        const planData = {
            estaca: sanitizarTexto(document.getElementById('pEstaca').value),
            barrio: sanitizarTexto(document.getElementById('pBarrio').value),
            organizacion: document.getElementById('pOrganizacion').value,
            fecha: document.getElementById('pFecha').value,
            proposito: sanitizarTexto(document.getElementById('pProposito').value),
            asistentes: sanitizarNumero(document.getElementById('pAsistentes').value),
            responsables: sanitizarTexto(document.getElementById('pResponsables').value),
            limpieza: sanitizarTexto(document.getElementById('pLimpieza').value),
            solicitante: sanitizarTexto(document.getElementById('pSolicitante').value),
            obispo: sanitizarTexto(document.getElementById('pObispo').value),
            guardado: new Date().toISOString()
        };

        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(planData));
        alert('✅ ¡Plan guardado exitosamente en la memoria del navegador!');
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar. Verifique el espacio disponible.');
    }
});

// Cargar datos al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        const datosGuardados = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (datosGuardados) {
            const planData = JSON.parse(datosGuardados);
            
            if (planData.estaca) document.getElementById('pEstaca').value = planData.estaca;
            if (planData.barrio) document.getElementById('pBarrio').value = planData.barrio;
            if (planData.organizacion) document.getElementById('pOrganizacion').value = planData.organizacion;
            if (planData.fecha) document.getElementById('pFecha').value = planData.fecha;
            if (planData.proposito) {
                document.getElementById('pProposito').value = planData.proposito;
                if (propositoCount) {
                    propositoCount.textContent = `${planData.proposito.length}/${CONFIG.MAX_CARACTERES_PROPOSITO}`;
                }
            }
            if (planData.asistentes) document.getElementById('pAsistentes').value = planData.asistentes;
            if (planData.responsables) document.getElementById('pResponsables').value = planData.responsables;
            if (planData.limpieza) document.getElementById('pLimpieza').value = planData.limpieza;
            if (planData.solicitante) document.getElementById('pSolicitante').value = planData.solicitante;
            if (planData.obispo) document.getElementById('pObispo').value = planData.obispo;
        }
        
        // Agregar primera fila de presupuesto si no hay
        if (itemsPlan && itemsPlan.children.length === 0) {
            agregarFilaPlan();
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
});

// ==========================================
// 9. IMPRESIÓN / PDF
// ==========================================
document.getElementById('btnImprimirPlan').addEventListener('click', () => {
    if (validarPlanActividad()) {
        imprimirPlan();
    }
});

document.getElementById('btnImprimirRendicion').addEventListener('click', () => {
    imprimirRendicion();
});

function imprimirPlan() {
    const datos = recolectarDatosPlan();
    const total = calcularTotalPlanImpresion();
    
    const ventana = window.open('', '_blank', 'width=900,height=700');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Plan de Actividad - ${datos.organizacion || 'SUD'}</title>
            <style>
                @page { size: letter; margin: 10mm; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Times New Roman', serif; font-size: 10pt; color: #000; line-height: 1.3; }
                .header { text-align: center; margin-bottom: 8pt; }
                .header h1 { font-size: 14pt; text-transform: uppercase; margin-bottom: 2pt; }
                .header p { font-size: 9pt; color: #555; }
                .fila { display: flex; gap: 12pt; margin-bottom: 3pt; }
                .fila-item { flex: 1; }
                .label { font-weight: bold; }
                .valor { border-bottom: 1px solid #000; padding: 1pt 3pt; display: inline-block; min-width: 80pt; }
                .seccion { margin-top: 8pt; margin-bottom: 6pt; }
                .seccion-titulo { font-weight: bold; font-size: 10pt; margin-bottom: 3pt; }
                .proposito { border: 1px solid #000; padding: 5pt; min-height: 25pt; font-size: 9pt; }
                ul { margin: 3pt 0; padding-left: 16pt; font-size: 9pt; }
                li { margin-bottom: 1pt; }
                table { width: 100%; border-collapse: collapse; margin-top: 5pt; font-size: 9pt; }
                th { background: #1a237e; color: white; padding: 4pt 5pt; font-size: 8pt; }
                td { padding: 3pt 5pt; border-bottom: 1px solid #ccc; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; background: #e8eaf6; font-size: 10pt; }
                .firmas { display: flex; justify-content: space-around; margin-top: 15pt; }
                .firma { text-align: center; width: 40%; }
                .firma-linea { border-top: 1px solid #000; margin-top: 20pt; }
                .firma-texto { font-size: 8pt; margin-top: 2pt; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PLAN DE ACTIVIDAD</h1>
                <p>Iglesia de Jesucristo de los Santos de los Últimos Días</p>
            </div>
            
            <div class="fila">
                <div class="fila-item"><span class="label">Estaca:</span> <span class="valor">${datos.estaca || '________________'}</span></div>
                <div class="fila-item"><span class="label">Organización:</span> <span class="valor">${datos.organizacion || '________________'}</span></div>
            </div>
            <div class="fila">
                <div class="fila-item"><span class="label">Barrio:</span> <span class="valor">${datos.barrio || '________________'}</span></div>
                <div class="fila-item"><span class="label">Fecha:</span> <span class="valor">${datos.fecha || '________________'}</span></div>
            </div>
            
            <div class="seccion">
                <div class="seccion-titulo">PROPÓSITO SAGRADO:</div>
                <div class="proposito">${datos.proposito || '___________________________________________________________________________'}</div>
            </div>
            
            ${datos.metas.length > 0 ? `
                <div class="seccion">
                    <div class="seccion-titulo">META(S):</div>
                    <ul>${datos.metas.map(m => `<li>✓ ${m}</li>`).join('')}</ul>
                </div>
            ` : ''}
            
            <div class="fila">
                <div class="fila-item"><span class="label">Asistentes estimados:</span> <span class="valor">${datos.asistentes || '________________'}</span></div>
                <div class="fila-item"><span class="label">Responsables:</span> <span class="valor">${datos.responsables || '________________'}</span></div>
            </div>
            <div class="fila">
                <div class="fila-item"><span class="label">Limpieza capilla:</span> <span class="valor">${datos.limpieza || '________________'}</span></div>
                <div class="fila-item"><span class="label">Solicitante:</span> <span class="valor">${datos.solicitante || '________________'}</span></div>
            </div>
            <div class="fila">
                <div class="fila-item"><span class="label">Obispo / Presidente:</span> <span class="valor">${datos.obispo || '________________'}</span></div>
            </div>
            
            <div class="seccion">
                <div class="seccion-titulo" style="text-align:center;">PLAN DE PRESUPUESTO (Antes de la actividad)</div>
                <table>
                    <thead><tr><th class="text-center">Cantidad</th><th>Descripción</th><th class="text-right">Importe</th></tr></thead>
                    <tbody>
                        ${datos.presupuesto.map(p => `
                            <tr><td class="text-center">${p.cantidad}</td><td>${p.descripcion}</td><td class="text-right">Bs. ${p.importe.toFixed(2)}</td></tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="2" class="text-right">TOTAL de gastos ANTICIPADOS</td>
                            <td class="text-center">Bs. ${total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="firmas">
                <div class="firma">
                    <div class="firma-linea"></div>
                    <div class="firma-texto">Solicitante</div>
                </div>
                <div class="firma">
                    <div class="firma-linea"></div>
                    <div class="firma-texto">Obispo / Presidente</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    ventana.document.close();
    setTimeout(() => ventana.print(), CONFIG.DELAY_IMPRESION);
}

function imprimirRendicion() {
    const datos = recolectarDatosRendicion();
    let total = 0;
    datos.gastos.forEach(g => total += g.monto);
    
    const ventana = window.open('', '_blank', 'width=900,height=700');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Rendición de Cuentas</title>
            <style>
                @page { size: letter; margin: 10mm; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Times New Roman', serif; font-size: 10pt; color: #000; }
                .header { text-align: center; margin-bottom: 8pt; }
                .header h1 { font-size: 14pt; margin-bottom: 2pt; }
                .header p { font-size: 9pt; color: #555; }
                .fila { display: flex; gap: 12pt; margin-bottom: 3pt; }
                .fila-item { flex: 1; }
                .label { font-weight: bold; }
                .valor { border-bottom: 1px solid #000; padding: 1pt 3pt; display: inline-block; min-width: 80pt; }
                .nota { background: #fff8e1; border-left: 3px solid #ff9800; padding: 5pt 8pt; margin: 8pt 0; font-size: 8pt; }
                table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9pt; }
                th { background: #1a237e; color: white; padding: 4pt 5pt; font-size: 8pt; }
                td { padding: 3pt 5pt; border-bottom: 1px solid #ccc; }
                .total-row { font-weight: bold; background: #e8eaf6; }
                .firmas { display: flex; justify-content: space-around; margin-top: 15pt; }
                .firma { text-align: center; }
                .firma-linea { border-top: 1px solid #000; width: 120pt; margin: 20pt auto 0; }
                .firma-texto { font-size: 8pt; margin-top: 2pt; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>RENDICIÓN DE CUENTAS</h1>
                <p>Iglesia de Jesucristo de los Santos de los Últimos Días</p>
            </div>
            
            <div class="fila">
                <div class="fila-item"><span class="label">Estaca:</span> <span class="valor">${datos.estaca}</span></div>
                <div class="fila-item"><span class="label">Barrio:</span> <span class="valor">${datos.barrio}</span></div>
            </div>
            <div class="fila">
                <div class="fila-item"><span class="label">Organización:</span> <span class="valor">${datos.organizacion}</span></div>
                <div class="fila-item"><span class="label">Fecha:</span> <span class="valor">${datos.fecha}</span></div>
            </div>
            <div class="fila">
                <div class="fila-item"><span class="label">Asistentes:</span> <span class="valor">${datos.asistentes}</span></div>
                <div class="fila-item"><span class="label">Pagado a:</span> <span class="valor">${datos.pagadoA}</span></div>
            </div>
            <div class="fila">
                <div class="fila-item"><span class="label">Referencia:</span> <span class="valor">${datos.cheque}</span></div>
                <div class="fila-item"><span class="label">Monto recibido:</span> <span class="valor">Bs. ${datos.monto}</span></div>
            </div>
            
            <div class="nota">
                <strong>NOTA:</strong> La persona quien firma es responsable de presentar los comprobantes dentro de 7 días. Los fondos no utilizados deben ser devueltos.
            </div>
            
            <table>
                <thead><tr><th>Comp.</th><th>Concepto</th><th>Fecha</th><th>Proveedor</th><th>Monto</th></tr></thead>
                <tbody>
                    ${datos.gastos.map(g => `<tr><td>${g.comprobante}</td><td>${g.concepto}</td><td>${g.fecha}</td><td>${g.proveedor}</td><td>Bs. ${g.monto.toFixed(2)}</td></tr>`).join('')}
                </tbody>
                <tfoot><tr class="total-row"><td colspan="4" style="text-align:right;">TOTAL</td><td>Bs. ${total.toFixed(2)}</td></tr></tfoot>
            </table>
            
            <div class="firmas">
                <div class="firma"><div class="firma-linea"></div><div class="firma-texto">Comprador</div></div>
                <div class="firma"><div class="firma-linea"></div><div class="firma-texto">Líder de Organización</div></div>
                <div class="firma"><div class="firma-linea"></div><div class="firma-texto">Obispo / Presidente</div></div>
            </div>
        </body>
        </html>
    `);
    
    ventana.document.close();
    setTimeout(() => ventana.print(), CONFIG.DELAY_IMPRESION);
}

// ==========================================
// 10. RECOLECCIÓN DE DATOS
// ==========================================
function recolectarDatosPlan() {
    const metas = [];
    document.querySelectorAll('input[name="meta"]:checked').forEach(cb => {
        metas.push(cb.parentElement.textContent.trim());
    });
    
    const presupuesto = [];
    document.querySelectorAll('.item-plan').forEach(row => {
        const cantidad = row.querySelector('.cantidad')?.value || '';
        const descripcion = row.querySelector('.descripcion')?.value || '';
        const importe = sanitizarNumero(row.querySelector('.importe')?.value, 0);
        if (descripcion.trim()) {
            presupuesto.push({ cantidad, descripcion: sanitizarTexto(descripcion), importe });
        }
    });
    
    return {
        estaca: sanitizarTexto(document.getElementById('pEstaca').value),
        organizacion: document.getElementById('pOrganizacion').value,
        barrio: sanitizarTexto(document.getElementById('pBarrio').value),
        fecha: document.getElementById('pFecha').value,
        proposito: sanitizarTexto(document.getElementById('pProposito').value),
        metas: metas,
        asistentes: sanitizarNumero(document.getElementById('pAsistentes').value),
        responsables: sanitizarTexto(document.getElementById('pResponsables').value),
        limpieza: sanitizarTexto(document.getElementById('pLimpieza').value),
        solicitante: sanitizarTexto(document.getElementById('pSolicitante').value),
        obispo: sanitizarTexto(document.getElementById('pObispo').value),
        presupuesto: presupuesto
    };
}

function recolectarDatosRendicion() {
    const gastos = [];
    document.querySelectorAll('.item-rendicion').forEach(row => {
        const inputs = row.querySelectorAll('input');
        gastos.push({
            comprobante: sanitizarTexto(inputs[0].value),
            concepto: sanitizarTexto(inputs[1].value),
            fecha: inputs[2].value,
            proveedor: sanitizarTexto(inputs[3].value),
            monto: sanitizarNumero(inputs[4].value, 0)
        });
    });
    
    return {
        estaca: sanitizarTexto(document.getElementById('rEstaca').value),
        barrio: sanitizarTexto(document.getElementById('rBarrio').value),
        organizacion: document.getElementById('rOrganizacion').value,
        fecha: document.getElementById('rFecha').value,
        asistentes: sanitizarNumero(document.getElementById('rAsistentes').value),
        pagadoA: sanitizarTexto(document.getElementById('rPagadoA').value),
        cheque: sanitizarTexto(document.getElementById('rCheque').value),
        monto: sanitizarNumero(document.getElementById('rMonto').value, 0).toFixed(2),
        gastos: gastos
    };
}

function calcularTotalPlanImpresion() {
    let total = 0;
    document.querySelectorAll('.item-plan .importe').forEach(item => {
        total += sanitizarNumero(item.value, 0);
    });
    return total;
}