#!/usr/bin/env bash
# Token-free portion of plans/.../phase-06-validation-checklist.md.
# Covers Check 4 (missing token fails loud), Check 7 (no residual temp dirs),
# Check 9 (.distignore does not exclude recommended-modules). Token-required checks
# (1, 2, 3, 5, 6, 8) are documented but skipped here.

set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m' "$1"; }
red()   { printf '\033[31m%s\033[0m' "$1"; }

check() {
    local name="$1"; shift
    if "$@"; then
        printf '  [%s] %s\n' "$(green PASS)" "$name"
        PASS=$((PASS + 1))
    else
        printf '  [%s] %s\n' "$(red FAIL)" "$name"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Check 4: missing GITHUB_TOKEN fails loud ==="
check_4() {
    local out
    # --no-env-file ensures a populated local .env doesn't mask the missing-token path.
    out=$(env -u GITHUB_TOKEN php "${ROOT_DIR}/bin/pull-modules.php" --no-env-file 2>&1) && return 1
    [[ "$out" == *"GITHUB_TOKEN"* ]]
}
check "exit nonzero + stderr names GITHUB_TOKEN" check_4

echo "=== Check 7: no residual temp dirs after a failed run ==="
check_7() {
    local exit_code
    GITHUB_TOKEN=intentionally-bad-token-for-verify-script \
        php "${ROOT_DIR}/bin/pull-modules.php" --no-env-file >/dev/null 2>&1
    exit_code=$?
    # Defense in depth: prove cleanup ran *after a real failure*, not vacuously.
    [[ "$exit_code" -ne 0 ]] || return 1
    ! ls -d /tmp/yaydp-modules-* 2>/dev/null | grep -q . && \
    ! ls -d "${TMPDIR:-/tmp}"/yaydp-modules-* 2>/dev/null | grep -q .
}
check "no /tmp/yaydp-modules-* leftovers" check_7

echo "=== Check 9: .distignore does not exclude recommended-modules ==="
check_9() {
    ! grep -q 'recommended-modules' "${ROOT_DIR}/.distignore"
}
check "no recommended-modules rule in .distignore" check_9

echo
printf 'Result: %d passed, %d failed\n' "$PASS" "$FAIL"
[[ "$FAIL" -eq 0 ]]
