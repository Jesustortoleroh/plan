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
let planVinculado = false;

function fechaLocalIso(fecha = new Date()) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ==========================================
// 1. NAVEGACIÓN Y MENÚ SUPERIOR
// ==========================================
const btnHamburger = document.getElementById('hamburgerBtn');
const topbarMenu = document.getElementById('menuNav');
const navLinks = document.querySelectorAll('.nav-link');

function establecerMenuAbierto(abierto) {
    topbarMenu.classList.toggle('show', abierto);
    btnHamburger.setAttribute('aria-expanded', String(abierto));
    btnHamburger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
}

btnHamburger.addEventListener('click', () => {
    establecerMenuAbierto(!topbarMenu.classList.contains('show'));
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.topbar') && topbarMenu.classList.contains('show')) {
        establecerMenuAbierto(false);
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSeccion(link.getAttribute('data-target'));
        
        if (window.innerWidth <= 768) {
            establecerMenuAbierto(false);
        }
    });
});

function mostrarSeccion(tipo) {
    const planSection = document.getElementById('planSection');
    const rendicionSection = document.getElementById('rendicionSection');
    planSection.hidden = tipo !== 'plan';
    rendicionSection.hidden = tipo !== 'rendicion';
    navLinks.forEach(link => {
        const isCurrent = link.getAttribute('data-target') === tipo;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    if (tipo === 'rendicion') vincularPlanARendicion(false);
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
        let valor = e.target.value.replace(/[^0-9,.-]/g, '');
        if (valor !== e.target.value) {
            e.target.value = valor;
        }
    }
});

