// ==========================================
// 1. NAVEGACIÓN Y MENÚ SUPERIOR (TOPBAR)
// ==========================================
const btnHamburger = document.getElementById("hamburgerBtn");
const topbarMenu = document.getElementById("menuNav");
const navLinks = document.querySelectorAll(".nav-link");

// Mostrar/ocultar menú en móviles
btnHamburger.addEventListener("click", () => {
    topbarMenu.classList.toggle("show");
});

// Cambiar entre pestañas
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault(); // Evita que la página recargue al hacer clic
        const target = e.target.getAttribute("data-target");
        mostrarSeccion(target);
        
        // Ocultar el menú automáticamente en móviles tras elegir una opción
        if (window.innerWidth <= 768) {
            topbarMenu.classList.remove("show");
        }
    });
});

function mostrarSeccion(tipo) {
    // Muestra la sección seleccionada y oculta la otra
    document.getElementById("planSection").style.display = tipo === "plan" ? "block" : "none";
    document.getElementById("rendicionSection").style.display = tipo === "rendicion" ? "block" : "none";
    
    // Actualiza la clase 'active' en los botones del menú
    navLinks.forEach(link => link.classList.remove("active"));
    if (tipo === "plan") {
        navLinks[0].classList.add("active");
    } else {
        navLinks[1].classList.add("active");
    }
}

// ==========================================
// 2. TABLA: PLAN DE PRESUPUESTO
// ==========================================
const btnAgregarGastoPlan = document.getElementById("btnAgregarGastoPlan");
const itemsPlan = document.getElementById("itemsPlan");

// Agregar nueva fila de gasto anticipado
btnAgregarGastoPlan.addEventListener("click", () => {
    const filaTemplate = `
        <div class="item-plan">
            <div class="border-right"><input type="number" min="0" class="cantidad form-control-line" placeholder="Cant."></div>
            <div class="border-right"><input type="text" class="descripcion form-control-line text-left" placeholder="Descripción del gasto"></div>
            <div><input type="number" min="0" step="0.01" class="importe form-control-line" placeholder="0.00" value="0"></div>
            <div class="no-print text-center"><button type="button" class="btn-eliminar" aria-label="Eliminar">❌</button></div>
        </div>
    `;
    itemsPlan.insertAdjacentHTML("beforeend", filaTemplate);
});

// ==========================================
// 3. TABLA: RENDICIÓN DE CUENTAS
// ==========================================
const btnAgregarGastoRendicion = document.getElementById("btnAgregarGasto");
const itemsRendicion = document.getElementById("itemsRendicion");

// Agregar nueva fila de gasto actual
btnAgregarGastoRendicion.addEventListener("click", () => {
    const filaTemplate = `
        <div class="item-rendicion">
            <input type="text" class="form-control comprobante" placeholder="Comprobante">
            <input type="text" class="form-control concepto" placeholder="Concepto">
            <input type="date" class="form-control">
            <input type="text" class="form-control proveedor" placeholder="Proveedor">
            <input type="number" min="0" step="0.01" class="form-control monto" placeholder="Monto" value="0">
            <button type="button" class="btn-eliminar no-print" aria-label="Eliminar gasto">❌</button>
        </div>
    `;
    itemsRendicion.insertAdjacentHTML("beforeend", filaTemplate);
});

// ==========================================
// 4. ELIMINACIÓN Y CÁLCULOS (AMBAS TABLAS)
// ==========================================

// Delegación de eventos para PLAN DE PRESUPUESTO
itemsPlan.addEventListener("input", (e) => {
    if (e.target.classList.contains("importe")) calcularTotalPlan();
});
itemsPlan.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest(".item-plan").remove();
        calcularTotalPlan();
    }
});

// Delegación de eventos para RENDICIÓN DE CUENTAS
itemsRendicion.addEventListener("input", (e) => {
    if (e.target.classList.contains("monto")) calcularTotalRendicion();
});
itemsRendicion.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest(".item-rendicion").remove();
        calcularTotalRendicion();
    }
});

// Funciones matemáticas
function calcularTotalPlan() {
    let total = 0;
    document.querySelectorAll(".importe").forEach(item => {
        const valor = parseFloat(item.value);
        total += isNaN(valor) ? 0 : valor;
    });
    document.getElementById("totalPlan").textContent = total.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularTotalRendicion() {
    let total = 0;
    document.querySelectorAll(".monto").forEach(item => {
        const valor = parseFloat(item.value);
        total += isNaN(valor) ? 0 : valor;
    });
    document.getElementById("totalRendicion").textContent = "Bs. " + total.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}



// ==========================================
// 5. LOCALSTORAGE (GUARDADO EN NAVEGADOR)
// ==========================================
const formPlan = document.getElementById("formPlan");

formPlan.addEventListener("submit", (e) => {
    e.preventDefault(); 
    
    // Recolectar datos principales
    const planData = {
        estaca: document.getElementById("pEstaca").value,
        barrio: document.getElementById("pBarrio").value,
        organizacion: document.getElementById("pOrganizacion").value,
        fecha: document.getElementById("pFecha").value,
        proposito: document.getElementById("pProposito").value,
        asistentes: document.getElementById("pAsistentes").value,
        responsables: document.getElementById("pResponsables").value,
        limpieza: document.getElementById("pLimpieza").value
    };

    localStorage.setItem("planActividad_v2", JSON.stringify(planData));
    alert("¡Plan guardado exitosamente en la memoria del navegador!");
});

// Cargar datos al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    const datosGuardados = localStorage.getItem("planActividad_v2");
    if (datosGuardados) {
        const planData = JSON.parse(datosGuardados);
        
        // Asignar los valores guardados (si existen) a los inputs
        if(planData.estaca) document.getElementById("pEstaca").value = planData.estaca;
        if(planData.barrio) document.getElementById("pBarrio").value = planData.barrio;
        if(planData.organizacion) document.getElementById("pOrganizacion").value = planData.organizacion;
        if(planData.fecha) document.getElementById("pFecha").value = planData.fecha;
        if(planData.proposito) document.getElementById("pProposito").value = planData.proposito;
        if(planData.asistentes) document.getElementById("pAsistentes").value = planData.asistentes;
        if(planData.responsables) document.getElementById("pResponsables").value = planData.responsables;
        if(planData.limpieza) document.getElementById("pLimpieza").value = planData.limpieza;
    }
});

// ==========================================
// 6. IMPRESIÓN / EXPORTACIÓN
// ==========================================
document.getElementById("btnImprimirPlan").addEventListener("click", () => {
    window.print();
});

document.getElementById("btnImprimirRendicion").addEventListener("click", () => {
    window.print();
});