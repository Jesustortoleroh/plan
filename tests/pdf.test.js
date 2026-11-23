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

test('escapes PDF string delimiters and creates extra pages for long reports', async () => {
    const lines = Array.from({ length: 49 }, (_, index) => `Linea ${index + 1}`);
    lines[0] = 'Texto (con) barras \\ y acentos: acción';
    const pdf = await createPdfBlob(lines).text();

    assert.ok(pdf.includes('Texto \\(con\\) barras \\\\ y acentos: accion'));
    assert.match(pdf, /\/Count 2/);
});

test('rejects invalid PDF input instead of producing an empty document', () => {
    assert.throws(() => createPdfBlob('texto'), TypeError);
    assert.throws(() => createPdfBlob(['valido', null]), TypeError);
});
