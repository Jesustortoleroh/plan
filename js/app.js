// --- MANEJO DEL MENÚ LATERAL ---
const btnHamburger = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const navLinks = document.querySelectorAll(".nav-link");

btnHamburger.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target.getAttribute("data-target");
        mostrarSeccion(target);
        
        // Cierra el menú en móviles después de hacer clic
        if (window.innerWidth <= 768) {
            sidebar.classList.remove("show");
        }
    });
});

function mostrarSeccion(tipo) {
    document.getElementById("planSection").style.display = tipo === "plan" ? "block" : "none";
    document.getElementById("rendicionSection").style.display = tipo === "rendicion" ? "block" : "none";
    
    navLinks.forEach(link => link.classList.remove("active"));
    
    if (tipo === "plan") {
        navLinks[0].classList.add("active");
    } else {
        navLinks[1].classList.add("active");
    }
}


// --- MANEJO DE GASTOS DINÁMICOS Y CÁLCULO ---
const btnAgregarGasto = document.getElementById("btnAgregarGasto");
const itemsRendicion = document.getElementById("itemsRendicion");

btnAgregarGasto.addEventListener("click", () => {
    const filaTemplate = `
        <div class="item-rendicion">
            <input type="text" class="form-control comprobante" placeholder="Comprobante">
            <input type="text" class="form-control concepto" placeholder="Concepto">
            <input type="date" class="form-control">
            <input type="text" class="form-control proveedor" placeholder="Proveedor">
            <input type="number" min="0" step="0.01" class="form-control monto" placeholder="Monto" value="0">
            <button type="button" class="btn-eliminar" aria-label="Eliminar gasto">❌</button>
        </div>
    `;
    itemsRendicion.insertAdjacentHTML("beforeend", filaTemplate);
});

// Delegación de eventos para calcular monto y eliminar filas dinámicas
itemsRendicion.addEventListener("input", (e) => {
    if (e.target.classList.contains("monto")) {
        calcularTotalRendicion();
    }
});

itemsRendicion.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest(".item-rendicion").remove();
        calcularTotalRendicion();
    }
});

function calcularTotalRendicion() {
    let total = 0;
    document.querySelectorAll(".monto").forEach(item => {
        const valor = parseFloat(item.value);
        total += isNaN(valor) ? 0 : valor;
    });

    document.getElementById("totalRendicion").textContent = "Bs. " + total.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// --- PERSISTENCIA DE DATOS CON LOCALSTORAGE (Solo Frontend) ---
const formPlan = document.getElementById("formPlan");

formPlan.addEventListener("submit", (e) => {
    e.preventDefault(); 
    const planData = {
        organizacion: document.getElementById("pOrganizacion").value,
        fecha: document.getElementById("pFecha").value,
        solicitante: document.getElementById("pSolicitante").value,
        proposito: document.getElementById("pProposito").value
    };

    localStorage.setItem("planActividad", JSON.stringify(planData));
    alert("¡Plan guardado exitosamente en la memoria del navegador!");
});

// Cargar datos al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    const datosGuardados = localStorage.getItem("planActividad");
    if (datosGuardados) {
        const planData = JSON.parse(datosGuardados);
        document.getElementById("pOrganizacion").value = planData.organizacion || "";
        document.getElementById("pFecha").value = planData.fecha || "";
        document.getElementById("pSolicitante").value = planData.solicitante || "";
        document.getElementById("pProposito").value = planData.proposito || "";
    }
});


// --- EXPORTAR A PDF / IMPRIMIR ---
document.getElementById("btnImprimir").addEventListener("click", () => {
    window.print();
});