(function (root, factory) {
    const pdfTools = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = pdfTools;
    } else {
        root.PdfTools = pdfTools;
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const PAGE_WIDTH = 612;
    const PAGE_HEIGHT = 792;
    const MARGIN = 48;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const FOOTER_LIMIT = 54;
    const COLORS = {
        blue: [0, 0.38, 0.518],
        blueLight: [0.918, 0.961, 0.973],
        text: [0.129, 0.133, 0.145],
        secondary: [0.325, 0.341, 0.357],
        border: [0.816, 0.827, 0.827],
        row: [0.969, 0.973, 0.973],
        white: [1, 1, 1]
    };

    const SECTION_HEADINGS = new Set([
        'DATOS GENERALES',
        'DATOS DE LA ACTIVIDAD',
        'PROPOSITO SAGRADO',
        'METAS',
        'PARTICIPACION Y RESPONSABLES',
        'PLAN DE PRESUPUESTO',
        'GASTOS ACTUALES'
    ]);
    const FIELD_LABELS = new Set([
        'ESTACA',
        'BARRIO',
        'ORGANIZACION',
        'FECHA',
        'ASISTENTES ESTIMADOS',
        'RESPONSABLES',
        'LIMPIEZA CAPILLA',
        'SOLICITANTE',
        'OBISPO / PRESIDENTE',
        'ASISTENTES',
        'PAGADO A',
        'REFERENCIA',
        'MONTO RECIBIDO'
    ]);

    function cleanText(text) {
        return String(text).replace(/\s+/g, ' ').trim();
    }

    function normalizeHeading(text) {
        return cleanText(text)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    }

    function pdfLiteral(text) {
        let escaped = '';
        for (const character of String(text).normalize('NFC')) {
            const codePoint = character.codePointAt(0);
            if (character === '\\') escaped += '\\\\';
            else if (character === '(') escaped += '\\(';
            else if (character === ')') escaped += '\\)';
            else if (codePoint >= 32 && codePoint <= 126) escaped += character;
            else if (codePoint >= 160 && codePoint <= 255) {
                escaped += `\\${codePoint.toString(8).padStart(3, '0')}`;
            } else if (codePoint === 0x2013 || codePoint === 0x2014) escaped += '-';
            else if (codePoint === 0x2018 || codePoint === 0x2019) escaped += "'";
            else if (codePoint === 0x201c || codePoint === 0x201d) escaped += '"';
            else if (codePoint === 0x2026) escaped += '...';
            else if (/\s/.test(character)) escaped += ' ';
            else escaped += '?';
        }
        return `(${escaped})`;
    }

    function wrapLine(line, maxLength) {
        const words = cleanText(line).split(/\s+/);
        const result = [];
        let current = '';

        words.forEach(word => {
            while (word.length > maxLength) {
                if (current) {
                    result.push(current);
                    current = '';
                }
                result.push(word.slice(0, maxLength));
                word = word.slice(maxLength);
            }
            if (!word) return;
            if (current && `${current} ${word}`.length > maxLength) {
                result.push(current);
                current = word;
            } else {
                current = current ? `${current} ${word}` : word;
            }
        });

        if (current) result.push(current);
        return result;
    }

    function colorValue(color) {
        return color.map(channel => channel.toFixed(3)).join(' ');
    }

    function drawText(content, text, x, y, size, font, color) {
        content.push(
            `BT /${font} ${size} Tf ${colorValue(color)} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfLiteral(text)} Tj ET`
        );
    }

    function fillRect(content, x, y, width, height, color) {
        content.push(`${colorValue(color)} rg ${x} ${y} ${width} ${height} re f`);
    }

    function strokeRect(content, x, y, width, height, color) {
        content.push(`${colorValue(color)} RG 0.6 w ${x} ${y} ${width} ${height} re S`);
    }

    function drawRule(content, x1, y1, x2, y2, color) {
        content.push(`${colorValue(color)} RG 0.6 w ${x1} ${y1} m ${x2} ${y2} l S`);
    }

    function characterCapacity(width, fontSize) {
        return Math.max(12, Math.floor(width / (fontSize * 0.52)));
    }

    function splitField(line) {
        const match = cleanText(line).match(/^([^:]{1,60}):\s*(.*)$/);
        if (!match || !FIELD_LABELS.has(normalizeHeading(match[1]))) return null;
        return { label: match[1], value: match[2] };
    }

    function getTableType(line) {
        const heading = normalizeHeading(line);
        if (heading === 'CANTIDAD | DESCRIPCION | IMPORTE') return 'budget';
        if (heading === 'COMPROBANTE | CONCEPTO | FECHA | PROVEEDOR | MONTO') return 'expenses';
        return null;
    }

    function createPdfBlob(lines) {
        if (!Array.isArray(lines) || lines.some(line => line === null || line === undefined)) {
            throw new TypeError('PDF content must be an array of text lines.');
        }

        const title = cleanText(lines[0] || 'Planilla de actividad');
        const subtitle = cleanText(lines[1] || '');
        const body = lines.slice(2);
        const pages = [];
        let content = [];
        let y = 0;
        let currentTable = null;
        let rowIndex = 0;

        function drawTableHeader(table) {
            const config = table === 'budget'
                ? { labels: ['Cantidad', 'Descripcion', 'Importe'], widths: [64, 340, 112] }
                : { labels: ['Comprobante', 'Concepto', 'Fecha', 'Proveedor', 'Monto'], widths: [82, 130, 67, 143, 94] };
            const top = y;
            fillRect(content, MARGIN, top - 23, CONTENT_WIDTH, 23, COLORS.blue);
            let x = MARGIN;
            config.labels.forEach((label, index) => {
                drawText(content, label, x + 6, top - 15, 7.5, 'F2', COLORS.white);
                x += config.widths[index];
            });
            y -= 23;
        }

        function startPage() {
            content = [];
            pages.push(content);

            if (pages.length === 1) {
                drawText(content, title, MARGIN, 748, 20, 'F4', COLORS.text);
                if (subtitle) drawText(content, subtitle, MARGIN, 728, 9, 'F1', COLORS.secondary);
                drawRule(content, MARGIN, 712, PAGE_WIDTH - MARGIN, 712, COLORS.blue);
                fillRect(content, MARGIN, 708, 42, 3, COLORS.blue);
                y = 690;
            } else {
                drawText(content, title, MARGIN, 750, 11, 'F4', COLORS.text);
                drawText(content, 'Continuacion', MARGIN, 735, 8, 'F1', COLORS.secondary);
                drawRule(content, MARGIN, 722, PAGE_WIDTH - MARGIN, 722, COLORS.blue);
                y = 701;
            }

            if (currentTable) drawTableHeader(currentTable);
        }

        function ensureSpace(height) {
            if (y - height >= FOOTER_LIMIT) return;
            startPage();
        }

        function drawSection(heading) {
            const height = 22;
            ensureSpace(height + 8);
            fillRect(content, MARGIN, y - height, CONTENT_WIDTH, height, COLORS.blueLight);
            fillRect(content, MARGIN, y - height, 3, height, COLORS.blue);
            drawText(content, heading, MARGIN + 11, y - 15, 10.5, 'F4', COLORS.text);
            y -= height + 8;
        }

        function drawFields(fields) {
            const gap = 10;
            const width = (CONTENT_WIDTH - gap) / 2;

            for (let index = 0; index < fields.length; index += 2) {
                const pair = fields.slice(index, index + 2);
                const wrapped = pair.map(field => wrapLine(field.value, characterCapacity(width - 16, 9)));
                const valueLineCount = Math.max(1, ...wrapped.map(value => value.length));
                const height = Math.max(35, 25 + valueLineCount * 10);
                ensureSpace(height + 5);

                pair.forEach((field, column) => {
                    const x = MARGIN + column * (width + gap);
                    fillRect(content, x, y - height, width, height, COLORS.white);
                    strokeRect(content, x, y - height, width, height, COLORS.border);
                    drawText(content, field.label, x + 8, y - 11, 7.5, 'F2', COLORS.secondary);
                    wrapped[column].forEach((valueLine, lineIndex) => {
                        drawText(content, valueLine, x + 8, y - 23 - lineIndex * 10, 9, 'F1', COLORS.text);
                    });
                });

                y -= height + 5;
            }
        }

        function drawParagraph(line) {
            const text = cleanText(line);
            const isBullet = text.startsWith('- ');
            const x = isBullet ? MARGIN + 12 : MARGIN;
            const fontSize = 9.5;
            const wrapped = wrapLine(isBullet ? text.slice(2) : text, characterCapacity(CONTENT_WIDTH - (x - MARGIN), fontSize));
            const lineHeight = 13;
            ensureSpace(wrapped.length * lineHeight + 4);
            if (isBullet) drawText(content, '-', MARGIN + 2, y - 10, fontSize, 'F2', COLORS.blue);
            wrapped.forEach((textLine, index) => {
                drawText(content, textLine, x, y - 10 - index * lineHeight, fontSize, 'F1', COLORS.text);
            });
            y -= wrapped.length * lineHeight + 4;
        }

        function drawTableRow(line, table) {
            const widths = table === 'budget'
                ? [64, 340, 112]
                : [82, 130, 67, 143, 94];
            const cells = line.split('|').map(cleanText);
            if (cells.length !== widths.length) {
                currentTable = null;
                drawParagraph(line);
                return;
            }

            const fontSize = 8.5;
            const wrapped = cells.map((cell, index) =>
                wrapLine(cell, characterCapacity(widths[index] - 12, fontSize))
            );
            const lineCount = Math.max(1, ...wrapped.map(cell => cell.length));
            const height = Math.max(22, lineCount * 10 + 8);
            ensureSpace(height);

            if (rowIndex % 2 === 1) fillRect(content, MARGIN, y - height, CONTENT_WIDTH, height, COLORS.row);
            drawRule(content, MARGIN, y - height, PAGE_WIDTH - MARGIN, y - height, COLORS.border);

            let x = MARGIN;
            wrapped.forEach((cellLines, index) => {
                cellLines.forEach((cellLine, lineIndex) => {
                    drawText(content, cellLine, x + 6, y - 13 - lineIndex * 10, fontSize, 'F1', COLORS.text);
                });
                x += widths[index];
            });

            y -= height;
            rowIndex++;
        }

        function drawTotal(line) {
            const height = 25;
            ensureSpace(height + 4);
            fillRect(content, MARGIN, y - height, CONTENT_WIDTH, height, COLORS.blueLight);
            fillRect(content, MARGIN, y - height, 3, height, COLORS.blue);
            drawText(content, line, MARGIN + 11, y - 16, 10, 'F2', COLORS.blue);
            y -= height + 6;
        }

        startPage();

        for (let index = 0; index < body.length;) {
            const rawLine = String(body[index]);
            const line = cleanText(rawLine);

            if (!line) {
                currentTable = null;
                y -= 5;
                index++;
                continue;
            }

            const tableType = getTableType(line);
            if (tableType) {
                ensureSpace(25);
                currentTable = tableType;
                rowIndex = 0;
                drawTableHeader(currentTable);
                index++;
                continue;
            }

            if (SECTION_HEADINGS.has(normalizeHeading(line))) {
                currentTable = null;
                rowIndex = 0;
                drawSection(line);
                index++;
                continue;
            }

            if (/^TOTAL(?:\s|:)/i.test(line)) {
                currentTable = null;
                drawTotal(line);
                index++;
                continue;
            }

            if (currentTable && line.includes('|')) {
                drawTableRow(line, currentTable);
                index++;
                continue;
            }

            currentTable = null;
            const firstField = splitField(line);
            if (firstField) {
                const fields = [firstField];
                let nextIndex = index + 1;
                while (nextIndex < body.length) {
                    const nextLine = cleanText(body[nextIndex]);
                    if (!nextLine || SECTION_HEADINGS.has(normalizeHeading(nextLine)) || getTableType(nextLine) ||
                        /^TOTAL(?:\s|:)/i.test(nextLine)) break;
                    const field = splitField(nextLine);
                    if (!field) break;
                    fields.push(field);
                    nextIndex++;
                }
                drawFields(fields);
                index = nextIndex;
                continue;
            }

            drawParagraph(line);
            index++;
        }

        pages.forEach((page, index) => {
            drawRule(page, MARGIN, 42, PAGE_WIDTH - MARGIN, 42, COLORS.border);
            drawText(page, `Pagina ${index + 1} de ${pages.length}`, PAGE_WIDTH - MARGIN - 75, 26, 8, 'F1', COLORS.secondary);
        });

        const objects = new Map([
            [1, '<< /Type /Catalog /Pages 2 0 R >>'],
            [3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'],
            [4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'],
            [5, '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>']
        ]);
        const pageIds = [];
        let nextId = 6;

        pages.forEach(page => {
            const pageId = nextId++;
            const contentId = nextId++;
            pageIds.push(pageId);

            const stream = page.join('\n');
            objects.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
            objects.set(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F4 5 0 R >> >> /Contents ${contentId} 0 R >>`);
        });
        objects.set(2, `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);

        let pdf = '%PDF-1.4\n';
        const offsets = [0];
        [...objects.keys()].sort((a, b) => a - b).forEach(id => {
            offsets[id] = pdf.length;
            pdf += `${id} 0 obj\n${objects.get(id)}\nendobj\n`;
        });

        const xrefOffset = pdf.length;
        const ids = [...objects.keys()].sort((a, b) => a - b);
        pdf += `xref\n0 ${ids.length + 1}\n0000000000 65535 f \n`;
        ids.forEach(id => {
            pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
        });
        pdf += `trailer\n<< /Size ${ids.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

        return new Blob([pdf], { type: 'application/pdf' });
    }

    return { createPdfBlob };
}));
