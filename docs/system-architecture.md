# System Architecture

Notibar is a **three-tier** WordPress plugin:

1. **Backend (PHP)** — data model, REST API, sanitization, migrations, i18n bridges
2. **Admin UI (React)** — Customizer panel, settings page, analytics dashboard (built with `@wordpress/scripts`)
3. **Frontend (Vanilla JS)** — render, filtering, rotation, dismissal, tracking beacon

In steady state data flows one direction (`wp_options` → JSON → inlined boot data → DOM); the Customizer adds bidirectional live-preview sync during editing. One codebase ships as Lite or Pro via build-time stripping.

This document is split for readability. See:

| Section | Contents |
|---------|----------|
| **[Bootstrap & Data Model](./architecture/bootstrap-and-data-model.md)** | Plugin load sequence, hook priorities, `wp_options` storage, bar/global/tracking schemas, migrations & uninstall |
| **[REST API & Customizer](./architecture/rest-api-and-customizer.md)** | `notibar/v1` endpoints, Customizer panel/settings/transport, the React control mount, live preview |
| **[Frontend Render Pipeline](./architecture/frontend-pipeline.md)** | 7-phase client render: context → init → render → interaction → rotation → body push → theme compat |
| **[Tracking & i18n](./architecture/tracking-and-i18n.md)** | Event capture/transport, EventCounter vs EventLog, cron pruning, analytics charts, WPML/Polylang bridges |
| **[Edition System](./architecture/edition-system.md)** | Pro vs Lite flag, `strip-pro.js` build, runtime behavior |
| **[Diagrams & Cross-Cutting](./architecture/diagrams-and-cross-cutting.md)** | Mermaid diagrams (architecture, bootstrap, data flow), performance characteristics, security |

## Key Components at a Glance

- **Bootstrap**: `njt-notification-bar.php` (PSR-4 autoloader, `NjtNotificationBar\` namespace) → migrations at `plugins_loaded` pri 5, core init at pri 10.
- **Data**: `njt_nofi_bars` + `njt_nofi_global` JSON options. Pro tracking adds `notibar_counters` option + `{prefix}notibar_events` table.
- **Bar load pipeline**: Merge native + 3rd-party bars at `NotificationBarHandle::maybeRender()`. Registry calls `njt_nofi_register_bar()` helper (from `bar-registry-api.php`) and `njt_nofi_register_bars` filter (additive-only, seeded empty). Native bars never exposed; on id collision native wins. Injected bars render after native.
- **Render gate**: `NotificationBarHandle` (frontend) + `NotificationBarHandleAdmin` trait (menu); shared render logic in `src/shared/`.
- **Rotation nav** (Pro): Arrows injected post-render by `nav-controls.js` when displayMode=rotation, global rotationShowArrows=true, and ≥2 surviving bars. Supports click + keyboard (ArrowLeft/Right).
- **Editions**: `NJT_NOFI_IS_PRO` constant; Lite produced by `build-tools/strip-pro.js` + `pro-manifest.json`.

## Related Docs

- **[../README.md](../README.md)** — User & developer overview
- **[project-overview-pdr.md](./project-overview-pdr.md)** — Product definition & requirements
- **[codebase-summary.md](./codebase-summary.md)** — File organization
- **[code-standards.md](./code-standards.md)** — Code conventions
- **[project-roadmap.md](./project-roadmap.md)** — State, stubs, future directions
