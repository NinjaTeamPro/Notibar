/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/settings-app/App.jsx"
/*!**********************************!*\
  !*** ./src/settings-app/App.jsx ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   App: () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _tabs_TrackingTab__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tabs/TrackingTab */ "./src/settings-app/tabs/TrackingTab.jsx");
/* harmony import */ var _tabs_ExportImportTab__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tabs/ExportImportTab */ "./src/settings-app/tabs/ExportImportTab.jsx");

/**
 * Notibar Settings App — tabbed admin page root.
 *
 * Two tabs: Tracking (Phase 3 mount target) + Export / Import (Phase 4).
 * Uses WP-native nav-tab-wrapper styling; no router — local React state.
 */




const TABS = [{
  id: 'tracking',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tracking', 'notibar')
}, {
  id: 'export-import',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Export / Import', 'notibar')
}];

/**
 * @param {Object} props
 * @param {Object} props.boot Boot data from window.njtNotibarSettingsBoot.
 */
function App({
  boot
}) {
  const [activeTab, setActiveTab] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('tracking');
  function handleTabClick(e, id) {
    e.preventDefault();
    setActiveTab(id);
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-settings"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", {
    className: "wp-heading-inline"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Notibar Settings', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("nav", {
    className: "nav-tab-wrapper",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Settings tabs', 'notibar')
  }, TABS.map(tab => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    key: tab.id,
    href: `#${tab.id}`,
    className: 'nav-tab' + (activeTab === tab.id ? ' nav-tab-active' : ''),
    "aria-current": activeTab === tab.id ? 'page' : undefined,
    onClick: e => handleTabClick(e, tab.id)
  }, tab.label))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-settings__panel"
  }, activeTab === 'tracking' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_tabs_TrackingTab__WEBPACK_IMPORTED_MODULE_3__.TrackingTab, {
    boot: boot
  }), activeTab === 'export-import' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_tabs_ExportImportTab__WEBPACK_IMPORTED_MODULE_4__.ExportImportTab, {
    boot: boot
  })));
}

/***/ },

/***/ "./src/settings-app/tabs/ExportImportTab.jsx"
/*!***************************************************!*\
  !*** ./src/settings-app/tabs/ExportImportTab.jsx ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExportImportTab: () => (/* binding */ ExportImportTab)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);

/**
 * ExportImportTab — full Export + Import UI for the Settings page.
 *
 * Three cards in document order:
 *   1. Export        — 3 checkboxes + Download
 *   2. Backup hint   — "Download current configuration before importing"
 *   3. Import        — file pick → preview → confirm modal → Replace
 *
 * Round-trip:
 *   GET  /notibar/v1/export?include=<csv>
 *   POST /notibar/v1/import  { _notibar_export_version, _exported_at, bars?, global?, tracking? }
 *
 * Auth: REST nonce via apiFetch middleware (Phase 02 boot).
 */




