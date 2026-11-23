'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const WorkflowTools = require('../assets/js/workflow.js');

test('copies plan details into empty rendition fields without replacing entered values', () => {
    const plan = {
        estaca: 'Estaca Norte',
        barrio: 'Barrio Centro',
        organizacion: 'Primaria',
        fecha: '2026-11-23',
        asistentes: '25'
    };
    const current = {
        estaca: '',
        barrio: 'Barrio ingresado',
        organizacion: '',
        fecha: '',
        asistentes: '12'
    };

    assert.deepEqual(WorkflowTools.copyPlanToRendition(plan, current, false), {
        estaca: 'Estaca Norte',
        barrio: 'Barrio ingresado',
        organizacion: 'Primaria',
        fecha: '2026-11-23',
        asistentes: '12'
    });
    assert.equal(current.estaca, '');
    assert.equal(
        WorkflowTools.copyPlanToRendition(plan, current, true).barrio,
        'Barrio Centro'
    );
    assert.equal(
        WorkflowTools.copyPlanToRendition(plan, { asistentes: '' }, false).asistentes,
        ''
    );
});

test('validates a zero-spend rendition and ignores the empty starter expense row', () => {
    const errors = WorkflowTools.validateRendition({
        estaca: 'Estaca Norte',
        barrio: 'Barrio Centro',
        organizacion: 'Primaria',
        fecha: '2026-11-23',
        asistentes: '0',
        monto: '0,00',
        gastos: [{ comprobante: '', concepto: '', fecha: '', proveedor: '', monto: '0.00' }]
    });

    assert.deepEqual(errors, []);
});

test('reports missing fields, malformed amounts, and incomplete expense rows', () => {
    const errors = WorkflowTools.validateRendition({
        estaca: '',
        barrio: 'Barrio Centro',
        organizacion: 'Primaria',
        fecha: '2026-02-30',
        asistentes: '1.5',
        monto: '1,2,3',
        gastos: [{ comprobante: '', concepto: '', fecha: '', proveedor: '', monto: '5.00' }]
    });

    assert.deepEqual(errors.map(error => error.field), [
        'estaca',
        'fecha',
        'asistentes',
        'monto',
        'gastos.0.concepto'
    ]);
});

test('requires a positive amount when a rendition expense has a concept', () => {
    const errors = WorkflowTools.validateRendition({
        estaca: 'Estaca Norte',
        barrio: 'Barrio Centro',
        organizacion: 'Primaria',
        fecha: '2026-11-23',
        asistentes: '4',
        monto: '10.00',
        gastos: [{ comprobante: '', concepto: 'Transporte', fecha: '', proveedor: '', monto: '0.00' }]
    });

    assert.deepEqual(errors.map(error => error.field), ['gastos.0.monto']);
});

test('parses valid comma and dot decimals but rejects negative and malformed amounts', () => {
    assert.equal(WorkflowTools.parseMoney('.5'), 0.5);
    assert.equal(WorkflowTools.parseMoney(',5'), 0.5);
    assert.equal(WorkflowTools.parseMoney('12,30'), 12.3);
    assert.equal(WorkflowTools.parseMoney('-12.30'), null);
    assert.equal(WorkflowTools.parseMoney('12.345'), null);
});

test('validates completed plan budget rows and ignores the empty starter row', () => {
    const errors = WorkflowTools.validatePlanBudget([
        { cantidad: '', descripcion: '', importe: '0.00' },
        { cantidad: '', descripcion: 'Uso del salón', importe: '0.00' },
        { cantidad: '0', descripcion: 'Agua', importe: '-2.00' },
        { cantidad: '1.5', descripcion: '', importe: 'inválido' }
    ]);

    assert.deepEqual(errors.map(error => error.field), [
        'presupuesto.2.cantidad',
        'presupuesto.2.importe',
        'presupuesto.3.descripcion',
        'presupuesto.3.cantidad',
        'presupuesto.3.importe'
    ]);
});

test('calculates remaining balance and flags budget overruns to the cent', () => {
    assert.deepEqual(WorkflowTools.compareBudget('100.00', '65.25'), {
        approved: 100,
        actual: 65.25,
        balance: 34.75,
        overBudget: false
    });
    assert.deepEqual(WorkflowTools.compareBudget(100, 120.5), {
        approved: 100,
        actual: 120.5,
        balance: -20.5,
        overBudget: true
    });
});

test('round-trips an explicit draft and rejects malformed or incompatible files', () => {
    const draft = WorkflowTools.createDraft(
        {
            estaca: 'Estaca Norte',
            metas: ['Fortalecer la fe'],
            presupuesto: [{ cantidad: '2', descripcion: 'Refrigerios', importe: '25.00' }]
        },
        {
            barrio: 'Barrio Centro',
            gastos: [{ comprobante: 'F-01', concepto: 'Agua', fecha: '2026-11-23', proveedor: 'Tienda', monto: '4.50' }]
        },
        true
    );

    assert.equal(draft.plan.estaca, 'Estaca Norte');
    assert.equal(draft.rendicion.barrio, 'Barrio Centro');
    assert.equal(draft.rendicion.gastos[0].concepto, 'Agua');
    assert.deepEqual(WorkflowTools.parseDraft(WorkflowTools.serializeDraft(draft)), draft);
    assert.throws(() => WorkflowTools.parseDraft('{'), /JSON válido/);
    assert.throws(() => WorkflowTools.parseDraft('x'.repeat(WorkflowTools.MAX_DRAFT_CHARS + 1)), /tamaño permitido/);
    assert.throws(() => WorkflowTools.parseDraft(JSON.stringify({
        format: 'sistema-actividades-draft',
        version: 99,
        planLinked: false
    })), /versión.*compatible/);
});

test('rejects invalid dates and excessive rows in imported drafts', () => {
    const draft = WorkflowTools.createDraft({}, {}, false);
    draft.plan.fecha = '2026-02-30';
    assert.throws(() => WorkflowTools.serializeDraft(draft), /fecha.*no es válida/);

    const oversizedList = WorkflowTools.createDraft({}, {}, false);
    oversizedList.rendicion.gastos = Array.from({ length: 101 }, () => ({
        comprobante: '',
        concepto: '',
        fecha: '',
        proveedor: '',
        monto: ''
    }));
    assert.throws(() => WorkflowTools.serializeDraft(oversizedList), /lista gastos no es válida/);
});
