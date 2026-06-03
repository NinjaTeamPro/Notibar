# Code Standards & Conventions

## Overview

Notibar follows WordPress coding standards, PSR-4 autoloading, and modern PHP/JS practices. This doc standardizes conventions across backend (PHP), frontend (JS), and UI (React).

---

## PHP Standards

### Namespace & PSR-4

**Namespace**: `NjtNotificationBar\` (root); submodules like `NjtNotificationBar\NotificationBar\`

**Directory structure**:
```
includes/
├── Plugin.php                           → NjtNotificationBar\Plugin
├── I18n.php                             → NjtNotificationBar\I18n
├── edition.php                          → NjtNotificationBar\NJT_NOFI_IS_PRO constant
├── NotificationBar/
│   ├── Schema.php                       → NjtNotificationBar\NotificationBar\Schema
│   ├── AssetLoader.php                  → NjtNotificationBar\NotificationBar\AssetLoader
│   ├── EventCounter.php                 → NjtNotificationBar\NotificationBar\EventCounter
│   └── ...
```

**Rule**: One class per file; class name matches filename.

**Autoloader**: Custom PSR-4 in njt-notification-bar.php (lines 75–94); handles all `NjtNotificationBar\*` classes.

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Class** | PascalCase | `EventCounter`, `RestPostsController` |
| **Function (global)** | snake_case with namespace | `njt_nofi_kill_lite()`, `NjtNotificationBar\init()` |
| **Method** | camelCase | `maybeInstall()`, `sanitizeBars()` |
| **Property** | camelCase | `$plugin`, `$schema` |
| **Constant (class)** | UPPER_CASE | `ALLOWED_ALIGNMENT`, `EVENT_MAP` |
| **WP option/setting** | snake_case with prefix | `njt_nofi_bars`, `njt_nofi_global`, `notibar_counters` |
| **File** | kebab-case (for non-classes) | `edition.lite.php`, `capture-error.php` |

### File Organization

**Max 200 lines per file** (code, excluding comments).

**File structure**:
```php
<?php
/**
 * Short description.
 *
 * Longer context if needed.
 *
 * @package NjtNotificationBar\Module
 * @since   3.0.0
 */

namespace NjtNotificationBar\Module;

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/path/to/dependency.php'; // if internal deps

/**
 * Class ClassName
 *
 * Description.
 */
