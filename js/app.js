// Manejo del menú lateral
const btnHamburger = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const navLinks = document.querySelectorAll(".nav-link");

btnHamburger.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});

// Navegación segura usando listeners en lugar de atributos onclick en el HTML
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target.getAttribute("data-target");
        mostrarSeccion(target);
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

// Lógica de Gastos Dinámicos
const btnAgregarGasto = document.getElementById("btnAgregarGasto");
const itemsRendicion = document.getElementById("itemsRendicion");

btnAgregarGasto.addEventListener("click", agregarItemRendicion);

function agregarItemRendicion() {
    // Usamos insertAdjacentHTML para inyectar una plantilla estática de forma segura
    const filaTemplate = `
        <div class="item-rendicion">
            <input type="text" class="form-control comprobante" placeholder="Comprobante" required>
            <input type="text" class="form-control concepto" placeholder="Concepto" required>
            <input type="date" class="form-control" required>
            <input type="text" class="form-control proveedor" placeholder="Proveedor" required>
            <input type="number" min="0" step="0.01" class="form-control monto" value="0" required>
            <button type="button" class="btn-eliminar">❌</button>
        </div>
    `;
    itemsRendicion.insertAdjacentHTML("beforeend", filaTemplate);
}

// Delegación de eventos: El contenedor padre escucha los eventos de sus hijos dinámicos
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
    
    // Convertir de forma segura evitando valores NaN
    document.querySelectorAll(".monto").forEach(item => {
        const valor = parseFloat(item.value);
        total += isNaN(valor) ? 0 : valor;
    });

    document.getElementById("totalRendicion").textContent = "Bs. " + total.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}