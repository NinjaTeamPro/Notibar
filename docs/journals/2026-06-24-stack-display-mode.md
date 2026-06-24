# Stack Display Mode: Pro Feature Implementation Complete

**Date**: 2026-06-24 14:19
**Severity**: Medium
**Component**: Display modes, Pro feature, schema, body-push, CSS
**Status**: Code complete, pending build + browser QA

## What Happened

Shipped Pro `displayMode: 'stack'` to Notibar, rendering all matching bars simultaneously instead of single/rotation. Single global schema field `stackPositionType` (fixed|absolute) controls the stack's positioning. All survivors split by per-bar `placement` into top + bottom `.njt-nofi-stack` wrappers stacking vertically. Bottom bars grow upward via CSS `column-reverse`. Refactored `body-push.js` to independently pad both top and bottom. Pro code wrapped with `@pro` markers; Lite degrades stack to single render.

## The Brutal Truth

Expected a straightforward feature add. Instead, collided with three hidden assumptions: (1) the README claimed `notibar.css` was unused—it's live at `AssetLoader.php:206,248`, enqueued for frontend + preview; (2) validation sprung a schema change mid-build (user needed admin control over position type), forcing late schema edits; (3) discovered customizer preview *does* install body-push at runtime, expanding QA scope beyond what the plan anticipated.

## Technical Details

- **Schema change**: Added `stackPositionType: 'fixed' | 'absolute'` to global config (SchemaSanitizers.php validated).
- **CSS trick**: Bottom bars via `flex-direction: column-reverse` on the `.njt-nofi-stack.bottom` wrapper preserves DOM/tab order while visual stack grows upward.
- **Body-push refactor**: Now independently calculates `paddingTop` and `paddingBottom` in two passes, removing implicit assumption that they sum to one value.
- **ESLint catch**: Missing `/* eslint-env browser */` in rewritten `body-push.js` (latent, now fixed).
- **Lite safety**: Simulated strip with `node --check` on entry files; `stackRendered` survives as non-@pro `let`, degrades to single render cleanly.

## What We Tried

1. **Grid layout (N-bars-per-row)**: Rejected—bars are full-width horizontal strips, not cards; grid breaks mobile + centering; YAGNI'd.
2. **No schema changes**: Initial assumption overturned by validation; user needed position type control → added single field.
3. **Customizer preview skips body-push**: Wrong assumption; code calls `installBodyPush` at `customizer-preview/index.js:357`; refactor benefits preview too.

## Root Cause Analysis

The README and the codebase drifted on CSS source of truth. No explicit validation gate on schema changes mid-phase (user need emerged late). Customizer internals underdocumented. Minor: ESLint config not run until full rewrite.

## Lessons Learned

1. **Trust code, not docs**: README CSS claim was stale; grepped the actual enqueue logic first next time.
2. **Schema is a gate**: Lock schema shape *before* validation; late changes ripple through sanitizers, tests, and strip logic.
3. **Simulate strip in CI, not by hand**: Caught `node --check` safety; automate this in pre-commit or CI so strip regressions surface early.
4. **Customizer is *not* a sandbox**: Preview calls the real runtime (body-push, etc.); treat it as full integration.

## Next Steps

- **User**: Run `npm run build` (webpack full), then `./release.sh --lite` to verify strip safety in CI environment.
- **QA**: Browser test single/rotation parity; test stack top/bottom on mobile (flex-direction reversing); verify body-push padding on both axes.
- **Commit**: Hold working tree; user will stage/commit after build + QA pass.

---

**Status**: DONE
**Summary**: Pro stack display mode implemented; schema + body-push refactored; code reviewed (no Critical/High); awaiting build + browser QA before commit.
