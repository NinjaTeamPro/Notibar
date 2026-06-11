# Project Roadmap

> Grounded in the plugin code and git history. Dates are from commit history; forward-looking items are **candidates, not commitments** — no scheduled releases exist in the repo.

## Current State — v3.1.2

**Status**: Stable. Version constant `NJT_NOFI_VERSION = '3.1.2'` (set 2026-06-01).

Runs on WordPress 4.0–7.0, PHP 5.3.1+. Ships in two editions (Lite / Pro) from one codebase via build-time stripping. See [system-architecture.md](./system-architecture.md) and [project-overview-pdr.md](./project-overview-pdr.md).

---

## Version History (from git)

### v3.1.2 — current (commits through 2026-06-11)

- Pro auto-deactivates Lite when both active (`njt_nofi_kill_lite()`)
- EventLog custom table + time-series analytics API (`/stats/timeseries`, `/stats/by-bar`)
- Full charts dashboard shown in Lite as a locked demo preview
- All-time per-bar comparison table, filter-aware charts, "Today vs Yesterday" range
- shadcn-style CTA button + admin accent recolor (`#3858e9`)
- `theme_mod → wp_options` storage flip (`maybeMigrateThemeModToOption`, multisite fix)
- Export/import via `RestSettingsController`
- Fix: silence Plugin Check `UnescapedDBParameter` on stats reads
- Exclude `.source` from release zips
- Essentials theme compat rewrite (CSS margin approach) — completed 2026-06-11
- Brandy theme compat shim (CSS top override, shared factory) — completed 2026-06-11

### v3.1 line (2026-05-30 → 2026-05-31)

- EventCounter lifetime counters (atomic `JSON_MERGE_PATCH`)
- `TrackingRestController`: `/track` beacon + `/stats/*`
- TrackingCron daily prune with configurable retention (default 90 days)
- Chart.js + react-chartjs-2 dashboard (lazy-loaded, Pro)
- Dismiss-migration-notice fix

### Lite build variant (2026-05-26 → 2026-05-27, PR #6)

- Ship Pro as `notibar-pro` plugin folder/zip; Lite as `notibar`
- `strip-pro.js` + `pro-manifest.json` build-time Pro removal
- Lite-only "Go Pro" submenu + Free vs Pro comparison page (`GoProPage`)
- Pro bottom-placement + role/user conditional display
- CPT targeting disabled in Lite runtime

### v3.0 rewrite (2026-05-21 → 2026-05-22)

- Full v3 plugin rewrite: React Customizer SPA (`customizer-app`), live preview (`customizer-preview`), settings admin page (`settings-app`)
- New bar data model (content / style / display / behavior / schedule)
- Per-bar scheduling, device-aware content, 8 color presets, WCAG AA contrast checker, drag-reorder (`@dnd-kit`)
- 11 built-in theme-compat patches
- WPML string registration on customize save
- Migration: v2.x flat theme_mods → v3 bar objects
- CPT display logic + tracking groundwork

### v2.1.9 — legacy (readme.txt changelog, dated Jan 2026)

Pre-v3 line. Public WordPress.org changelog stops at v2.1.9; v3.x is the active development line and is not yet in the public changelog.

---

## Known Stubs & Deferred Work

### Polylang integration — stub

- **File**: `includes/NotificationBar/PolylangBridge.php`
- **Status**: Detects `pll_register_string()` but wires no hooks (v3.0).
- **Reason**: Polylang's public API has no per-string *unregister* equivalent to WPML's, so the diff-based register/unregister approach used by `WpmlBridge` can't be cleanly replicated — removed bars would leak strings in the Polylang dashboard. A design sketch lives in the file's docblock.
- **Contrast**: `WpmlBridge` is fully active (registers 6 strings/bar, resolves via `njt_nofi_resolve_strings`).

### v1 legacy override — removal candidate

- **File**: `includes/NotificationBar/overrideOldVer.php`
- **Status**: Legacy v1→v2 path, dead in v3. Flagged as a removal candidate.

### Public changelog gap

- `readme.txt` changelog ends at v2.1.9; v3.x entries are not yet published there.

---

## Tech Debt (observed in code)

| Item | Notes |
|------|-------|
| Automated tests | No PHPUnit / JS test suite present in the repo (coverage 0%). |
| `overrideOldVer.php` | Legacy v1→v2 code; candidate for removal. |
| `WpPosts.php` | Legacy v2 AJAX handlers, superseded by the REST API. |
| `filter-bars.js` | ~250 LOC; above the 200-LOC guideline — schedule logic could be extracted. |
| `NotificationBarHandle.php` | Largest backend class; render-context building could be extracted. |
| Polylang | Stub pending an API path (see above). |

---

## Potential Future Directions (not committed)

These are reasonable next steps suggested by the current architecture. None are scheduled or present in the codebase — treat as discussion items.

- Add an automated test suite (PHPUnit for PHP, component tests for React).
- Resolve or document the Polylang translation path.
- Remove `overrideOldVer.php` once legacy v1 users are accounted for.
- Publish v3.x entries to the public `readme.txt` changelog.
- Document the action/filter hooks (e.g. `njt_nofi_resolve_strings`, `njt_nofi_bar_rendered`) for extenders.

---

## References

- **[project-overview-pdr.md](./project-overview-pdr.md)** — Product definition & requirements
- **[system-architecture.md](./system-architecture.md)** — Technical architecture
- **[codebase-summary.md](./codebase-summary.md)** — Code organization
- **[code-standards.md](./code-standards.md)** — Development conventions
- **[../README.md](../README.md)** — User & developer overview
