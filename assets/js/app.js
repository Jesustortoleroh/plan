/**
 * SISTEMA DE ACTIVIDADES
 * La Iglesia de Jesucristo de los Santos de los Últimos Días
 * Versión: 3.3
 */

// ==========================================
// 0. MODO OSCURO (data-theme)
// ==========================================
const themeToggle = document.getElementById('themeToggle');

let savedTheme = 'light';
try {
    savedTheme = localStorage.getItem('theme') || 'light';
} catch (error) {
    console.warn('No se pudo leer la preferencia de tema:', error);
}

if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️';
} else {
    document.body.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.textContent = '🌙';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.body.setAttribute('data-theme', 'light');
            guardarTema('light');
            themeToggle.textContent = '🌙';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            guardarTema('dark');
            themeToggle.textContent = '☀️';
        }
    });
}

function guardarTema(theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.warn('No se pudo guardar la preferencia de tema:', error);
    }
}

try {
    ['planActividad_SUD_v3', 'rendicionActividad_SUD_v1', 'ultimosValores_SUD']
        .forEach(key => localStorage.removeItem(key));
} catch (error) {
    console.warn('No se pudieron eliminar datos guardados por versiones anteriores:', error);
}

// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================
const CONFIG = {
    MAX_CARACTERES_PROPOSITO: 500,
    MAX_ASISTENTES: 9999
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

document.addEventListener('click', (e) => {
    if (!e.target.closest('.topbar') && topbarMenu.classList.contains('show')) {
        topbarMenu.classList.remove('show');
    }
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
            propositoCount.style.color = '#dc2626';
        } else if (length > CONFIG.MAX_CARACTERES_PROPOSITO * 0.8) {
            propositoCount.style.color = '#d97706';
        } else {
            propositoCount.style.color = '';
        }
    });
}

// ==========================================
// 2.5 💰 FORMATEO DE MONEDA AUTOMÁTICO
// ==========================================
document.addEventListener('input', function(e) {
    if (e.target.matches('.importe, .monto, .monto-formato')) {
        let valor = e.target.value.replace(/[^0-9,.]/g, '');
        if (valor !== e.target.value) {
            e.target.value = valor;
        }
    }
});

