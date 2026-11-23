(function (root, factory) {
    const workflowTools = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = workflowTools;
    } else {
        root.WorkflowTools = workflowTools;
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const DRAFT_FORMAT = 'sistema-actividades-draft';
    const DRAFT_VERSION = 1;
    const MAX_DRAFT_CHARS = 1000000;
    const MAX_ROWS = 100;

    function isRecord(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    function toText(value, field, maxLength) {
        if (value === undefined) return '';
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new TypeError(`El campo ${field} no es válido.`);
        }
        const text = String(value);
        if (text.length > maxLength) throw new RangeError(`El campo ${field} es demasiado largo.`);
        return text;
    }

    function isValidDate(value) {
        if (!value) return true;
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return false;
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    function normalizeDate(value, field) {
        const date = toText(value, field, 10);
        if (!isValidDate(date)) throw new TypeError(`La fecha de ${field} no es válida.`);
        return date;
    }

    function normalizeRows(value, section, fields) {
        if (value === undefined) return [];
        if (!Array.isArray(value) || value.length > MAX_ROWS) {
            throw new TypeError(`La lista ${section} no es válida.`);
        }
        return value.map((row, index) => {
            if (!isRecord(row)) throw new TypeError(`El registro ${index + 1} de ${section} no es válido.`);
            const result = {};
            fields.forEach(([field, maxLength]) => {
                result[field] = field === 'fecha'
                    ? normalizeDate(row[field], `${section} ${index + 1}`)
                    : toText(row[field], `${section} ${index + 1}`, maxLength);
            });
            return result;
        });
    }

    function normalizeSection(value, section) {
        if (value === undefined) value = {};
        if (!isRecord(value)) throw new TypeError(`La sección ${section} no es válida.`);

        if (section === 'plan') {
            const metas = value.metas === undefined ? [] : value.metas;
            if (!Array.isArray(metas) || metas.length > 60) throw new TypeError('La lista de metas no es válida.');
            return {
                estaca: toText(value.estaca, 'estaca', 100),
                organizacion: toText(value.organizacion, 'organización', 100),
                barrio: toText(value.barrio, 'barrio', 100),
                fecha: normalizeDate(value.fecha, 'actividad'),
                proposito: toText(value.proposito, 'propósito', 500),
                metas: metas.map((meta, index) => toText(meta, `meta ${index + 1}`, 100)),
                asistentes: toText(value.asistentes, 'asistentes estimados', 4),
                responsables: toText(value.responsables, 'responsables', 200),
                limpieza: toText(value.limpieza, 'responsables de limpieza', 200),
                solicitante: toText(value.solicitante, 'solicitante', 100),
                obispo: toText(value.obispo, 'obispo o presidente', 100),
                presupuesto: normalizeRows(value.presupuesto, 'presupuesto', [
                    ['cantidad', 4],
                    ['descripcion', 200],
                    ['importe', 20]
                ])
            };
        }

        return {
            estaca: toText(value.estaca, 'estaca', 100),
            barrio: toText(value.barrio, 'barrio', 100),
            organizacion: toText(value.organizacion, 'organización', 100),
            fecha: normalizeDate(value.fecha, 'rendicion'),
            asistentes: toText(value.asistentes, 'asistentes', 4),
            pagadoA: toText(value.pagadoA, 'pagado a', 100),
            cheque: toText(value.cheque, 'referencia', 50),
            monto: toText(value.monto, 'monto recibido', 20),
            gastos: normalizeRows(value.gastos, 'gastos', [
                ['comprobante', 50],
                ['concepto', 200],
                ['fecha', 10],
                ['proveedor', 100],
                ['monto', 20]
            ])
        };
    }

    function normalizeDraft(value) {
        if (!isRecord(value) || value.format !== DRAFT_FORMAT) {
            throw new TypeError('El archivo no es un borrador de este sistema.');
        }
        if (value.version !== DRAFT_VERSION) {
            throw new TypeError('La versión del borrador no es compatible.');
        }
        if (typeof value.planLinked !== 'boolean') {
            throw new TypeError('El estado de vinculación del borrador no es válido.');
        }
        return {
            format: DRAFT_FORMAT,
            version: DRAFT_VERSION,
            savedAt: toText(value.savedAt, 'fecha de guardado', 40),
            planLinked: value.planLinked,
            plan: normalizeSection(value.plan, 'plan'),
            rendicion: normalizeSection(value.rendicion, 'rendicion')
        };
    }

    function parseMoney(value) {
        if (typeof value === 'number') {
            return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
        }
        const text = String(value === undefined || value === null ? '' : value).trim();
        if (!/^\d+(?:[.,]\d{1,2})?$/.test(text)) return null;
        const amount = Number(text.replace(',', '.'));
        return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : null;
    }

    function copyPlanToRendition(plan, rendition, overwrite) {
        const result = Object.assign({}, rendition);
        ['estaca', 'barrio', 'organizacion', 'fecha'].forEach(field => {
            const value = String(plan[field] === undefined || plan[field] === null ? '' : plan[field]);
            const current = String(result[field] === undefined || result[field] === null ? '' : result[field]);
            if (value.trim() && (overwrite || !current.trim())) result[field] = value;
        });
        return result;
    }

    function compareBudget(approvedValue, actualValue) {
        const approved = parseMoney(approvedValue) || 0;
        const actual = parseMoney(actualValue) || 0;
        const balance = Math.round((approved - actual) * 100) / 100;
        return {
            approved,
            actual,
            balance,
            overBudget: balance < 0
        };
    }

    function validateRendition(data) {
        const errors = [];
        const requiredTextFields = [
            ['estaca', 'Estaca'],
            ['barrio', 'Barrio'],
            ['organizacion', 'Organización'],
            ['fecha', 'Fecha']
        ];

        requiredTextFields.forEach(([field, label]) => {
            if (!String(data[field] || '').trim()) errors.push({ field, message: `El campo ${label} es obligatorio.` });
        });

        if (!isValidDate(String(data.fecha || ''))) {
            errors.push({ field: 'fecha', message: 'La fecha de rendición no es válida.' });
        }

        const attendees = String(data.asistentes === undefined ? '' : data.asistentes).trim();
        if (!/^\d{1,4}$/.test(attendees)) {
            errors.push({ field: 'asistentes', message: 'Ingrese un total de asistentes entre 0 y 9999.' });
        }

        if (parseMoney(data.monto) === null) {
            errors.push({ field: 'monto', message: 'Ingrese un monto recibido válido, sin valores negativos.' });
        }

        (Array.isArray(data.gastos) ? data.gastos : []).forEach((gasto, index) => {
            const rawAmount = String(gasto.monto === undefined ? '' : gasto.monto).trim();
            const parsedAmount = parseMoney(rawAmount);
            const hasData = [gasto.comprobante, gasto.concepto, gasto.fecha, gasto.proveedor]
                .some(value => String(value || '').trim()) || (rawAmount !== '' && (parsedAmount === null || parsedAmount > 0));
            if (!hasData) return;

            if (!String(gasto.concepto || '').trim()) {
                errors.push({ field: `gastos.${index}.concepto`, message: `Indique el concepto del gasto ${index + 1}.` });
            }
            if (parsedAmount === null || parsedAmount <= 0) {
                errors.push({ field: `gastos.${index}.monto`, message: `Ingrese un monto mayor que cero para el gasto ${index + 1}.` });
            }
            if (gasto.fecha && !isValidDate(String(gasto.fecha))) {
                errors.push({ field: `gastos.${index}.fecha`, message: `La fecha del gasto ${index + 1} no es válida.` });
            }
        });

        return errors;
    }

    function serializeDraft(draft) {
        return JSON.stringify(normalizeDraft(draft), null, 2);
    }

    function parseDraft(serialized) {
        if (typeof serialized !== 'string' || serialized.length > MAX_DRAFT_CHARS) {
            throw new RangeError('El archivo de borrador supera el tamaño permitido.');
        }
        let value;
        try {
            value = JSON.parse(serialized);
        } catch (error) {
            throw new TypeError('El archivo de borrador no contiene JSON válido.');
        }
        return normalizeDraft(value);
    }

    function createDraft(plan, rendition, planLinked) {
        return normalizeDraft({
            format: DRAFT_FORMAT,
            version: DRAFT_VERSION,
            savedAt: new Date().toISOString(),
            planLinked: Boolean(planLinked),
            plan,
            rendicion: rendition
        });
    }

    return {
        MAX_DRAFT_CHARS,
        compareBudget,
        copyPlanToRendition,
        createDraft,
        parseDraft,
        parseMoney,
        serializeDraft,
        validateRendition
    };
}));
