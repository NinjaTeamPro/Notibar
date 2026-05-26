=== Notibar - Notification Bar for WordPress===
Contributors: ninjateam
Donate link: https://codecanyon.net/item/media-folders-manager-for-wordpress/21715379
Tags: notification bar, banner, top bar, announcement, notifications
Requires at least: 4.0
Requires PHP: 5.3.1
Tested up to: 7.0
Stable tag: 3.0.0
License: GPL-2.0+
License URI: http://www.gnu.org/licenses/gpl-2.0.txt

== Description ==
**Multiple notification bars with React-powered Customizer editor, live preview, rotation mode, and per-bar display rules.**

This plugin lets you create and manage **multiple notification bars** at once. Configure each bar independently — content, style, devices, display pages, close behaviour, and rotation — all inside the native WordPress Customizer with **instant live preview**.

The **Dismiss** button supports three modes: close permanently, collapse/toggle, or disabled.

**Per-bar page/post rules** let you show bars on all pages, no pages, or a specific include/exclude list.

**Rotation mode** cycles through multiple bars with pause-on-hover and respects `prefers-reduced-motion`.

Notibar seamlessly integrates with your existing WordPress theme, ensuring a cohesive look and feel. It has integrated clear and compelling call-to-action buttons to drive user engagement and conversions.

###⚡️ FEATURES

**This alert banner is built to optimize appearance and drive a positive impact on your WordPress website traffic and conversions:**

- Designed with **clean** UI & modern style
- Display in **absolute** or **fixed** positioning
- Custom color, text, click-to-action
- Various notice bar **style presets**
- Set text container width and alignment
- Actions for **Dismiss** button: disable, toggle, close for good
- WYSIWYG visual banner editor with **live preview**
- Display on all pages/posts or specific page/post ID
- Add different content for mobile devices

###🚀 TYPICAL USE CASES

**These are good ideas on how to exploit the Notification Bar plugin:**

- Important announcements
- Technical notices
- Time-sensitive appeals for donation or CTA
- Subscription increase
- Terms or operational changes
- Privacy policy acknowledgments
- Maintenance messages
- Service outage or resource shortage
- Seasonal offers or promotions
- Driving traffic to other sites

Notibar is ideal for you to promote upcoming events, new blog posts, product launches, or special offers with ease.

Did you know? You can even capture email leads by offering incentives and integrating with your email marketing provider.

###🎉 Supported Themes and Plugins

We have done extra work to ensure complete compatibility with all themes, page builders and other popular plugins.