document.addEventListener('blur', function(e) {
    if (e.target.matches('.importe, .monto, .monto-formato')) {
        const valor = WorkflowTools.parseMoney(e.target.value);
        if (valor !== null) e.target.value = valor.toFixed(2);
        
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
    
    const cantidad = datos.cantidad === undefined || datos.cantidad === null ? '' : String(datos.cantidad);
    const concepto = escapeHtml(sanitizarTexto(datos.descripcion || datos.concepto || ''));
    const importeValor = WorkflowTools.parseMoney(datos.importe);
    const importe = importeValor === null ? '0.00' : importeValor.toFixed(2);
    
    fila.innerHTML = `
        <div class="input-wrapper">
            <label class="mobile-label">Cantidad</label>
            <input type="number" min="1" max="9999" value="${escapeHtml(cantidad)}"
                   class="cantidad" placeholder="1"
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
                   aria-label="Importe" inputmode="decimal" maxlength="20">
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
    
    const montoValor = WorkflowTools.parseMoney(datos.monto);
    const monto = montoValor === null ? '0.00' : montoValor.toFixed(2);
    
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
                   placeholder="0.00" aria-label="Monto" inputmode="decimal" maxlength="20">
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
    const num = WorkflowTools.parseMoney(valor);
    return num === null ? defecto : num;
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
    if (e.target.classList.contains('importe') || e.target.classList.contains('descripcion')) calcularTotalPlan();
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
    document.querySelectorAll('#itemsPlan .item-rendicion').forEach(fila => {
        if (fila.querySelector('.descripcion').value.trim()) {
            total += sanitizarNumero(fila.querySelector('.importe').value, 0);
        }
    });
    document.getElementById('totalPlan').textContent = 'Bs. ' + total.toLocaleString('es-VE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    actualizarComparacionPresupuesto();
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
    actualizarComparacionPresupuesto();
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

    const erroresPresupuesto = WorkflowTools.validatePlanBudget(leerFilasPlanCrudas());
    erroresPresupuesto.forEach(error => {
        const control = controlParaErrorPlan(error.field);
        if (control) marcarError(control);
        errores.push(error.message);
    });
    
    if (errores.length > 0) {
        mostrarFlashMessages(errores, 'error');
        const primerError = document.querySelector('#formPlan [aria-invalid="true"]');
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

function controlParaErrorPlan(campo) {
    const coincidencia = campo.match(/^presupuesto\.(\d+)\.(descripcion|cantidad|importe)$/);
    if (!coincidencia) return null;
    const fila = itemsPlan.querySelectorAll('.item-rendicion')[Number(coincidencia[1])];
    return fila ? fila.querySelector(`.${coincidencia[2]}`) : null;
}

function controlParaErrorRendicion(campo) {
    const camposDirectos = {
        estaca: 'rEstaca',
        barrio: 'rBarrio',
        organizacion: 'rOrganizacion',
        fecha: 'rFecha',
        asistentes: 'rAsistentes',
        monto: 'rMonto'
    };
    if (camposDirectos[campo]) return document.getElementById(camposDirectos[campo]);

    const coincidencia = campo.match(/^gastos\.(\d+)\.(concepto|monto|fecha)$/);
    if (!coincidencia) return null;
    const fila = itemsRendicion.querySelectorAll('.item-rendicion')[Number(coincidencia[1])];
    if (!fila) return null;
    const selectores = { concepto: '.concepto', monto: '.monto', fecha: '.fecha-gasto' };
    return fila.querySelector(selectores[coincidencia[2]]);
}

function validarRendicionActividad() {
    limpiarFlashMessages();
    document.querySelectorAll('#rendicionSection [aria-invalid="true"]').forEach(limpiarError);
    const errores = WorkflowTools.validateRendition(leerRendicionCruda());

    errores.forEach(error => {
        const control = controlParaErrorRendicion(error.field);
        if (control) marcarError(control);
    });

    if (errores.length > 0) {
        mostrarFlashMessages(
            errores.map(error => error.message),
            'error',
            document.querySelector('#rendicionSection .card')
        );
        const primerError = controlParaErrorRendicion(errores[0].field);
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerError.focus();
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

function mostrarFlashMessages(mensajes, tipo = 'error', destino) {
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
    container.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
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
        paragraph.textContent = `Se encontraron ${mensajes.length} problemas por corregir:`;
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
    const rendicionVisible = !document.getElementById('rendicionSection').hidden;
    const contenedor = destino || (rendicionVisible
        ? document.querySelector('#rendicionSection .card')
        : formPlan);
    contenedor.insertBefore(container, contenedor.firstChild);
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
    if (event.target.matches('input, textarea, select')) {
        limpiarError(event.target);
        if (event.target.closest('#planSection')) {
            actualizarBotonVinculacionPlan();
            if (planVinculado) actualizarComparacionPresupuesto();
        } else if (event.target.closest('#rendicionSection')) {
            actualizarComparacionPresupuesto();
        }
    }
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
    if (event.target.closest('#planSection')) {
        actualizarBotonVinculacionPlan();
        if (planVinculado) actualizarComparacionPresupuesto();
    }
    if (event.target.closest('#rendicionSection')) actualizarComparacionPresupuesto();
});

document.addEventListener('DOMContentLoaded', () => {
    const hoy = fechaLocalIso();
    if (!document.getElementById('pFecha').value) document.getElementById('pFecha').value = hoy;
    if (itemsPlan.children.length === 0) agregarFilaPlan();
    if (itemsRendicion.children.length === 0) agregarFilaRendicion();
    document.querySelectorAll('input[type="date"], select').forEach(actualizarValorImpresion);
    calcularTotalPlan();
    calcularTotalRendicion();
    actualizarBotonVinculacionPlan();
    actualizarComparacionPresupuesto();
});

// ==========================================
// 9. PDF Y WHATSAPP
// ==========================================

document.getElementById('btnDescargarPDFPlan').addEventListener('click', () => {
    if (validarPlanActividad()) descargarPdf('plan');
});

document.getElementById('btnDescargarPDFRendicion').addEventListener('click', () => {
    if (validarRendicionActividad()) descargarPdf('rendicion');
});

document.getElementById('btnWhatsappPlan').addEventListener('click', () => {
    if (validarPlanActividad()) enviarPdfPorWhatsApp('plan');
});

document.getElementById('btnWhatsappRendicion').addEventListener('click', () => {
    if (validarRendicionActividad()) enviarPdfPorWhatsApp('rendicion');
});

document.getElementById('btnImprimirPlan').addEventListener('click', () => {
    if (validarPlanActividad()) imprimirSeccion('plan');
});

document.getElementById('btnImprimirRendicion').addEventListener('click', () => {
    if (validarRendicionActividad()) imprimirSeccion('rendicion');
});

function imprimirSeccion(tipo) {
    document.body.dataset.printSection = tipo;
    window.print();
}

window.addEventListener('afterprint', () => {
    delete document.body.dataset.printSection;
});

document.getElementById('formPlan').addEventListener('submit', event => event.preventDefault());
document.getElementById('btnActualizarDesdePlan').addEventListener('click', () => vincularPlanARendicion(true));
document.getElementById('btnGuardarBorrador').addEventListener('click', guardarBorrador);
document.getElementById('btnAbrirBorrador').addEventListener('click', () => {
    document.getElementById('archivoBorrador').click();
});
document.getElementById('archivoBorrador').addEventListener('change', abrirBorrador);

function leerFilasPlanCrudas() {
    return Array.from(document.querySelectorAll('#itemsPlan .item-rendicion')).map(row => ({
        cantidad: row.querySelector('.cantidad').value,
        descripcion: row.querySelector('.descripcion').value,
        importe: row.querySelector('.importe').value
    }));
}

function leerGastosRendicionCrudos() {
    return Array.from(document.querySelectorAll('#itemsRendicion .item-rendicion')).map(row => ({
        comprobante: row.querySelector('.comprobante').value,
        concepto: row.querySelector('.concepto').value,
        fecha: row.querySelector('.fecha-gasto').value,
        proveedor: row.querySelector('.proveedor').value,
        monto: row.querySelector('.monto').value
    }));
}

function filaGastoTieneDatos(gasto) {
    const monto = String(gasto.monto || '').trim();
    const montoNumerico = WorkflowTools.parseMoney(monto);
    return [gasto.comprobante, gasto.concepto, gasto.fecha, gasto.proveedor]
        .some(value => String(value || '').trim()) ||
        (monto !== '' && (montoNumerico === null || montoNumerico > 0));
}

function leerDatosPlanCrudos() {
    return {
        estaca: document.getElementById('pEstaca').value,
        barrio: document.getElementById('pBarrio').value,
        organizacion: document.getElementById('pOrganizacion').value,
        fecha: document.getElementById('pFecha').value,
        proposito: document.getElementById('pProposito').value,
        metas: Array.from(document.querySelectorAll('input[name="meta"]:checked'), checkbox => checkbox.value),
        asistentes: document.getElementById('pAsistentes').value,
        responsables: document.getElementById('pResponsables').value,
        limpieza: document.getElementById('pLimpieza').value,
        solicitante: document.getElementById('pSolicitante').value,
        obispo: document.getElementById('pObispo').value,
        presupuesto: leerFilasPlanCrudas()
    };
}

function leerRendicionCruda() {
    return {
        estaca: document.getElementById('rEstaca').value,
        barrio: document.getElementById('rBarrio').value,
        organizacion: document.getElementById('rOrganizacion').value,
        fecha: document.getElementById('rFecha').value,
        asistentes: document.getElementById('rAsistentes').value,
        pagadoA: document.getElementById('rPagadoA').value,
        cheque: document.getElementById('rCheque').value,
        monto: document.getElementById('rMonto').value,
        gastos: leerGastosRendicionCrudos()
    };
}

function planListoParaVincular(plan = leerDatosPlanCrudos()) {
    return Boolean(
        plan.estaca.trim() &&
        plan.barrio.trim() &&
        plan.organizacion.trim() &&
        plan.fecha.trim() &&
        plan.proposito.trim()
    );
}

function actualizarBotonVinculacionPlan() {
    document.getElementById('btnActualizarDesdePlan').disabled = !planListoParaVincular();
}

function vincularPlanARendicion(reemplazar) {
    const plan = leerDatosPlanCrudos();
    if (!planListoParaVincular(plan)) {
        if (reemplazar) {
            mostrarFlashMessages(
                ['Complete estaca, barrio, organización, fecha y propósito en el plan antes de vincularlo.'],
                'error',
                document.querySelector('#rendicionSection .card')
            );
        }
        actualizarBotonVinculacionPlan();
        return false;
    }

    const rendicion = leerRendicionCruda();
    const camposCompartidos = ['estaca', 'barrio', 'organizacion', 'fecha'];
    const hayDatosCompartidos = camposCompartidos
        .some(campo => String(rendicion[campo] || '').trim());
    if (reemplazar && hayDatosCompartidos &&
        !window.confirm('Se reemplazarán los datos generales de la rendición con los del plan. ¿Desea continuar?')) {
        return false;
    }
    if (!reemplazar && camposCompartidos.some(campo =>
        String(plan[campo] || '').trim() &&
        String(rendicion[campo] || '').trim() &&
        String(plan[campo]).trim() !== String(rendicion[campo]).trim())) {
        planVinculado = false;
        actualizarComparacionPresupuesto();
        mostrarFlashMessages(
            ['Los datos de la rendición no coinciden con el plan. Use "Usar datos del plan" para reemplazarlos y vincularlos.'],
            'warning',
            document.querySelector('#rendicionSection .card')
        );
        return false;
    }

    const datosVinculados = WorkflowTools.copyPlanToRendition(plan, rendicion, reemplazar);
    document.getElementById('rEstaca').value = datosVinculados.estaca;
    document.getElementById('rBarrio').value = datosVinculados.barrio;
    document.getElementById('rOrganizacion').value = datosVinculados.organizacion;
    document.getElementById('rFecha').value = datosVinculados.fecha;
    actualizarValorImpresion(document.getElementById('rOrganizacion'));
    actualizarValorImpresion(document.getElementById('rFecha'));

    planVinculado = true;
    actualizarComparacionPresupuesto();
    if (reemplazar) mostrarFlashExito('Datos generales copiados desde el plan.');
    return true;
}

function formatearMoneda(valor) {
    return 'Bs. ' + valor.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function rendicionCoincideConPlan() {
    const plan = leerDatosPlanCrudos();
    const rendicion = leerRendicionCruda();
    return ['estaca', 'barrio', 'organizacion', 'fecha'].every(campo =>
        String(plan[campo] || '').trim() === String(rendicion[campo] || '').trim());
}

function actualizarComparacionPresupuesto() {
    const comparacion = document.getElementById('comparacionPresupuesto');
    if (!comparacion) return;
    const estabaVinculado = planVinculado;
    if (planVinculado && !rendicionCoincideConPlan()) planVinculado = false;
    comparacion.hidden = !planVinculado;
    if (estabaVinculado && !planVinculado &&
        !document.getElementById('rendicionSection').hidden) {
        mostrarFlashMessages(
            ['Los datos generales ya no coinciden con el plan. La comparación se ocultó; use "Usar datos del plan" para vincular de nuevo.'],
            'warning',
            document.querySelector('#rendicionSection .card')
        );
    }
    if (!planVinculado) return;

    const gastos = leerGastosRendicionCrudos().filter(filaGastoTieneDatos);
    const totalGastos = gastos.reduce((total, gasto) => total + (WorkflowTools.parseMoney(gasto.monto) || 0), 0);
    const resultado = WorkflowTools.compareBudget(calcularTotalPlanPdf(), totalGastos);
    document.getElementById('presupuestoAprobado').textContent = formatearMoneda(resultado.approved);
    document.getElementById('gastosRegistrados').textContent = formatearMoneda(resultado.actual);
    document.getElementById('etiquetaSaldo').textContent = resultado.overBudget
        ? 'Exceso sobre el presupuesto'
        : 'Saldo disponible';
    document.getElementById('montoSaldo').textContent = formatearMoneda(Math.abs(resultado.balance));
    document.getElementById('saldoPresupuesto').classList.toggle('is-over', resultado.overBudget);
    document.getElementById('estadoPresupuesto').textContent = resultado.overBudget
        ? `Los gastos superan el presupuesto aprobado por ${formatearMoneda(Math.abs(resultado.balance))}.`
        : `Saldo del presupuesto: ${formatearMoneda(resultado.balance)}.`;
}

function crearBorradorActual() {
    return WorkflowTools.createDraft(leerDatosPlanCrudos(), leerRendicionCruda(), planVinculado);
}

function guardarBorrador() {
    try {
        const contenido = WorkflowTools.serializeDraft(crearBorradorActual());
        const blob = new Blob([contenido], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `borrador-actividades-${fechaLocalIso()}.json`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        mostrarFlashExito('Borrador descargado en este dispositivo.');
    } catch (error) {
        mostrarFlashMessages([`No se pudo guardar el borrador: ${error.message}`]);
    }
}

function formularioTieneDatos() {
    const campos = [
        'pEstaca', 'pOrganizacion', 'pBarrio', 'pProposito', 'pAsistentes',
        'pResponsables', 'pLimpieza', 'pSolicitante', 'pObispo',
        'rEstaca', 'rBarrio', 'rOrganizacion', 'rAsistentes', 'rPagadoA', 'rCheque', 'rMonto'
    ];
    if (campos.some(id => document.getElementById(id).value.trim())) return true;
    if (document.querySelector('input[name="meta"]:checked')) return true;
    if (leerFilasPlanCrudas().some(row =>
        row.descripcion.trim() || row.cantidad.trim() ||
        WorkflowTools.parseMoney(row.importe) === null ||
        (WorkflowTools.parseMoney(row.importe) || 0) > 0)) return true;
    return leerGastosRendicionCrudos().some(filaGastoTieneDatos);
}

function asignarSelect(select, value) {
    if (value && !Array.from(select.options).some(option => option.value === value)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.add(option);
    }
    select.value = value;
}

function aplicarBorrador(borrador) {
    const camposPlan = {
        pEstaca: borrador.plan.estaca,
        pBarrio: borrador.plan.barrio,
        pFecha: borrador.plan.fecha,
        pProposito: borrador.plan.proposito,
        pAsistentes: borrador.plan.asistentes,
        pResponsables: borrador.plan.responsables,
        pLimpieza: borrador.plan.limpieza,
        pSolicitante: borrador.plan.solicitante,
        pObispo: borrador.plan.obispo
    };
    Object.entries(camposPlan).forEach(([id, value]) => {
        document.getElementById(id).value = value;
    });
    asignarSelect(document.getElementById('pOrganizacion'), borrador.plan.organizacion);
    const metas = new Set(borrador.plan.metas);
    document.querySelectorAll('input[name="meta"]').forEach(checkbox => {
        checkbox.checked = metas.has(checkbox.value);
    });

    const camposRendicion = {
        rEstaca: borrador.rendicion.estaca,
        rBarrio: borrador.rendicion.barrio,
        rFecha: borrador.rendicion.fecha,
        rAsistentes: borrador.rendicion.asistentes,
        rPagadoA: borrador.rendicion.pagadoA,
        rCheque: borrador.rendicion.cheque,
        rMonto: borrador.rendicion.monto
    };
    Object.entries(camposRendicion).forEach(([id, value]) => {
        document.getElementById(id).value = value;
    });
    asignarSelect(document.getElementById('rOrganizacion'), borrador.rendicion.organizacion);

    itemsPlan.textContent = '';
    borrador.plan.presupuesto.forEach(agregarFilaPlan);
    if (itemsPlan.children.length === 0) agregarFilaPlan();
    itemsRendicion.textContent = '';
    borrador.rendicion.gastos.forEach(agregarFilaRendicion);
    if (itemsRendicion.children.length === 0) agregarFilaRendicion();

    document.querySelectorAll('[aria-invalid="true"]').forEach(limpiarError);
    propositoCount.textContent = `${borrador.plan.proposito.length}/${CONFIG.MAX_CARACTERES_PROPOSITO}`;
    planVinculado = borrador.planLinked;
    document.querySelectorAll('input[type="date"], select').forEach(actualizarValorImpresion);
    calcularTotalPlan();
    calcularTotalRendicion();
    actualizarBotonVinculacionPlan();
    actualizarComparacionPresupuesto();
}

function abrirBorrador(event) {
    const input = event.target;
    const archivo = input.files[0];
    if (!archivo) return;
    if (archivo.size > WorkflowTools.MAX_DRAFT_CHARS) {
        mostrarFlashMessages(['El archivo de borrador supera el tamaño permitido.']);
        input.value = '';
        return;
    }

    const lector = new FileReader();
    lector.onload = () => {
        try {
            const borrador = WorkflowTools.parseDraft(String(lector.result || ''));
            if (formularioTieneDatos() &&
                !window.confirm('Abrir el borrador reemplazara los datos actuales. ¿Desea continuar?')) return;
            aplicarBorrador(borrador);
            mostrarFlashExito('Borrador abierto correctamente.');
        } catch (error) {
            mostrarFlashMessages([`No se pudo abrir el borrador: ${error.message}`]);
        } finally {
            input.value = '';
        }
    };
    lector.onerror = () => {
        mostrarFlashMessages(['No se pudo leer el archivo de borrador.']);
        input.value = '';
    };
    lector.readAsText(archivo, 'UTF-8');
}

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
    const gastos = leerGastosRendicionCrudos()
        .filter(filaGastoTieneDatos)
        .map(gasto => ({
            comprobante: sanitizarTexto(gasto.comprobante),
            concepto: sanitizarTexto(gasto.concepto),
            fecha: gasto.fecha,
            proveedor: sanitizarTexto(gasto.proveedor),
            monto: sanitizarNumero(gasto.monto, 0)
        }));
    
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
    document.querySelectorAll('#itemsPlan .item-rendicion').forEach(fila => {
        if (fila.querySelector('.descripcion').value.trim()) {
            total += sanitizarNumero(fila.querySelector('.importe').value, 0);
        }
    });
    return total;
}

function textoCeldaPdf(valor, defecto = '-') {
    const texto = String(valor || '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
    return texto || defecto;
}

function formatearFechaPdf(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return '-';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
}

function generarTextoPdf(tipo) {
    if (tipo === 'plan') {
        const datos = recolectarDatosPlan();
        const total = calcularTotalPlanPdf();
        return [
            'Plan de actividad',
            'La Iglesia de Jesucristo de los Santos de los Últimos Días',
            '',
            'Datos generales',
            `Estaca: ${textoCeldaPdf(datos.estaca)}`,
            `Barrio: ${textoCeldaPdf(datos.barrio)}`,
            `Organización: ${textoCeldaPdf(datos.organizacion)}`,
            `Fecha: ${formatearFechaPdf(datos.fecha)}`,
            '',
            'Propósito sagrado',
            textoCeldaPdf(datos.proposito, 'Sin descripción'),
            '',
            'Metas',
            ...(datos.metas.length ? datos.metas.map(meta => `- ${textoCeldaPdf(meta)}`) : ['- Sin metas seleccionadas']),
            '',
            'Participación y responsables',
            `Asistentes estimados: ${datos.asistentes}`,
            `Responsables: ${textoCeldaPdf(datos.responsables)}`,
            `Limpieza capilla: ${textoCeldaPdf(datos.limpieza)}`,
            `Solicitante: ${textoCeldaPdf(datos.solicitante)}`,
            `Obispo / Presidente: ${textoCeldaPdf(datos.obispo)}`,
            '',
            'Plan de presupuesto',
            'Cantidad | Descripción | Importe',
            ...(datos.presupuesto.length ? datos.presupuesto.map(gasto =>
                `${gasto.cantidad || 1} | ${textoCeldaPdf(gasto.descripcion)} | Bs. ${gasto.importe.toFixed(2)}`
            ) : ['Sin gastos anticipados']),
            `TOTAL: Bs. ${total.toFixed(2)}`
        ];
    }

    const datos = recolectarDatosRendicion();
    const total = datos.gastos.reduce((suma, gasto) => suma + gasto.monto, 0);
    const comparacion = WorkflowTools.compareBudget(calcularTotalPlanPdf(), total);
    const resumenPresupuesto = planVinculado ? [
        'Comparación con el plan de presupuesto',
        `Presupuesto aprobado: Bs. ${comparacion.approved.toFixed(2)}`,
        `Gastos registrados: Bs. ${comparacion.actual.toFixed(2)}`,
        `${comparacion.overBudget ? 'Exceso sobre el presupuesto' : 'Saldo disponible'}: Bs. ${Math.abs(comparacion.balance).toFixed(2)}`
    ] : [];
    return [
        'Rendición de cuentas',
        'La Iglesia de Jesucristo de los Santos de los Últimos Días',
        '',
        'Datos de la actividad',
        `Estaca: ${textoCeldaPdf(datos.estaca)}`,
        `Barrio: ${textoCeldaPdf(datos.barrio)}`,
        `Organización: ${textoCeldaPdf(datos.organizacion)}`,
        `Fecha: ${formatearFechaPdf(datos.fecha)}`,
        `Asistentes: ${datos.asistentes}`,
        `Pagado a: ${textoCeldaPdf(datos.pagadoA)}`,
        `Referencia: ${textoCeldaPdf(datos.cheque)}`,
        `Monto recibido: Bs. ${datos.monto}`,
        ...(resumenPresupuesto.length ? ['', ...resumenPresupuesto] : []),
        '',
        'Gastos actuales',
        'Comprobante | Concepto | Fecha | Proveedor | Monto',
        ...(datos.gastos.length ? datos.gastos.map(gasto =>
            `${textoCeldaPdf(gasto.comprobante)} | ${textoCeldaPdf(gasto.concepto)} | ${formatearFechaPdf(gasto.fecha)} | ${textoCeldaPdf(gasto.proveedor)} | Bs. ${gasto.monto.toFixed(2)}`
        ) : ['Sin gastos registrados']),
        `Total gastos: Bs. ${total.toFixed(2)}`
    ];
}

function crearArchivoPdf(tipo) {
    return PdfTools.createPdfBlob(generarTextoPdf(tipo));
}

function nombrePdf(tipo) {
    const datos = tipo === 'plan' ? recolectarDatosPlan() : recolectarDatosRendicion();
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) ? datos.fecha : fechaLocalIso();
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
    const titulo = tipo === 'plan' ? 'Plan de actividad' : 'Rendición de cuentas';
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