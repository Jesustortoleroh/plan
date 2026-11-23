(function (root, factory) {
    const pdfTools = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = pdfTools;
    } else {
        root.PdfTools = pdfTools;
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function normalizeText(text) {
        return String(text)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\x20-\x7E]/g, '-')
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }

    function wrapLine(line, maxLength) {
        const words = String(line).split(/\s+/);
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

        result.push(current);
        return result;
    }

    function createPdfBlob(lines) {
        if (!Array.isArray(lines) || lines.some(line => line === null || line === undefined)) {
            throw new TypeError('PDF content must be an array of text lines.');
        }

        const wrappedLines = lines.flatMap(line => wrapLine(line, 100));
        const pages = [];
        for (let i = 0; i < wrappedLines.length; i += 48) {
            pages.push(wrappedLines.slice(i, i + 48));
        }
        if (!pages.length) pages.push(['']);

        const objects = new Map([
            [1, '<< /Type /Catalog /Pages 2 0 R >>'],
            [3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>']
        ]);
        const pageIds = [];
        let nextId = 4;

        pages.forEach(page => {
            const pageId = nextId++;
            const contentId = nextId++;
            pageIds.push(pageId);

            const content = page.map((line, index) =>
                `BT /F1 10 Tf 40 ${790 - index * 14} Td (${normalizeText(line.trim())}) Tj ET`
            ).join('\n');
            objects.set(contentId, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
            objects.set(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
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
