# src/shared/

Shared modules imported by more than one bundle (`customizer-app`, `customizer-preview`, `frontend`, `settings-app`).

Both vanilla utilities AND React components live here. Examples:
- `filter-bars.js` — pure bar-filter logic (customizer-preview + frontend)
- `render-bar.js` — DOM render helpers (preview + frontend)
- `escape-utils.js` — XSS-safe escaping primitives (render layers)
- `TrackingPane.jsx` — admin tracking readout (settings-app; was customizer-app pre-v3.1)

Rules:
- Do NOT put WordPress-specific globals here that are only available in one context (e.g. `wp.customize`).
- JSX components are welcome here when they need to be shared between bundles. Use the existing `.jsx` extension; `wp-scripts` resolves it for all entries.
