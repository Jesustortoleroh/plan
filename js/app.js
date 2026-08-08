function generarPDF() {
    
    console.log('🟢 Iniciando generación de PDF...');
    
    if (!validarFormulario()) {
        console.log('🔴 Validación fallida');
        return false;
    }
    
    console.log('🟢 Validación exitosa, recolectando datos...');
    
    const metas = [];
    document.querySelectorAll('.meta-check input:checked').forEach(cb => metas.push(cb.value));
    
    const presupuesto = [];
    document.querySelectorAll('.item-presupuesto').forEach(row => {
        const concepto = row.querySelector('.descripcion-input').value.trim();
        const cantidad = parseInt(row.querySelector('.cantidad-input').value) || 0;
        const costo = parseFloat(row.querySelector('.costo-input').value) || 0;
        if (concepto && cantidad > 0 && costo > 0) {
            presupuesto.push({ cantidad, concepto, costo });
        }
    });
    
    const datos = {
        organizacion: document.getElementById('organizacion').value.trim(),
        fecha: document.getElementById('fecha').value,
        solicitante: document.getElementById('solicitante').value.trim(),
        obispo: document.getElementById('obispo').value.trim(),
        estaca: document.getElementById('estaca').value.trim(),
        barrio: document.getElementById('barrio').value.trim(),
        proposito: document.getElementById('proposito').value.trim(),
        metas: metas,
        asistentes: document.getElementById('asistentes').value.trim(),
        responsables: document.getElementById('responsables').value.trim(),
        limpieza: document.getElementById('limpieza').value.trim(),
        presupuesto: presupuesto
    };
    
    let total = 0;
    presupuesto.forEach(p => total += p.cantidad * p.costo);
    
    console.log('📄 Abriendo ventana del PDF...');
    
    const ventana = window.open('', '_blank', 'width=900,height=700');
    
    if (!ventana) {
        alert('⚠️ El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.');
        return;
    }
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Plan de Actividad - ${datos.organizacion}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 800px; margin: auto; }
                h1 { color: #1a237e; text-align: center; border-bottom: 3px solid #1a237e; padding-bottom: 10px; font-size: 20px; }
                h2 { color: #1a237e; margin-top: 20px; font-size: 16px; }
                .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
                .dato-label { font-weight: bold; font-size: 11px; color: #666; }
                .dato-valor { font-size: 13px; border-bottom: 1px solid #ccc; padding: 2px 0; min-height: 18px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { background: #1a237e; color: white; padding: 8px; text-align: left; font-size: 11px; }
                td { padding: 8px; border-bottom: 1px solid #e0e0e0; font-size: 12px; }
                .total { font-size: 16px; font-weight: bold; text-align: right; padding: 10px; background: #e8eaf6; margin-top: 5px; }
                ul { margin: 5px 0; padding-left: 20px; }
                li { font-size: 13px; padding: 2px 0; }
                .aprobacion-box { background: #f0f2ff; border: 2px solid #c5cae9; border-radius: 8px; padding: 20px; margin: 15px 0; }
                .firmas-section { margin-top: 30px; }
                .firmas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 20px; }
                .firma-item { text-align: center; }
                .firma-nombre { font-size: 16px; font-weight: 700; color: #1a237e; padding: 5px 0; }
                .firma-linea { border-top: 1px solid #333; width: 100%; margin-top: 30px; }
                .firma-cargo { font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
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
            
            <div class="aprobacion-box">
                <h2>📌 DATOS DE APROBACIÓN</h2>
                <div class="datos">
                    <div><span class="dato-label">Organización:</span> <span class="dato-valor">${datos.organizacion}</span></div>
                    <div><span class="dato-label">Fecha:</span> <span class="dato-valor">${datos.fecha}</span></div>
                    <div><span class="dato-label">Solicitante:</span> <span class="dato-valor">${datos.solicitante}</span></div>
                    <div><span class="dato-label">Obispo / Presidente:</span> <span class="dato-valor">${datos.obispo}</span></div>
                </div>
            </div>
            
            <div class="datos">
                <div><span class="dato-label">Estaca:</span> <span class="dato-valor">${datos.estaca}</span></div>
                <div><span class="dato-label">Barrio:</span> <span class="dato-valor">${datos.barrio}</span></div>
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
            
            <div class="firmas-section">
                <h2>✍️ APROBACIONES</h2>
                <div class="firmas-grid">
                    <div class="firma-item">
                        <div class="firma-nombre">${datos.solicitante}</div>
                        <div class="firma-linea"></div>
                        <div class="firma-cargo">Solicitante</div>
                    </div>
                    <div class="firma-item">
                        <div class="firma-nombre">${datos.obispo}</div>
                        <div class="firma-linea"></div>
                        <div class="firma-cargo">Obispo / Presidente</div>
                    </div>
                </div>
            </div>
            
            <p style="text-align:center;color:#999;font-size:10px;margin-top:30px;">Generado: ${new Date().toLocaleDateString()}</p>
        </body>
        </html>
    `);
    
    ventana.document.close();
    console.log('✅ PDF generado correctamente');
}