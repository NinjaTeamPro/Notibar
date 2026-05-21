/**
 * Notibar preview inline styles.
 *
 * Holds preview-only CSS that must never leak to the live frontend (e.g. the
 * in-bar Edit affordance that lets admins jump straight into the bar editor
 * from the Customizer preview). Injected via injectPreviewStyles() in
 * customizer-preview/index.js — frontend.js does NOT load this string.
 *
 * Anything that should look identical on preview AND live belongs in
 * assets/frontend/css/notibar.css instead (enqueued by both contexts).
 *
 * @since 3.0.0
 */

export const PREVIEW_STYLES = `
.njt-nofi-edit-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 10001;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font: 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1d2327;
  background: rgba(255,255,255,0.92);
  border: 1px solid #c3c4c7;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.12);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.njt-nofi-edit-btn:hover {
  background: #fff;
  border-color: #2271b1;
  color: #2271b1;
}
.njt-nofi-edit-btn:focus-visible {
  outline: 2px solid #2271b1;
  outline-offset: 1px;
}
.njt-nofi-edit-btn svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}
`;