class ClassName {
    // ... code
}
```

**Order within class**:
1. Constants
2. Static properties
3. Private properties
4. Constructor (__construct)
5. Static methods
6. Public methods (alphabetical or logical groups)
7. Protected methods
8. Private methods

### Traits for Shared Logic

**Pattern**: Extract >3 methods shared across classes into a trait.

**Examples**:
- `SchemaSanitizers`: Sanitize callbacks for Schema (sanitize hex colors, text, URLs)
- `NotificationBarHandleAdmin`: Admin menu & action links in NotificationBarHandle

**Rule**: Trait name ends with plural (plural = mixin behavior).

### Singletons & Static Factories

**Pattern**: Core classes use lazy-loaded singletons via static `getInstance()`.

```php
public static function getInstance() {
    static $instance = null;
    if ( null === $instance ) {
        $instance = new self();
        $instance->init();
    }
    return $instance;
}
```

**Classes**: `Plugin`, `AssetLoader`, `WpCustomNotification`, `NotificationBarHandle`, `WpmlBridge`.

**Rationale**: One instance per request; safe to call multiple times; cleaner than globals.

### Class Dependencies

**Constructor injection** for explicit dependencies:

```php
class RestPostsController {
    public function register() {
        register_rest_route( 'notibar/v1', '/posts', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_posts' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ] );
    }
}
```

**No service container** (keep it simple; low dependency count).

### Input Validation & Sanitization

**Pattern**:
1. Receive input
2. Sanitize (type, range, whitelist)
3. Validate (schema, business logic)
4. Store/use

**Common sanitizers**:

| Input Type | Sanitizer | Location |
|-----------|-----------|----------|
| Color (hex) | `sanitize_hex_color()` | SchemaSanitizers::sanitizeColor |
| URL | `esc_url_raw()` | SchemaSanitizers::sanitizeButtonUrl |
| Text (rich) | `wp_kses_post()` | SchemaSanitizers::sanitizeText |
| Enum | Custom whitelist | SchemaSanitizers per field |
| Integer | `intval()` + range clamp | SchemaSanitizers::sanitizeIntRange |
| ID list | Custom regex + parsing | SchemaSanitizers::sanitizeIdList |
| JSON | `json_decode()` + schema validate | Schema::sanitizeBars() |

**Example**:
```php
public static function sanitizeColor( $value ) {
    $sanitized = sanitize_hex_color( $value );
    return false === $sanitized ? '#000000' : $sanitized;
}
```

### Output Escaping

**Pattern**: Escape at output point, not storage.

| Context | Escaper | Example |
|---------|---------|------|
| HTML | `esc_html()` | Bar name in admin list |
| Attribute | `esc_attr()` | Color value in style= |
| URL | `esc_url()` | Button href= |
| JSON (WP boot data) | `wp_json_encode()` | window.njtNotibarBoot = ... |

**JSON in admin**: Use `wp_json_encode()` (applies wp_json_encode_default filters).

**REST responses**: WP REST API auto-escapes if you declare schema `sanitize_callback`.

### WP Hooks

**Action/filter naming**:
- Prefix: `njt_nofi_` (option actions) or `notibar_` (plugin hooks)
- Format: noun_verb or context_action
- Examples: `njt_nofi_bars_section`, `notibar_bar_filtered`, `customize_save_after` (WP core)

**Priority convention**:
- `plugins_loaded` 5: migrations (before main init)
- `plugins_loaded` 10: core init
- `rest_api_init`: register REST routes (literal routes before dynamic)
- `wp_footer` 5: inject tracking data
- Customizer save: 20+ (after core)

### PHP Version Constraint

**Min version**: PHP 5.3.1 (no type hints, no short arrays `[]`, no `::class`, no spaceship `<=>`, no null coalesce `??`)

**Allowed**:
- `isset()`, `empty()`, `is_array()`, `is_string()`, etc.
- `array()` syntax, not `[]`
- `function_exists()` checks for optional WP features

**Forbidden in PHP-only code**:
- Type hints: `function method( string $name )`
- `?? ` null coalesce
- `<=>` spaceship
- `[]` short array syntax
- `declare( strict_types = 1 );`

**Exception**: @wordpress/scripts output (JS→Babel) uses modern syntax; server-side only respects 5.3.

### Comment Style

**File header**:
```php
/**
 * Short description (one line, max 80 chars).
 *
 * Longer context if the file does >one thing.
 *
 * @package NjtNotificationBar\Module
 * @since   3.0.0
 */
```

**Class docblock**:
```php
/**
 * Class Description
 *
 * What it does, key responsibilities.
 */
class Foo { }
```

**Method docblock** (PHPDoc):
```php
/**
 * Brief description.
 *
 * @param string $name   Bar name.
 * @param array  $config Bar config array.
 * @return bool True if saved, false on error.
 * @since  3.0.0
 */
public function save( $name, $config ) { }
```

**Inline**: Only for non-obvious logic; avoid restating code.

```php
// GOOD: explains why
// Prune old events to keep table size bounded (<1M rows typical)
if ( $event_count > 1000000 ) { ... }

// BAD: restates code
// Set is_logged_in to 1
$is_logged_in = 1;
```

---

## JavaScript Standards

### Framework & Deps

**Stack**:
- React 18 (via @wordpress/element; fallback to 16)
- @wordpress/components (UI kit)
- @wordpress/i18n (text domain, translation)
- @wordpress/api-fetch (REST helpers)
- uuid v14 (ID generation)
- @dnd-kit (drag-reorder; customizer-app)
- chart.js + react-chartjs-2 (tracking, Pro)

**No Redux** (keep state simple via custom hooks).

### File Organization

**Max 150 LOC per file** (including tests if colocated).

**File naming**: kebab-case

```
src/
├── customizer-app/
│   ├── index.js                         Entry point
│   ├── App.jsx                          Root component
│   ├── components/
│   │   ├── BarEditor.jsx                <150 LOC
│   │   ├── BarList.jsx
│   │   ├── fields/
│   │   │   ├── AsyncPostPicker.jsx
│   │   │   ├── ColorFieldWithReset.jsx
│   │   │   └── ... (field components)
│   │   └── tabs/
│   │       ├── ContentTab.jsx
│   │       ├── DisplayTab.jsx
│   │       └── ...
│   ├── hooks/
│   │   └── use-rest-search.js           Custom hook
│   ├── store/
│   │   ├── customizer-bridge.js         Read/write Customizer settings
│   │   └── use-customizer-state.js      State hook backed by bridge
│   └── utils/
│       ├── create-bar.js
│       ├── defaults.js
│       ├── update-path.js               Immutable nested update
│       ├── uuid.js                      ID generation helper
│       ├── debounce.js
│       └── wcag-contrast.js
└── shared/
    ├── filter-bars.js                   Core filtering (frontend + preview)
    ├── render-bar.js                    HTML generation
    ├── rotation.js                      Rotation logic (Pro)
    ├── escape-utils.js                  Text escaping
    ├── body-push.js                     ResizeObserver layout adjust
    └── charts/
        ├── tracking-charts.jsx
        ├── trend-chart.jsx
        ├── event-breakdown-chart.jsx
        ├── bar-comparison-chart.jsx
        ├── chart-registry.js            Chart.js config
        ├── chart-filters.jsx
        ├── timeseries-transform.js      Aggregation logic
        └── demo-data.js                 Lite demo data
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Component** | PascalCase (JSX) | `BarEditor`, `ColorFieldWithReset` |
| **Function/utility** | camelCase | `createBar()`, `sanitizeColor()` |
| **Variable** | camelCase | `barId`, `barList`, `filteredBars` |
| **Constant** | UPPER_CASE | `MAX_BARS`, `MIN_FONT_SIZE` |
| **Hook** | use + CamelCase | `useBars()`, `useRestSearch()` |
| **Callback** | handle + action | `handleSaveBar`, `handleDelete` |
| **File** | kebab-case | `use-rest-search.js`, `update-path.js` |
| **CSS class** | kebab-case with prefix | `.njt-nofi-container`, `.njt-nofi-button-text` |

### React Component Structure

```jsx
/**
 * BarEditor — edit a single bar's content, display, style, behavior.
 *
 * @param {Object} props
 * @param {Object} props.bar             Current bar object
 * @param {Function} props.onUpdate      (bar) => void
 * @return {React.ReactNode}
 */
export default function BarEditor({ bar, onUpdate }) {
  // State (if needed)
  const [error, setError] = useState( null );

  // Effects
  useEffect( () => {
    // setup
    return () => { /* cleanup */ };
  }, [bar.id] );

  // Handlers
  const handleNameChange = ( newName ) => {
    onUpdate( { ...bar, name: newName } );
  };

  // Render
  return (
    <div className="njt-bar-editor">
      <TabPanel tabs={tabs} onSelect={setActiveTab}>
        {activeTab === 'content' && <ContentTab bar={bar} onUpdate={onUpdate} />}
        {/* ... */}
      </TabPanel>
    </div>
  );
}
```

**Rules**:
- Declare component as default export
- PropTypes or JSDoc `@param` for documentation
- Separate concerns: one component = one responsibility
- Lift state to parent if >1 child needs it
- Use `useCallback` for handlers passed as props (prevent re-renders)

### Hooks

**Custom hooks** for shared logic (state + effects).

```jsx
/**
 * useBars — read & write bars from Customizer setting.
 *
 * @return {[Array, Function]} [bars, setBars]
 */
export function useBars() {
  const [bars, setBars] = useState( [] );

  // Read initial from Customizer setting
  useEffect( () => {
    const initial = api( 'option:njt_nofi_bars' )();
    setBars( initial || [] );

    // Subscribe to changes
    api( 'option:njt_nofi_bars' ).bind( setBars );
    return () => api( 'option:njt_nofi_bars' ).unbind( setBars );
  }, [] );

  // Write back (debounced)
  const updateBars = useCallback( debounce( ( newBars ) => {
    api( 'option:njt_nofi_bars' ).set( newBars );
  }, 150 ), [] );

  return [bars, updateBars];
}
```

**Rules**:
- Prefix with `use`
- Return value(s) as array or object
- Document with JSDoc `@return`
- Manage lifecycle with `useEffect` cleanup
- Memoize expensive operations (useCallback, useMemo)

### State Management (No Redux)

**Pattern**: Component state or custom hooks; Customizer as single source of truth.

```jsx
// Store is a custom hook
const [bars, setBars] = useBars();
const [global, setGlobal] = useGlobal();

// Updates via hook setters (debounced internally)
handleAddBar( () => {
  setBars( [...bars, newBar] );
});
```

**Rationale**: Low complexity; easy to trace; leverages WP Customizer API.

### Async Data Fetching

**Pattern**: @wordpress/api-fetch + custom hook.

```jsx
/**
 * useRestSearch — fetch search results via REST.
 *
 * @param {string} endpoint REST route
 * @param {string} query    Search query
 * @return {Object}        {items, loading, error}
 */
export function useRestSearch( endpoint, query ) {
  const [items, setItems] = useState( [] );
  const [loading, setLoading] = useState( false );
  const [error, setError] = useState( null );

  useEffect( () => {
    if ( !query ) {
      setItems( [] );
      return;
    }

    setLoading( true );
    apiFetch( {
      path: `/notibar/v1/${endpoint}?s=${query}`,
    } )
      .then( setItems )
      .catch( setError )
      .finally( () => setLoading( false ) );
  }, [endpoint, query] );

  return { items, loading, error };
}
```

**Rules**:
- Clean up in-flight requests on unmount (useEffect cleanup)
- Debounce user input before fetching
- Handle errors gracefully
- Use @wordpress/api-fetch (knows about nonces, site URL)

### i18n (Internationalization)

**Pattern**: @wordpress/i18n for strings.

```jsx
import { __, _n, sprintf } from '@wordpress/i18n';

export function BarList() {
  const count = bars.length;
  return (
    <div>
      <h2>{__( 'Notification Bars', 'notibar' )}</h2>
      <p>
        {sprintf(
          _n(
            '%d bar created',
            '%d bars created',
            count,
            'notibar'
          ),
          count
        )}
      </p>
    </div>
  );
}
```

**Rules**:
- Always wrap user-facing strings in `__()`, `_n()`, `sprintf()`
- Second arg = text domain ('notibar')
- Extract strings via babel (built-in to @wordpress/scripts)
- Never interpolate text; use `sprintf` + placeholders
- Store strings in i18n/languages/ .po files

### Styling (CSS)

**Scope**: Prefix all frontend classes with `.njt-nofi-`; admin with `.njt-bar-` or component-specific.

**CSS vars** for theming:

```css
.njt-nofi-container {
  background-color: var(--njt-bar-bg, #ffffff);
  color: var(--njt-bar-color, #000000);
  --njt-bar-bg: #9af4cf;
  --njt-bar-color: #1919cf;
}
```

**Responsive**: Mobile-first; media query `@media (min-width: 481px)` for desktop.

```css
/* Mobile (default) */
.njt-nofi-text { font-size: 14px; }

/* Desktop */
@media (min-width: 481px) {
  .njt-nofi-text { font-size: 16px; }
}
```

**No utility frameworks** in source (Tailwind, Bootstrap); inline styles rare; SCSS for organization.

### Testing & Debug

**Debug logging**:
```js
if ( 'development' === process.env.NODE_ENV ) {
  console.log( 'Bar state:', bars );
}
```

**No console.log in production** (remove before release or guard with NODE_ENV check).

---

## Shared Utilities

### Escaping (src/shared/escape-utils.js)

**Functions**:
- `escapeText(text)`: Replace `<>&"'` with HTML entities
- `escapeAttr(text)`: Safe for HTML attributes
- `decodeBasicEntities(text)`: Reverse double-encoding (legacy v2)

**Usage**:
```js
const barName = escapeAttr( bar.name ); // safe for data-bar-name="..."
```

### Filtering (src/shared/filter-bars.js)

**Function**: `filterBars(bars, ctx)` → filtered array

**Context object**:
```js
{
  pageId,           // Post ID (e.g., 123)
  postId,           // Synonym for pageId
  isHome,           // Boolean
  isSingleProduct,  // Boolean (WC)
  theme,            // WP theme name
  serverNow,        // ISO datetime server-side
  serverWeekday,    // 0–6 (Sun–Sat)
  serverHHMM,       // "HH:MM" server time
  currentCptType,   // Custom post type slug
  currentObjectId,  // Post ID in CPT
  isLoggedIn,       // Boolean
  userRoles,        // Array of role slugs
  userId,           // Integer or null
  deviceType,       // 'desktop' | 'mobile'
}
```

**Filters applied**:
1. enabled flag
2. device (desktop/mobile)
3. CPT rules (Pro)
4. Page/post rules
5. Dismissal cookie
6. Schedule (date range, daily window, weekday)
7. Audience (Pro; roles, user list)

### Rendering (src/shared/render-bar.js)

**Function**: `renderBarHTML(bar, global)` → HTML string

**Output**:
```html
<div class="njt-nofi-container" data-position="fixed" data-placement="top">
  <div class="njt-nofi-notification-bar">
    <div class="njt-nofi-container-content" role="status" aria-live="polite">
      <div class="njt-nofi-text">{{bar.content.text}}</div>
      <button class="njt-nofi-button-text">{{bar.content.button.text}}</button>
      <button class="njt-nofi-close">×</button>
    </div>
  </div>
</div>
```

**CSS custom properties** injected as inline styles:
```css
--njt-bar-bg: #9af4cf;
--njt-bar-color: #1919cf;
--njt-btn-bg: #1919cf;
--njt-btn-color: #ffffff;
--njt-bar-font-size: 15px;
--njt-bar-alignment: center;
```

### Rotation (src/shared/rotation.js, Pro)

**Function**: `startRotation(bars, global, options)` → cleanup callback

**Behavior**:
- Cycle through bars at interval (rotationIntervalSeconds)
- Pause on hover (.njt-nofi-container)
- Respect prefers-reduced-motion
- Page Visibility (don't cycle if tab hidden)
- Sequential or random order

---

## Build & Release

### npm Scripts

```bash
npm run build      # webpack → build/*.{js,css,asset.php}
npm run start      # watch mode (dev)
npm run lint:js    # ESLint
npm run format     # Prettier
```

**Build output**:
- 4 entry points: customizer-app, customizer-preview, frontend, settings-app
- Each → {entry}.js + {entry}.css + {entry}.asset.php (dependency manifest)
- RTL variants (if applicable)
- Minified + source maps

**DO NOT edit build/ directly**; always edit src/ then rebuild.

### Lite Build Process

**File**: build-tools/strip-pro.js

**Steps**:
1. Copy source tree to temp staging dir
2. Replace `includes/edition.php` with `build-tools/edition.lite.php` (NJT_NOFI_IS_PRO = false)
3. Remove Pro-only files per `build-tools/pro-manifest.json`:
   - `src/shared/rotation.js`
   - `src/shared/charts/*` (except demo data)
   - `includes/NotificationBar/EventCounter.php`
   - `includes/NotificationBar/TrackingRestController.php`
   - `assets/frontend/js/tracking.js`
   - etc.
4. Strip `@pro…@endpro` marker regions across all PHP/JS/JSX/SCSS/CSS files
5. Rebuild JS from stripped tree
6. Package as zip

**Marker syntax**:
```php
// @pro
$pro_code = true;
// @endpro
```

```jsx
{/* @pro */}
<ProFeature />
{/* @endpro */}
```

---

## Pre-commit Checklist

- [ ] Code follows PSR-4 (PHP) & kebab-case (files)
- [ ] No syntax errors (php -l, npm run lint:js)
- [ ] Functions <200 LOC (PHP), <150 LOC (JS)
- [ ] Inputs sanitized (wp_kses_post, sanitize_hex_color, etc.)
- [ ] Outputs escaped (esc_html, esc_attr, wp_json_encode)
- [ ] Strings wrapped in __() with 'notibar' domain
- [ ] No console.log (or guarded with NODE_ENV check)
- [ ] Comments explain why, not what
- [ ] Constants use UPPER_CASE
- [ ] Classes named PascalCase; methods camelCase
- [ ] README & docs updated (if API changes)
- [ ] No breaking changes without migration

---

## References

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Security](https://developer.wordpress.org/plugins/security/)
- [PSR-4 Autoloading](https://www.php-fig.org/psr/psr-4/)
- [@wordpress/scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)
- [React Hooks](https://react.dev/reference/react/hooks)
