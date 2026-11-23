# Plan de Actividad y Rendición de Cuentas

**La Iglesia de Jesucristo de los Santos de los Últimos Días**

La interfaz usa una paleta neutra con azul de acento y una presentación tipográfica sobria, inspiradas en el sitio público de la Iglesia. No utiliza logotipos oficiales ni pretende ser una herramienta oficial.

---


## ✨ Funciones

- 🧾 Plan y rendición en secciones separadas, accesibles desde el menú principal
- 📋 Plan de Actividad con presupuesto
- 💰 Rendición de Cuentas con gastos
- 🔗 Vincula la rendición con el plan, reutilizando los datos generales sin reemplazar los que ya ingresaste
- 📊 Compara el presupuesto aprobado con los gastos y muestra saldo o exceso
- 📄 Descargar las planillas como PDF
- 🟢 Compartir el PDF por WhatsApp desde dispositivos compatibles
- 🖨️ Imprimir la planilla directamente
- ✅ Valida los campos de la rendición antes de descargar, compartir o imprimir
- 💾 Guarda y abre borradores JSON de forma explícita; no hay guardado automático
- 🎨 Los botones de PDF, WhatsApp e impresión mantienen el mismo estilo y orden en ambas secciones
- Los PDF de descarga y WhatsApp incluyen secciones, campos y tablas estructuradas
- 🛡️ Los borradores permanecen en archivos del dispositivo y no se envían a un servidor
- 📱 Funciona en celular

---

## 💻 Tecnologías

HTML | CSS | JavaScript | Node.js (pruebas)

---

## 📁 Archivos

```text
index.html
assets/
├── css/style.css
└── js/
    ├── app.js
    ├── pdf.js
    └── workflow.js
tests/
├── pdf.test.js
└── workflow.test.js
package.json
README.md
```

## 🧪 Pruebas

Instala Node.js y ejecuta:

```bash
npm test
```


---

## 📄 Licencia

Uso libre institucional