const MAX_IMPORT_BYTES = 10485760;
const EXPORT_VERSION = 1;
const SECTIONS = ['bars', 'global', 'tracking'];
const SECTION_LABELS = {
  bars: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Bars', 'notibar'),
  global: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Global settings', 'notibar'),
  tracking: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Tracking counters', 'notibar')
};
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function buildFilename(siteHost) {
  const host = siteHost && String(siteHost).length > 0 ? siteHost : 'site';
  return `notibar-export-${host}-${todayIso()}.json`;
}
function sectionCountsFromParsed(parsed) {
  const counts = {};
  if (Array.isArray(parsed.bars)) {
    counts.bars = parsed.bars.length;
  }
  if (parsed.global && typeof parsed.global === 'object') {
    counts.global = 1;
  }
  if (parsed.tracking && typeof parsed.tracking === 'object') {
    counts.tracking = Object.keys(parsed.tracking).length;
  }
  return counts;
}
async function downloadExport(include, filename) {
  const query = include.length ? `?include=${include.join(',')}` : '';
  const res = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
    path: `/notibar/v1/export${query}`,
    parse: false
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function ExportImportTab() {
  const boot = window.njtNotibarSettingsBoot || {};
  const siteHost = boot.siteHost || 'site';
  const [exportSel, setExportSel] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    bars: true,
    global: true,
    tracking: true
  });
  const [exportBusy, setExportBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [parsed, setParsed] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [importSel, setImportSel] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({});
  const [importBusy, setImportBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [confirmOpen, setConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const exportAtLeastOne = SECTIONS.some(k => exportSel[k]);
  async function handleExport(sel) {
    setExportBusy(true);
    setNotice(null);
    try {
      const include = SECTIONS.filter(k => sel[k]);
      await downloadExport(include, buildFilename(siteHost));
    } catch (e) {
      setNotice({
        kind: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Export failed. Check the browser console.', 'notibar')
      });
    } finally {
      setExportBusy(false);
    }
  }
  function handleFile(e) {
    setNotice(null);
    const file = e.target.files && e.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setNotice({
        kind: 'error',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('File exceeds 10 MB. Refusing to load.', 'notibar')
      });
      setParsed(null);
      return;
    }
    const reader = new window.FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const v = Number(data._notibar_export_version);
        if (!v || v > EXPORT_VERSION) {
          throw new Error('Unsupported version');
        }
        setParsed(data);
        setImportSel({
          bars: Array.isArray(data.bars),
          global: !!data.global && typeof data.global === 'object',
          tracking: !!data.tracking && typeof data.tracking === 'object'
        });
      } catch (err) {
        setParsed(null);
        setNotice({
          kind: 'error',
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('File is not a valid Notibar export.', 'notibar')
        });
      }
    };
    reader.readAsText(file);
  }
  async function handleReplace() {
    setImportBusy(true);
    setNotice(null);
    const payload = {
      _notibar_export_version: EXPORT_VERSION,
      _exported_at: parsed._exported_at
    };
    if (importSel.bars && Array.isArray(parsed.bars)) {
      payload.bars = parsed.bars;
    }
    if (importSel.global && parsed.global) {
      payload.global = parsed.global;
    }
    if (importSel.tracking && parsed.tracking) {
      payload.tracking = parsed.tracking;
    }
    try {
      const res = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/notibar/v1/import',
        method: 'POST',
        data: payload
      });
      const r = res && res.replaced || {};
      setNotice({
        kind: 'success',
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.sprintf)(/* translators: %1$d bars, %2$s global yes/no, %3$d tracking */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Imported %1$d bar(s), global=%2$s, %3$d tracking entries. Reload to see changes.', 'notibar'), r.bars || 0, r.global ? 'yes' : 'no', r.tracking || 0)
      });
      setConfirmOpen(false);
      setParsed(null);
    } catch (e) {
      setNotice({
        kind: 'error',
        text: e && e.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Import failed.', 'notibar')
      });
      setConfirmOpen(false);
    } finally {
      setImportBusy(false);
    }
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-export-import"
  }, notice && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Notice, {
    status: notice.kind,
    onRemove: () => setNotice(null)
  }, notice.text), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("section", {
    className: "njt-notibar-export-import__card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Export', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Pick which sections to include, then download the JSON file.', 'notibar')), SECTIONS.map(k => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
    key: k,
    label: SECTION_LABELS[k],
    checked: !!exportSel[k],
    onChange: v => setExportSel({
      ...exportSel,
      [k]: v
    })
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "primary",
    disabled: !exportAtLeastOne || exportBusy,
    isBusy: exportBusy,
    onClick: () => handleExport(exportSel)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Download', 'notibar'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("section", {
    className: "njt-notibar-export-import__card njt-notibar-export-import__backup"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Tip: download a full backup before importing.', 'notibar'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "secondary",
    disabled: exportBusy,
    onClick: () => handleExport({
      bars: true,
      global: true,
      tracking: true
    })
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Download backup', 'notibar'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("section", {
    className: "njt-notibar-export-import__card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Import', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Imports REPLACE the current data for any selected section. This cannot be undone.', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "file",
    accept: ".json,application/json",
    onChange: handleFile
  }), parsed && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-export-import__preview"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.sprintf)(/* translators: %s: ISO timestamp from the export file */
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Exported at: %s', 'notibar'), parsed._exported_at || '—')), Object.entries(sectionCountsFromParsed(parsed)).map(([k, n]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.CheckboxControl, {
    key: k,
    label: `${SECTION_LABELS[k]} (${n})`,
    checked: !!importSel[k],
    onChange: v => setImportSel({
      ...importSel,
      [k]: v
    })
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "primary",
    isDestructive: true,
    disabled: importBusy || !SECTIONS.some(k => importSel[k]),
    onClick: () => setConfirmOpen(true)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Replace selected sections', 'notibar')))), confirmOpen && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Modal, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Confirm import', 'notibar'),
    onRequestClose: () => setConfirmOpen(false)
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('The selected sections will be REPLACED. Continue?', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-export-import__modal-actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "secondary",
    onClick: () => setConfirmOpen(false)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Cancel', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    variant: "primary",
    isDestructive: true,
    isBusy: importBusy,
    onClick: handleReplace
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Yes, replace', 'notibar')))));
}

/***/ },

/***/ "./src/settings-app/tabs/TrackingTab.jsx"
/*!***********************************************!*\
  !*** ./src/settings-app/tabs/TrackingTab.jsx ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TrackingTab: () => (/* binding */ TrackingTab)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shared_TrackingPane__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shared/TrackingPane */ "./src/shared/TrackingPane.jsx");

/**
 * TrackingTab — renders the shared TrackingPane inside the Settings page.
 *
 * Reads bars from window.njtNotibarSettingsBoot (emitted by
 * AssetLoader::enqueue_settings_app). TrackingPane self-fetches its
 * counters via /notibar/v1/stats and joins them against the bars list.
 */

function TrackingTab() {
  const boot = window.njtNotibarSettingsBoot || {};
  const bars = Array.isArray(boot.bars) ? boot.bars : [];
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_shared_TrackingPane__WEBPACK_IMPORTED_MODULE_1__.TrackingPane, {
    bars: bars
  });
}

/***/ },