###📝 Documentation and Support
If you're having issues, do let us know and we'll try to help you out.
You can always reach us at [Ninja Team Support Center](http://ninjateam.org/support).

###♥️ Like this Top Bar Alert Plugin?
- Rate us 5⭐ stars on [WordPress.org](https://wordpress.org/support/plugin/notibar/reviews/?filter=5#new-post)
- Learn to [create successful online stores](https://yaycommerce.com/category/woocommerce-tutorials/) with advanced built-in features.

== Frequently Asked Questions ==

= How can I find page or post ID? =

On your admin dashboard, navigate to **All Pages** or **All Posts**, then hover or click **Edit** the page/post, you'll see '?post=x' in its own editing action link. So 'x' is the ID for this specific page or post.
Eg: 'https://yourdomain.org/wp-admin/post.php?post=353&action=edit'
→ Post ID = 353

= Which themes does this notification top bar work with? =

**Notibar plugin** is built to work wonderfully with all themes.

= Can I use this notification bar plugin on client websites? =

Yes! You can certainly use it on your own websites as well as your clients'.

= Is this top bar compliant with GDPR? =

Absolutely! Notibar doesn't collect or store any personal information. So rest assured.

= Is Notibar free? =
Yes. Notibar is free and includes everything you need to run multiple notification bars: content & styling, HTML/CSS support, mobile-specific content, 3-state dismiss, per-bar page/post display rules, and Export/Import.

Notibar Pro adds advanced conversion tools on top of the free plugin:

- Rotation mode (A/B testing): cycle multiple bars by sequence or random, with a custom interval and pause-on-hover
- Targeting by custom post type (including WooCommerce products)
- Advanced reports: per-bar click & dismiss tracking
- Display a bar at the bottom of the screen
- Conditional display by user role or specific users

= Does conditional display by role/user work with page caching? =

Role and user targeting (a Pro feature) is evaluated on the server, so a full-page cache that serves one cached HTML to every visitor can show the wrong bars. The standard fix — used by virtually every membership/role-aware plugin — is to **exclude logged-in users from the page cache** (most caching plugins do this by default). Logged-out visitors all correctly receive the "logged-out / everyone" set; logged-in users then get their role/user-specific bars evaluated fresh.

= Does Notibar support multilingual sites (WPML / Polylang)? =

**WPML:** Yes. Notibar v3.0+ integrates with the **WPML String Translation** addon. After you publish a bar, its text, button label, and button URL are auto-registered as translatable strings under the `notibar` domain. Translate them in **WPML → String Translation**, and the right language renders automatically on the front-end. Both WPML core and the String Translation addon must be active — without the addon, Notibar silently serves the original strings.

**Polylang:** Polylang support in v3.0 is a **documented stub only** — there is no automatic per-bar string registration. If you need Polylang translation today, register each string manually with `pll_register_string()` from a child-theme or custom-plugin hook (the string names follow the pattern `bar-{id}-text`, `bar-{id}-textMobile`, `bar-{id}-buttonText`, etc., and live in the `notibar` domain). Full Polylang integration is planned for a future v3.1+ release.


== Installation ==
1. Upload the entire plugin folder to the '/wp-content/plugins/' directory.
2. Activate the plugin through the **Plugins** menu in WordPress.

Upon activation, you will see a new **Notification Bar** menu. Simply click to custom the WordPress notification bar element by changing all default settings for text, styles and effects.

== Screenshots ==

1. Notification bar settings location
2. Edit content and preview it


== Upgrade Notice ==

= 3.2.0 =
Notibar settings now persist across theme switches. On first load of v3.2.0 your existing bar list + display config are automatically copied from the active theme's settings to a site-wide store. No manual action required.

= 3.0.0 =
v3.0.0 is a major rewrite. Your existing bar settings are auto-migrated on first activation. A 30-day backup of legacy settings is kept in the `njt_nofi_v2_backup` option. No manual action required.

== Changelog ==

= 3.2.0 =
- Settings are now stored at the site level (wp_options) instead of per-theme (theme_mods). Existing settings on the active theme are migrated automatically on first load. Bars and display config now persist across theme switches.

= 3.1.0 =
- New: Per-bar click and dismiss event tracking via REST endpoints `notibar/v1/track` (POST, anon) and `notibar/v1/stats/{bar_id}` (GET, admin-only)
- New: Atomic counter storage at wp_options key `notibar_counters` (JSON shape: `{bar_id: {clicks, dismissals}}`)
- New: Self-healing install on plugin auto-upgrade — no manual deactivate/reactivate needed
- Requirement: MySQL/MariaDB >= 5.7 for JSON_SET support (older DBs cleanly skip tracking; plugin fully functional)
- New: Frontend tracking beacon — clicks on primary CTA and close button fire navigator.sendBeacon to record events without blocking user
- New: Beacon falls back to fetch keepalive on browsers without sendBeacon; ad-blockers cause graceful counter drift, no JS errors
- New: Read-only stats display in the Customizer per-bar editor — see clicks and dismissals at a glance when editing a bar
- New: Accessible stats live region (role=status + aria-live=polite) for screen readers

= 3.0.0 =
- Added: Multiple notification bars per site — add, reorder, duplicate, and delete bars from a single Customizer panel
- Added: React-based Customizer editor with live Customizer preview
- Added: 3-state close button — close permanently, collapse/toggle, or disabled
- Added: 4-state page/post display logic — all pages, no pages, include list, or exclude list
- Added: Rotation mode — cycles through multiple bars with pause-on-hover and `prefers-reduced-motion` support
- Added: Per-bar dismissal cookies with configurable reopen-after-days
- Added: WPML String Translation API integration (replaces static wpml-config.xml; silent no-op when WPML ST is absent)
- Added: Documented Polylang stub for manual integration via pll_register_string
- Added: Hard-cutover migration from v2.1.9 with 30-day backup snapshot (`njt_nofi_v2_backup` option)
- Changed: CSS class `.njt-nofi-content-deskop` (typo) aliased to canonical `.njt-nofi-content-desktop`; alias kept until v3.1
- Changed: Frontend runtime rebuilt in vanilla JS (no jQuery dependency)
- Removed: 12 legacy Customizer controls replaced by React SPA
- Removed: Select2 vendor bundle from admin
- Removed: Legacy `njt_nofi_*` flat theme_mods (46 keys) — superseded by `njt_nofi_bars` JSON array

= Jan 26, 2026 - Version 2.1.9 =
- Improved: WCAG Level AA compliance

= May 15, 2025 - Version 2.1.8 =
- Fixed: CSS refactor for notification bar

= May 6, 2025 - Version 2.1.7 =
- Fixed: Resolve the bug that is deprecated in PHP 8

= Feb 26, 2025 - Version 2.1.6 =
- Fixed: Security - Authenticated (Administrator+) Stored Cross-Site Scripting (WordFence reported)

= Dec 10, 2024 - Version 2.1.5 =
- Fixed: Security (WordFence reported)

= 29 Jul 2023 - Version 2.1.4 =
- Fixed: Display options issues

= 26 Jul 2023 - Version 2.1.3 =
- Fixed: Override options when updating to the new version
- Fixed: Dropdown layout

= 24 Jul 2023 - Version 2.1.2 =
- Improved: UI
- Fixed: Improve display options

= 20 May 2023 - Version 2.1.1 =
- Fixed: Notibar in homepage

= 20 May 2023 - Version 2.1 =
- Added: Exclude page/post and include page/post
- Added: Add option button font weight
- Fixed: Small CSS bugs

= 2.0 =
- Fixed: Header issue

= 1.9.9 = 
- Added: Compatible with Astra theme

= 1.9.8 =
- Added: Translation

= 1.9.7 =
- Improved: Notibar display smoother when scroll
- Updated: Compatible with Essential theme by Pixfort

= 1.9.5 =
- Improved: UI

= 1.9.4 =
- Fixed: Undefined index notice when users doesn’t have manage_options capability
- Fixed: Publish enabled issue
- Fixed: Styling Options can't be modified on Firefox
- Fixed: Notibar doesn’t show on search page

= 1.9.3 =
- Added: Support shortcode
- Added: Support WPML for URL field
- Added: Support Konte theme

= 1.9.2 =
- Fixed: Notibar displays again when scroll on Safari
- Improved: Set style max-width for text content

= 1.9.1 =
- Improved: Compatible with WordPress 5.6

= 1.9 =
- Added: Support Enfold theme
- Added: Support Nayma theme
- Added: Support Essentials theme
- Fixed: Creates a random white space at the footer when close  notibar
- Improved: CSS

= 1.8 =
- Added: Support WPML and Polylang
- Added: Button text color option

= 1.7 =
Improved: Width for Notibar
Fixed: Some small bugs

= 1.6 =
Fixed: Bar shows again after closed on mobile

= 1.5 =
- Added: Cookie for Notibar
- Fixed: Some smal bugs

= 1.4 =
- Added: Option different content for mobile
- Improved: Mobile preview
- Fixed: Some smal bugs

= 1.3 =
- Added: Support mobile view
- Added: Choose devices want to display notibar
- Improved: UI
- Fixed: Some small bugs

= 1.2 =
- Improved: UI/UX
- Improved: Optimized source code

= 1.1 =
- Improved: UI/UX
- Fixed: Some small bugs

= 1.0 =
- Release date: September 19, 2020