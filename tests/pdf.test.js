'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createPdfBlob } = require('../assets/js/pdf.js');

test('creates a downloadable PDF with a correct cross-reference offset', async () => {
    const blob = createPdfBlob(['PLAN DE ACTIVIDAD', 'Actividad de prueba']);
    const pdf = await blob.text();

    assert.equal(blob.type, 'application/pdf');
    assert.ok(pdf.startsWith('%PDF-1.4\n'));
    assert.ok(pdf.endsWith('%%EOF'));

    const offset = Number(pdf.match(/startxref\n(\d+)\n%%EOF$/)[1]);
    assert.equal(pdf.slice(offset, offset + 4), 'xref');
    assert.match(pdf, /\/Count 1/);
});

test('preserves Spanish accents, escapes PDF delimiters, and paginates long reports', async () => {
    const lines = [
        'Titulo',
        'Subtitulo',
        'Texto (con) barras \\ y acentos acci\u00f3n',
        ...Array.from({ length: 80 }, (_, index) => `Linea ${index + 1} con suficiente contenido para probar la paginacion.`)
    ];
    const pdf = await createPdfBlob(lines).text();

    assert.ok(pdf.includes('Texto \\(con\\) barras \\\\ y acentos acci\\363n'));
    assert.match(pdf, /\/Count [2-9]\d*/);
    assert.match(pdf, /\/BaseFont \/Times-Bold/);
});

test('renders structured report sections and budget tables', async () => {
    const pdf = await createPdfBlob([
        'Plan de actividad',
        'La Iglesia de Jesucristo de los Santos de los Últimos Días',
        '',
        'Datos generales',
        'Estaca: Estaca de prueba',
        'Fecha: 23/11/2026',
        '',
        'Plan de presupuesto',
        'Cantidad | Descripción | Importe',
        '2 | Refrigerios | Bs. 30.00',
        'TOTAL: Bs. 30.00'
    ]).text();

    assert.match(pdf, /\/Count 1/);
    assert.match(pdf, /Cantidad/);
    assert.match(pdf, /Bs\. 30\.00/);
    assert.match(pdf, /0\.000 0\.380 0\.518 rg/);
});

test('repeats budget table headers when a report spans pages', async () => {
    const pdf = await createPdfBlob([
        'Plan de actividad',
        'La Iglesia',
        'Plan de presupuesto',
        'Cantidad | Descripción | Importe',
        ...Array.from({ length: 60 }, (_, index) => `${index + 1} | Material ${index + 1} | Bs. 10.00`)
    ]).text();

    assert.match(pdf, /\/Count [2-9]\d*/);
    assert.ok((pdf.match(/Cantidad/g) || []).length >= 2);
});

test('rejects invalid PDF input instead of producing an empty document', () => {
    assert.throws(() => createPdfBlob('texto'), TypeError);
    assert.throws(() => createPdfBlob(['valido', null]), TypeError);
});
