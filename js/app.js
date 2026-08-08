function inicializarApp() {
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    agregarItemPresupuesto();
}

function nuevoPlan() {
    location.reload();
}

// =============================================
// PRESUPUESTO
// =============================================

function agregarItemPresupuesto(item = {}) {
    const html = `
        <div class="item-presupuesto">
            <input type="number" value="${item.cantidad || 1}" min="0" class="form-control cantidad" placeholder="Cantidad" onchange="calcularTotal()">
            <input type="text" value="${item.concepto || ''}" class="form-control descripcion" placeholder="Descripción">
            <input type="number" value="${item.costo || 0}" min="0" step="0.01" class="form-control monto-unitario" placeholder="Monto Unitario" onchange="calcularTotal()">
            <div class="subtotal-item">Bs. ${((item.cantidad || 0) * (item.costo || 0)).toFixed(2)}</div>
            <button onclick="this.parentElement.remove();calcularTotal();" class="btn btn-danger btn-sm">✕</button>
        </div>
    `;
    document.getElementById('itemsPresupuesto').insertAdjacentHTML('beforeend', html);
}

function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.item-presupuesto').forEach(row => {
        const cantidad = parseFloat(row.querySelector('.cantidad').value) || 0;
        const costo = parseFloat(row.querySelector('.monto-unitario').value) || 0;
        const subtotal = cantidad * costo;
        row.querySelector('.subtotal-item').textContent = 'Bs. ' + subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById('totalPresupuestoForm').textContent = 'Bs. ' + total.toFixed(2);
}

// =============================================
// GENERAR PDF
// =============================================

function generarPDF() {
    const metas = [];
    document.querySelectorAll('.meta-check input:checked').forEach(cb => metas.push(cb.value));
    
    const presupuesto = [];
    document.querySelectorAll('.item-presupuesto').forEach(row => {
        const concepto = row.querySelector('.descripcion').value.trim();
        if (concepto) {
            presupuesto.push({
                cantidad: parseInt(row.querySelector('.cantidad').value) || 0,
                concepto: concepto,
                costo: parseFloat(row.querySelector('.monto-unitario').value) || 0
            });
        }
    });
    
    const datos = {
        estaca: document.getElementById('estaca').value,
        organizacion: document.getElementById('organizacion').value,
        barrio: document.getElementById('barrio').value,
        fecha: document.getElementById('fecha').value,
        proposito: document.getElementById('proposito').value,
        metas: metas,
        asistentes: document.getElementById('asistentes').value,
        responsables: document.getElementById('responsables').value,
        limpieza: document.getElementById('limpieza').value,
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
                .firmas { display: flex; justify-content: space-around; margin-top: 50px; }
                .firma { text-align: center; }
                .linea { border-top: 1px solid #333; width: 180px; margin: 40px auto 5px; }
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
                <div><span class="dato-label">Estaca:</span> <span class="dato-valor">${datos.estaca || '___________________'}</span></div>
                <div><span class="dato-label">Organización:</span> <span class="dato-valor">${datos.organizacion || '___________________'}</span></div>
                <div><span class="dato-label">Barrio:</span> <span class="dato-valor">${datos.barrio || '___________________'}</span></div>
                <div><span class="dato-label">Fecha:</span> <span class="dato-valor">${datos.fecha || '___________________'}</span></div>
            </div>
            
            <h2>PROPÓSITO SAGRADO</h2>
            <p style="font-size:11px;color:#666;">(para satisfacer las necesidades espirituales y temporales de los participantes)</p>
            <p style="border:1px solid #ccc;padding:10px;min-height:50px;border-radius:5px;">${datos.proposito || '___________________________________________________________________________'}</p>
            
            <h2>META(S):</h2>
            ${datos.metas.length > 0 ? `<ul>${datos.metas.map(m => `<li>${m}</li>`).join('')}</ul>` : '<p>☐ Ninguna seleccionada</p>'}
            
            <div class="datos">
                <div><span class="dato-label">Total estimado de asistentes:</span> <span class="dato-valor">${datos.asistentes || '___________________'}</span></div>
                <div><span class="dato-label">Responsables:</span> <span class="dato-valor">${datos.responsables || '___________________'}</span></div>
                <div style="grid-column: span 2;"><span class="dato-label">Responsables limpieza capilla:</span> <span class="dato-valor">${datos.limpieza || '___________________'}</span></div>
            </div>
            
            <h2>PLAN DE PRESUPUESTO</h2>
            <h3>GASTOS ANTICIPADOS</h3>
            <table>
                <thead><tr><th>Cantidad</th><th>Descripción</th><th>Monto Unitario</th><th>Subtotal</th></tr></thead>
                <tbody>
                    ${presupuesto.map(p => `
                        <tr><td>${p.cantidad}</td><td>${p.concepto}</td><td>Bs. ${p.costo.toFixed(2)}</td><td>Bs. ${(p.cantidad*p.costo).toFixed(2)}</td></tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="total">TOTAL de gastos ANTICIPADOS: Bs. ${total.toFixed(2)}</p>
            
            <div class="firmas">
                <div class="firma"><div class="linea"></div>Responsable</div>
                <div class="firma"><div class="linea"></div>Líder de Organización</div>
                <div class="firma"><div class="linea"></div>Obispo/Presidente</div>
            </div>
            
            <p style="text-align:center;color:#999;font-size:10px;margin-top:30px;">Generado: ${new Date().toLocaleDateString()}</p>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

document.addEventListener('DOMContentLoaded', inicializarApp);