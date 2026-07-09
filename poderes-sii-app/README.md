# Gestión Documental · Poderes SII (prototipo)

Prototipo navegable del módulo "Gestión Documental" propuesto para la plataforma
de Sur Consulting, con foco en la sección "Poderes SII". Es un prototipo de
presentación/aprobación, no la integración final: usa datos simulados
(clientes, mandatarios de Sur Consulting, catálogo de comunas de Chile) en
lugar de las fuentes reales (CRM / Centro de Comandos, base de trabajadores).

## Cómo correrlo

```bash
npm install
npm run dev      # entorno de desarrollo con hot-reload
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción localmente
```

Todo el estado (poderes generados, versiones, registro interno) se guarda en
`localStorage` del navegador, así que persiste entre recargas pero es local a
cada máquina/navegador. Hay un botón "Restablecer datos de ejemplo" en
Poderes Generados para volver al estado inicial.

## Estructura

- `src/data/` — catálogos simulados: clientes (CRM), mandatarios de Sur
  Consulting, comunas/ciudades de Chile.
- `src/utils/documentModel.js` — la matriz del documento (Poder SII). Aislada
  a propósito para poder reemplazarla o editarla sin tocar el resto de la app.
- `src/utils/pdf.js` — generador de PDF real, sin dependencias externas.
- `src/store/PoderesStoreContext.jsx` — estado de "Poderes Generados":
  versionado, detección de duplicados y eliminación lógica (soft delete).
  Cada cliente puede tener **una línea de poder por tipo de mandante**:
  una para la empresa (persona jurídica) y una independiente por cada
  persona natural mandante — no se pisan entre sí.
- `src/pages/wizard/` — el formulario guiado de 6 pasos para generar un poder.
- `src/pages/PoderesGenerados.jsx` — listado por cliente, con historial de
  versiones y registro interno de trazabilidad (advertencias aceptadas/
  rechazadas y eliminaciones).

## Puesta en producción / integración

No requiere backend: todo corre en el navegador. Para integrarlo a la
plataforma real, lo esperable es reemplazar `src/data/*` por llamadas reales
al CRM / Centro de Comandos y a la base de trabajadores, y `PoderesStoreContext`
por una API en lugar de `localStorage`.