/***/ "./src/shared/TrackingPane.jsx"
/*!*************************************!*\
  !*** ./src/shared/TrackingPane.jsx ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TrackingPane: () => (/* binding */ TrackingPane)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);

/**
 * TrackingPane — aggregate per-bar click + dismiss readout.
 *
 * Rendered inside the Notibar SPA Panel (list mode), below Display Settings.
 * Lifecycle: parent unmounts this component when the PanelBody is collapsed
 * and remounts on expand — that gives natural "open = fresh fetch" UX.
 *
 * Data source: GET /notibar/v1/stats — admin-gated bulk-read of the
 * notibar_counters option. Joins counters map with the SPA's in-memory
 * bars list (passed via prop) to render bar.name for each row.
 *
 * @since 3.1.0
 */



function TrackingPane({
  bars
}) {
  const [state, setState] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    status: 'loading'
  });
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    let cancelled = false;
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: '/notibar/v1/stats'
    }).then(data => {
      if (cancelled) {
        return;
      }
      setState({
        status: 'ok',
        data: data && 'object' === typeof data ? data : {}
      });
    }).catch(() => {
      if (cancelled) {
        return;
      }
      setState({
        status: 'error'
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if ('loading' === state.status) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
      className: "njt-notibar-tracking-pane__status",
      role: "status",
      "aria-live": "polite"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Loading stats…', 'notibar'));
  }
  if ('error' === state.status) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
      className: "njt-notibar-tracking-pane__status",
      role: "status",
      "aria-live": "polite"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Stats unavailable.', 'notibar'));
  }
  if (!bars || 0 === bars.length) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
      className: "njt-notibar-tracking-pane__status"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('No notification bars configured yet.', 'notibar'));
  }
  const counters = state.data || {};
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-tracking-pane"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "njt-notibar-tracking-pane__table"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    scope: "col"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Bar', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    scope: "col",
    className: "num"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Engagements', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    scope: "col",
    className: "num"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Button Clicks', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    scope: "col",
    className: "num"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Dismissals', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    scope: "col",
    className: "num"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Total', 'notibar')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, bars.map(bar => {
    const row = counters[bar.id] || {};
    const engagements = Number(row.engagements) || 0;
    const clicks = Number(row.clicks) || 0;
    const dismissals = Number(row.dismissals) || 0;
    const total = engagements + clicks + dismissals;
    const name = bar.name && bar.name.trim().length ? bar.name : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('(Untitled)', 'notibar');
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
      key: bar.id
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, name), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
      className: "num"
    }, engagements.toLocaleString()), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
      className: "num"
    }, clicks.toLocaleString()), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
      className: "num"
    }, dismissals.toLocaleString()), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
      className: "num"
    }, total.toLocaleString()));
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "njt-notibar-tracking-pane__hint"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Engagements = clicks or text copies inside the bar that are NOT on the CTA button or the close button (background clicks, text clicks, embedded link clicks, copying coupon codes, etc.).', 'notibar')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Counts since plugin activation; reload to refresh.', 'notibar'))));
}

/***/ },

/***/ "./src/settings-app/index.scss"
/*!*************************************!*\
  !*** ./src/settings-app/index.scss ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************************!*\
  !*** ./src/settings-app/index.js ***!
  \***********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./App */ "./src/settings-app/App.jsx");
/* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./index.scss */ "./src/settings-app/index.scss");

/**
 * Notibar — Settings page SPA entry point.
 *
 * Mounted on admin.php?page=notibar-settings (top-level Notibar menu → Settings).
 * No wp.customize dependency — pure admin page.
 *
 * Boot sequence:
 *  1. Register apiFetch nonce + REST root middleware.
 *  2. Wait for DOMContentLoaded.
 *  3. createRoot → <App />.
 */




// Import SCSS so wp-scripts extracts build/settings-app.css alongside the JS
// bundle. AssetLoader::enqueue_settings_app() expects the file at that path.


// ------------------------------------------------------------------
// apiFetch middleware (REST nonce + root URL)
// ------------------------------------------------------------------
const boot = window.njtNotibarSettingsBoot || {};
if (boot.restNonce) {
  _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().use(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().createNonceMiddleware(boot.restNonce));
}
if (boot.restRoot) {
  _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().use(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().createRootURLMiddleware(boot.restRoot));
}

// ------------------------------------------------------------------
// Mount
// ------------------------------------------------------------------

/**
 * Mount the React SPA into #njt-notibar-settings-app.
 * Uses createRoot (WP ≥ 6.2 ships React 18) with fallback to legacy render.
 */
function mountApp() {
  const mountNode = document.getElementById('njt-notibar-settings-app');
  if (!mountNode) {
    return;
  }
  if (typeof _wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot === 'function') {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot)(mountNode).render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_App__WEBPACK_IMPORTED_MODULE_3__.App, {
      boot: boot
    }));
  } else {
    // Fallback for WP versions shipping React < 18.
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.render)((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_App__WEBPACK_IMPORTED_MODULE_3__.App, {
      boot: boot
    }), mountNode);
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
})();

/******/ })()
;
//# sourceMappingURL=settings-app.js.map