document.addEventListener('blur', function(e) {
    if (e.target.matches('.importe, .monto, .monto-formato')) {
        const valor = parseFloat(e.target.value.replace(/[^0-9,.-]/g, '').replace(',', '.')) || 0;
        e.target.value = valor.toFixed(2);
        
        if (e.target.classList.contains('importe')) calcularTotalPlan();
        if (e.target.classList.contains('monto')) calcularTotalRendicion();
    }
}, true);

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
    fila.className = 'item-rendicion';
    fila.style.gridTemplateColumns = '100px 1fr 140px 50px';
    
    const cantidad = sanitizarNumero(datos.cantidad, 0);
    const concepto = escapeHtml(sanitizarTexto(datos.concepto || ''));
    const importe = datos.importe ? parseFloat(datos.importe).toFixed(2) : '0.00';
    
    fila.innerHTML = `
        <div class="input-wrapper">
            <label class="mobile-label">Cantidad</label>
            <input type="number" min="0" max="9999" value="${cantidad}" 
                   class="cantidad" placeholder="Cant." 
                   aria-label="Cantidad" inputmode="numeric">
        </div>
        <div class="input-wrapper">
            <label class="mobile-label">Descripción del gasto</label>
            <input type="text" value="${concepto}" 
                   class="descripcion" 
                   placeholder="Descripción del gasto" maxlength="200" 
                   aria-label="Descripción del gasto">
        </div>
        <div class="input-wrapper">
            <label class="mobile-label">Importe</label>
            <input type="text" value="${importe}" 
                   class="importe" placeholder="0.00" 
                   aria-label="Importe" inputmode="decimal">
        </div>
        <button type="button" class="btn-eliminar no-print" 
                aria-label="Eliminar gasto" title="Eliminar gasto">×</button>
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
    fila.style.gridTemplateColumns = '110px 1.5fr 110px 1.5fr 110px 50px';
    
    const monto = datos.monto ? parseFloat(datos.monto).toFixed(2) : '0.00';
    
    fila.innerHTML = `
        <div class="input-wrapper">
            <label class="mobile-label">Comprobante</label>
            <input type="text" class="comprobante" 
                   value="${escapeHtml(sanitizarTexto(datos.comprobante || ''))}" 
                   placeholder="FAC-001" maxlength="50" aria-label="Comprobante">
        </div>
        <div class="input-wrapper">
            <label class="mobile-label">Concepto</label>
            <input type="text" class="concepto" 
                   value="${escapeHtml(sanitizarTexto(datos.concepto || ''))}" 
                   placeholder="Concepto" maxlength="200" aria-label="Concepto">
        </div>
        <div class="input-wrapper">
            <label class="mobile-label">Fecha</label>
            <input type="date" class="fecha-gasto" 
                   value="${escapeHtml(datos.fecha || '')}" aria-label="Fecha">
        </div>
        <div class="input-wrapper">
            <label class="mobile-label">Proveedor</label>
            <input type="text" class="proveedor" 
                   value="${escapeHtml(sanitizarTexto(datos.proveedor || ''))}" 
                   placeholder="Proveedor" maxlength="100" aria-label="Proveedor">
        </div>
        <div class="input-wrapper">
            <label class="mobile-label">Monto</label>
            <input type="text" class="monto" 
                   value="${monto}" 
                   placeholder="0.00" aria-label="Monto" inputmode="decimal">
        </div>
        <button type="button" class="btn-eliminar no-print" 
                aria-label="Eliminar gasto" title="Eliminar gasto">×</button>
    `;
    itemsRendicion.appendChild(fila);
    actualizarValorImpresion(fila.querySelector('.fecha-gasto'));
}

// ==========================================
// 5. UTILIDADES DE SANITIZACIÓN
// ==========================================
function sanitizarTexto(texto) {
    if (!texto) return '';
    return String(texto).trim().substring(0, 500);
}

function escapeHtml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizarNumero(valor, defecto = 0) {
    const num = parseFloat(String(valor).replace(/[^0-9,.-]/g, '').replace(',', '.'));
    return isNaN(num) || num < 0 ? defecto : num;
}

function actualizarValorImpresion(campo) {
    let valor = campo.value;
    if (campo.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [year, month, day] = valor.split('-');
        valor = `${day}/${month}/${year}`;
    } else if (campo.tagName === 'SELECT' && campo.value) {
        valor = campo.options[campo.selectedIndex].textContent.trim();
    } else if (campo.tagName === 'SELECT') {
        valor = '';
    }

    let salida = campo.nextElementSibling;
    if (!salida || !salida.classList.contains('print-only-value')) {
        salida = document.createElement('span');
        salida.className = 'print-only-value';
        campo.insertAdjacentElement('afterend', salida);
    }
    salida.textContent = valor;
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
            e.target.closest('.item-rendicion').remove();
            calcularTotalPlan();
        }
    }
});

itemsPlan.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('btn-eliminar') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
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

itemsRendicion.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('btn-eliminar') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
    }
});

function calcularTotalPlan() {
    let total = 0;
    document.querySelectorAll('#itemsPlan .importe').forEach(item => {
        total += sanitizarNumero(item.value, 0);
    });
    document.getElementById('totalPlan').textContent = 'Bs. ' + total.toLocaleString('es-VE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function calcularTotalRendicion() {
    let total = 0;
    document.querySelectorAll('#itemsRendicion .monto').forEach(item => {
        total += sanitizarNumero(item.value, 0);
    });
    document.getElementById('totalRendicion').textContent = 'Bs. ' + total.toLocaleString('es-VE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// ==========================================
// 7. VALIDACIÓN CON FLASH MESSAGES
// ==========================================
function validarPlanActividad() {
    limpiarFlashMessages();
    
    let errores = [];
    
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
            marcarError(el);
            errores.push(`El campo ${campo.nombre} es obligatorio.`);
        } else {
            limpiarError(el);
        }
    }
    
    const metasSeleccionadas = document.querySelectorAll('input[name="meta"]:checked');
    if (metasSeleccionadas.length === 0) {
        errores.push('Debe seleccionar al menos una meta de la actividad.');
        const metasCard = document.querySelector('.checkbox-list');
        if (metasCard) {
            metasCard.style.border = '2px solid #dc2626';
            metasCard.style.borderRadius = '8px';
            metasCard.style.padding = '10px';
            setTimeout(() => {
                metasCard.style.border = '';
                metasCard.style.padding = '';
            }, 3000);
        }
    }
    
    if (errores.length > 0) {
        mostrarFlashMessages(errores, 'error');
        const primerError = document.querySelector('.form-control[style*="border-color: rgb(220, 38, 38)"]');
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerError.focus();
        } else if (metasSeleccionadas.length === 0) {
            document.querySelector('.checkbox-list').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
    }
    
    return true;
}

function marcarError(elemento) {
    elemento.style.borderColor = 'var(--color-danger)';
    elemento.style.boxShadow = '0 0 0 3px var(--color-danger-bg)';
    elemento.setAttribute('aria-invalid', 'true');
    elemento.style.backgroundColor = 'var(--color-danger-bg)';
}

function limpiarError(elemento) {
    elemento.style.borderColor = '';
    elemento.style.boxShadow = '';
    elemento.style.backgroundColor = '';
    elemento.removeAttribute('aria-invalid');
}

function limpiarFlashMessages() {
    const existentes = document.querySelectorAll('.flash-message');
    existentes.forEach(el => el.remove());
}

function mostrarFlashMessages(mensajes, tipo = 'error') {
    limpiarFlashMessages();
    
    const colores = {
        error: { bg: 'var(--color-danger-bg)', border: 'var(--color-danger)', text: 'var(--color-danger)', icon: '⚠️' },
        success: { bg: 'var(--color-success-bg)', border: 'var(--color-success)', text: 'var(--color-success)', icon: '✅' },
        warning: { bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'var(--color-warning)', icon: '⚡' },
        info: { bg: 'var(--color-info-bg)', border: 'var(--color-info-border)', text: 'var(--color-info)', icon: 'ℹ️' }
    };
    
    const c = colores[tipo] || colores.error;
    
    const container = document.createElement('div');
    container.className = 'flash-message';
    container.style.cssText = `
        background: ${c.bg};
        border-left: 4px solid ${c.border};
        color: ${c.text};
        padding: 16px 20px;
        border-radius: var(--radius-md);
        margin-bottom: 20px;
        font-size: 14px;
        animation: slideDown 0.3s ease;
        position: relative;
    `;

    const content = document.createElement('div');
    content.style.cssText = 'display:flex;align-items:flex-start;gap:12px;';
    const icon = document.createElement('span');
    icon.textContent = c.icon;
    icon.style.fontSize = '20px';
    const messageContent = document.createElement('div');
    messageContent.style.flex = '1';

    if (mensajes.length === 1) {
        const paragraph = document.createElement('p');
        paragraph.textContent = mensajes[0];
        messageContent.appendChild(paragraph);
    } else {
        const paragraph = document.createElement('p');
        paragraph.textContent = `Se encontraron ${mensajes.length} campos por completar:`;
        paragraph.style.cssText = 'font-weight:700;margin-bottom:8px;';
        const list = document.createElement('ul');
        list.style.cssText = 'margin:0;padding-left:20px;';
        mensajes.forEach(msg => {
            const item = document.createElement('li');
            item.textContent = msg;
            item.style.marginBottom = '4px';
            list.appendChild(item);
        });
        messageContent.append(paragraph, list);
    }

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Cerrar mensaje');
    closeButton.style.cssText = `background:none;border:none;color:${c.text};cursor:pointer;font-size:20px;opacity:0.7;padding:0;line-height:1;`;
    closeButton.addEventListener('click', () => container.remove());
    content.append(icon, messageContent, closeButton);
    container.appendChild(content);

    const formPlan = document.getElementById('formPlan');
    formPlan.insertBefore(container, formPlan.firstChild);
    setTimeout(() => {
        if (container.parentElement) {
            container.style.opacity = '0';
            container.style.transition = 'opacity 0.5s ease';
            setTimeout(() => container.remove(), 500);
        }
    }, 8000);
}

function mostrarFlashExito(mensaje) {
    mostrarFlashMessages([mensaje], 'success');
}

document.addEventListener('input', event => {
    if (event.target.matches('input, textarea, select')) limpiarError(event.target);
});

document.addEventListener('change', event => {
    if (event.target.matches('input[type="checkbox"]')) {
        const metasCard = document.querySelector('.checkbox-list');
        if (metasCard) {
            metasCard.style.border = '';
            metasCard.style.borderRadius = '';
            metasCard.style.padding = '';
        }
    }
    if (event.target.matches('input[type="date"], select')) {
        actualizarValorImpresion(event.target);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date().toISOString().split('T')[0];
    if (!document.getElementById('pFecha').value) document.getElementById('pFecha').value = hoy;
    if (!document.getElementById('rFecha').value) document.getElementById('rFecha').value = hoy;
    if (itemsPlan.children.length === 0) agregarFilaPlan();
    if (itemsRendicion.children.length === 0) agregarFilaRendicion();
    document.querySelectorAll('input[type="date"], select').forEach(actualizarValorImpresion);
});

// ==========================================
// 9. PDF Y WHATSAPP
// ==========================================

document.getElementById('btnDescargarPDFPlan').addEventListener('click', () => {
    if (validarPlanActividad()) descargarPdf('plan');
});

document.getElementById('btnDescargarPDFRendicion').addEventListener('click', () => {
    descargarPdf('rendicion');
});

document.getElementById('btnWhatsappPlan').addEventListener('click', () => {
    if (validarPlanActividad()) enviarPdfPorWhatsApp('plan');
});

document.getElementById('btnWhatsappRendicion').addEventListener('click', () => {
    enviarPdfPorWhatsApp('rendicion');
});

document.getElementById('btnImprimirPlan').addEventListener('click', () => {
    if (validarPlanActividad()) window.print();
});

document.getElementById('btnImprimirRendicion').addEventListener('click', () => {
    window.print();
});

document.getElementById('formPlan').addEventListener('submit', event => event.preventDefault());

// PDF form data
function recolectarDatosPlan() {
    const metas = [];
    document.querySelectorAll('input[name="meta"]:checked').forEach(cb => {
        metas.push(cb.parentElement.textContent.trim());
    });
    
    const presupuesto = [];
    document.querySelectorAll('#itemsPlan .item-rendicion').forEach(row => {
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
    document.querySelectorAll('#itemsRendicion .item-rendicion').forEach(row => {
        const comprobante = row.querySelector('.comprobante')?.value || '';
        const concepto = row.querySelector('.concepto')?.value || '';
        const fecha = row.querySelector('.fecha-gasto')?.value || '';
        const proveedor = row.querySelector('.proveedor')?.value || '';
        const monto = row.querySelector('.monto')?.value || '0';
        
        gastos.push({
            comprobante: sanitizarTexto(comprobante),
            concepto: sanitizarTexto(concepto),
            fecha: fecha,
            proveedor: sanitizarTexto(proveedor),
            monto: sanitizarNumero(monto, 0)
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

function calcularTotalPlanPdf() {
    let total = 0;
    document.querySelectorAll('#itemsPlan .importe').forEach(item => {
        total += sanitizarNumero(item.value, 0);
    });
    return total;
}

function generarTextoPdf(tipo) {
    if (tipo === 'plan') {
        const datos = recolectarDatosPlan();
        const total = calcularTotalPlanPdf();
        return [
            'PLAN DE ACTIVIDAD',
            'La Iglesia de Jesucristo de los Santos de los Ultimos Dias',
            '',
            `Estaca: ${datos.estaca}`,
            `Barrio: ${datos.barrio}`,
            `Organizacion: ${datos.organizacion}`,
            `Fecha: ${datos.fecha}`,
            '',
            'PROPOSITO SAGRADO',
            datos.proposito,
            '',
            'METAS',
            ...(datos.metas.length ? datos.metas.map(meta => `- ${meta}`) : ['- Sin metas seleccionadas']),
            '',
            `Asistentes estimados: ${datos.asistentes}`,
            `Responsables: ${datos.responsables}`,
            `Limpieza capilla: ${datos.limpieza}`,
            `Solicitante: ${datos.solicitante}`,
            `Obispo / Presidente: ${datos.obispo}`,
            '',
            'PLAN DE PRESUPUESTO',
            ...datos.presupuesto.map(gasto =>
                `${gasto.cantidad || 1} | ${gasto.descripcion} | Bs. ${gasto.importe.toFixed(2)}`
            ),
            `TOTAL: Bs. ${total.toFixed(2)}`
        ];
    }

    const datos = recolectarDatosRendicion();
    const total = datos.gastos.reduce((suma, gasto) => suma + gasto.monto, 0);
    return [
        'RENDICION DE CUENTAS',
        'La Iglesia de Jesucristo de los Santos de los Ultimos Dias',
        '',
        `Estaca: ${datos.estaca}`,
        `Barrio: ${datos.barrio}`,
        `Organizacion: ${datos.organizacion}`,
        `Fecha: ${datos.fecha}`,
        `Asistentes: ${datos.asistentes}`,
        `Pagado a: ${datos.pagadoA}`,
        `Referencia: ${datos.cheque}`,
        `Monto recibido: Bs. ${datos.monto}`,
        '',
        'GASTOS ACTUALES',
        ...datos.gastos.map(gasto =>
            `${gasto.comprobante || '-'} | ${gasto.concepto || '-'} | ${gasto.fecha || '-'} | ${gasto.proveedor || '-'} | Bs. ${gasto.monto.toFixed(2)}`
        ),
        `TOTAL GASTOS: Bs. ${total.toFixed(2)}`
    ];
}

function crearArchivoPdf(tipo) {
    return PdfTools.createPdfBlob(generarTextoPdf(tipo));
}

function nombrePdf(tipo) {
    const datos = tipo === 'plan' ? recolectarDatosPlan() : recolectarDatosRendicion();
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) ? datos.fecha : new Date().toISOString().split('T')[0];
    return `${tipo === 'plan' ? 'plan-actividad' : 'rendicion-cuentas'}-${fecha}.pdf`;
}

function descargarPdf(tipo) {
    const blob = crearArchivoPdf(tipo);
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombrePdf(tipo);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    mostrarFlashExito('PDF descargado correctamente.');
}

async function enviarPdfPorWhatsApp(tipo) {
    const blob = crearArchivoPdf(tipo);
    const archivo = nombrePdf(tipo);
    const titulo = tipo === 'plan' ? 'Plan de actividad' : 'Rendicion de cuentas';
    const datos = tipo === 'plan' ? recolectarDatosPlan() : recolectarDatosRendicion();
    const texto = `${titulo} - ${datos.organizacion || datos.estaca || 'La Iglesia de Jesucristo de los Santos de los Últimos Días'}`;

    try {
        if (typeof File === 'function' &&
            typeof navigator.share === 'function' &&
            navigator.canShare) {
            const file = new File([blob], archivo, { type: 'application/pdf' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: titulo, text: texto });
                mostrarFlashExito('PDF listo para compartir.');
                return;
            }
        }
    } catch (error) {
        if (error && error.name === 'AbortError') return;
        console.warn('No fue posible compartir el PDF directamente:', error);
    }

    descargarPdf(tipo);
    const url = `https://wa.me/?text=${encodeURIComponent(`${texto}\nAdjunta el PDF que acabas de descargar.`)}`;
    const whatsappLink = document.createElement('a');
    whatsappLink.href = url;
    whatsappLink.target = '_blank';
    whatsappLink.rel = 'noopener noreferrer';
    whatsappLink.style.position = 'fixed';
    whatsappLink.style.left = '-10000px';
    document.body.appendChild(whatsappLink);
    whatsappLink.click();
    whatsappLink.remove();
    mostrarFlashMessages(['Se descargó el PDF. Adjunta el archivo en la conversación de WhatsApp.'], 'info');
}