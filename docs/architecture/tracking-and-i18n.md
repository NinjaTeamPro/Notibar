# Architecture — Tracking & i18n

Part of [system-architecture.md](../system-architecture.md).

## Tracking Architecture (Pro)

Privacy-first: no IP, user_id, or email stored — only an `is_logged_in` boolean. No external calls; all data is local. Dual-write: counters are authoritative, the event log is best-effort.

### Event Capture (`assets/frontend/js/tracking.js`)

Document-level capture-phase listeners classify clicks/copies into three mutually-exclusive events:

| Event | Trigger |
|-------|---------|
| `click` | CTA button (`.njt-nofi-button-text`) |
| `dismiss` | close button (`.njt-nofi-close`) |
| `engage` | any other click in the bar, or text copy inside it (not CTA/close) |

### Transport

```javascript
navigator.sendBeacon(window.njtNotibarTracking.endpoint, blob)   // fire-and-forget
// fallback: fetch(endpoint, { method:'POST', keepalive:true })
// payload: { bar_id, event }   → POST /notibar/v1/track
```

### Server-Side Persistence

```
TrackingRestController::track()
  → validate bar_id regex + existence
  → EventCounter::increment()   // notibar_counters option; atomic JSON_MERGE_PATCH; lifetime totals
                                 //   fail = 500 (authoritative); install bails on MySQL < 5.7
  → EventLog::insert()          // {prefix}notibar_events; best-effort (logs error, still succeeds)

Daily cron TrackingCron (hook njt_nofi_prune_events)
  → EventLog::prune(): DELETE WHERE created_at < now - retention
  → retention from TrackingSettings (option notibar_tracking), default 90 days, clamp 1–3650
```

### Analytics Dashboard

```
settings-app → TrackingTab.jsx (lazy-loads TrackingCharts, Pro)
  → fetch /stats/timeseries + /stats/by-bar
  → timeseries-transform.js: aggregateTrend / aggregateBreakdown / seriesToCounters / aggregateBarComparison
  → charts (Chart.js via react-chartjs-2, tree-shaken registry):
       TrendChart (line+area)  ·  EventBreakdownChart (doughnut)  ·  BarComparisonChart (grouped bar)
  → ChartFilters: range (1/7/30/90), bar, audience (all/guest/member), event types
       • server-filter: range + bar_id        • client-filter: audience + events
  → Lite renders the same dashboard in demo mode behind a locked overlay
```

Event colors: click `#3858e9`, dismiss `#d63638`, engage `#00a32a`.

---

## i18n Architecture

### WordPress text domain

```
I18n::loadPluginTextdomain()  on plugins_loaded
  → load_plugin_textdomain('notibar', false, '/i18n/languages/')
```

### React strings

Admin UIs use `@wordpress/i18n` (`__`, `_n`, `sprintf`) with domain `notibar`; `npm run build` extracts to `i18n/languages/notibar.pot`.

### WPML (active — `WpmlBridge`)

```
WpmlBridge::getInstance() (plugins_loaded pri 10)
  → silent no-op if WPML core or String Translation addon absent
  → on customize_save_after: diff old vs new bars; register/unregister 6 strings per bar
       text · textMobile · buttonText · buttonUrl · buttonTextMobile · buttonUrlMobile
     via WPML ST API (domain 'notibar'); persisted in option njt_nofi_wpml_string_map (autoload no)
  → on njt_nofi_resolve_strings filter (frontend render): wpml_translate_single_string(...)
```

### Polylang (stub — `PolylangBridge`)

Detects `pll_register_string()` but wires **no hooks** in v3.0. Deferred because Polylang's public API has no per-string *unregister* equivalent to WPML's `wpml_unregister_string()`, so removed bars would leak strings in the Polylang dashboard. See [../project-roadmap.md](../project-roadmap.md).
