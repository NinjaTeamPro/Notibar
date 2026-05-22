#!/usr/bin/env php
<?php
// Build-time sync of recommended-modules from a single source repo into a
// gitignored target dir. Sparse-checkout cone mode + rsync per module.
//
// Usage:
//   GITHUB_TOKEN=<pat> php bin/pull-modules.php [--manifest=path] [--no-env-file]

declare(strict_types=1);

const PREFIX = '[pull-modules]';

function info(string $msg): void { fwrite(STDERR, PREFIX . ' ' . $msg . PHP_EOL); }
function fail(string $msg, int $code = 1): void { fwrite(STDERR, PREFIX . ' ERROR: ' . $msg . PHP_EOL); exit($code); }
function redact(string $s, string $secret): string { return $secret === '' ? $s : str_replace($secret, '***', $s); }

function load_env(string $path): void
{
    if (!is_readable($path)) return;
    $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = ltrim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (!preg_match('/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i', $line, $m)) continue;
        [, $key, $val] = $m;
        $val = trim($val);
        $len = strlen($val);
        if ($len >= 2 && (($val[0] === '"' && $val[$len - 1] === '"') || ($val[0] === "'" && $val[$len - 1] === "'"))) {
            $val = substr($val, 1, -1);
        }
        if (getenv($key) !== false) continue;
        putenv("$key=$val");
        $_ENV[$key] = $val;
    }
}

function load_manifest(string $path): array
{
    $raw = @file_get_contents($path);
    if ($raw === false) fail("manifest not readable: $path");
    $data = json_decode($raw, true);
    if (!is_array($data)) fail("invalid JSON in $path: " . json_last_error_msg());

    $repo = $data['source']['repo'] ?? null;
    $ref  = $data['source']['ref']  ?? null;
    $inc  = $data['include']        ?? null;
    $tgt  = $data['target_dir']     ?? null;
    $excl = $data['exclude_globs']  ?? [];

    if (!is_string($repo) || !preg_match('#^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$#', $repo)) fail("manifest 'source.repo' must match 'owner/name'");
    if (!is_string($ref) || $ref === '') fail("manifest 'source.ref' required");
    if (!is_array($inc) || !$inc) fail("manifest 'include' must be non-empty array");
    foreach ($inc as $i => $n) {
        if (!is_string($n) || !preg_match('#^[A-Za-z0-9_-]+$#', $n)) fail("manifest 'include[$i]' invalid");
    }
    if (!is_string($tgt) || $tgt === '' || $tgt[0] === '/' || strpos($tgt, '..') !== false) fail("manifest 'target_dir' must be relative + no '..'");
    if (!is_array($excl)) fail("manifest 'exclude_globs' must be array");

    return ['repo' => $repo, 'ref' => $ref, 'include' => array_values($inc), 'target_dir' => rtrim($tgt, '/'), 'exclude_globs' => array_values($excl)];
}

function run(array $argv, string $redact = ''): array
{
    $cmd = implode(' ', array_map('escapeshellarg', $argv));
    $proc = proc_open($cmd, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($proc)) throw new RuntimeException('proc_open failed: ' . redact($cmd, $redact));
    fclose($pipes[0]);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);

    $stdout = $stderr = '';
    $open = [$pipes[1], $pipes[2]];
    $eintr = 0;
    while ($open) {
        $r = $open; $w = null; $e = null;
        $n = @stream_select($r, $w, $e, 1);
        if ($n === false) { if (++$eintr > 5) break; continue; }
        $eintr = 0;
        if (!$n) continue;
        foreach ($r as $p) {
            $chunk = fread($p, 8192);
            if ($chunk !== false && $chunk !== '') {
                if ($p === $pipes[1]) $stdout .= $chunk; else $stderr .= $chunk;
            }
            if (feof($p)) {
                fclose($p);
                $open = array_filter($open, static fn($x) => $x !== $p);
            }
        }
    }
    $exit = proc_close($proc);
    if ($exit !== 0) {
        throw new RuntimeException("command failed (exit $exit): " . redact($cmd, $redact) . "\n" . redact(trim($stderr), $redact));
    }
    return [$stdout, $stderr];
}

function rmrf(string $path): void
{
    if (!file_exists($path) && !is_link($path)) return;
    if (is_link($path) || !is_dir($path)) { @unlink($path); return; }
    foreach (@scandir($path) ?: [] as $e) {
        if ($e !== '.' && $e !== '..') rmrf("$path/$e");
    }
    @rmdir($path);
}

// ---- main ----

$pluginRoot = dirname(__DIR__);
$manifestPath = $pluginRoot . '/modules.json';
$loadEnv = true;
foreach (array_slice($argv, 1) as $arg) {
    if (strpos($arg, '--manifest=') === 0)      $manifestPath = substr($arg, 11);
    elseif ($arg === '--no-env-file')           $loadEnv = false;
    else                                         fail("unknown arg: $arg", 2);
}

if ($loadEnv) load_env($pluginRoot . '/.env');

$mf = load_manifest($manifestPath);
$token = (string) getenv('GITHUB_TOKEN');
if ($token === '') fail('GITHUB_TOKEN env var required');

$tmp = sys_get_temp_dir() . '/yaydp-modules-' . bin2hex(random_bytes(4));
if (!mkdir($tmp, 0700, true)) fail("failed to create temp dir: $tmp");
register_shutdown_function(static function () use (&$tmp) {
    if ($tmp && is_dir($tmp)) rmrf($tmp);
});

try {
    $url = "https://x-access-token:$token@github.com/{$mf['repo']}.git";
    info("cloning {$mf['repo']}@{$mf['ref']} (sparse)");
    run(['git', 'clone', '--depth', '1', '--filter=blob:none', '--no-checkout', $url, $tmp], $token);
    run(['git', '-C', $tmp, 'sparse-checkout', 'init', '--cone'], $token);
    $sparse = array_map(static fn($n) => "modules/$n", $mf['include']);
    run(array_merge(['git', '-C', $tmp, 'sparse-checkout', 'set'], $sparse), $token);
    run(['git', '-C', $tmp, 'checkout', $mf['ref']], $token);

    [$shaOut] = run(['git', '-C', $tmp, 'rev-parse', 'HEAD'], $token);
    $sha = trim($shaOut);
    if (!preg_match('/^[0-9a-f]{40}$/', $sha)) throw new RuntimeException("bad SHA: $sha");

    $target = "$pluginRoot/{$mf['target_dir']}";
    if (!is_dir($target) && !mkdir($target, 0755, true) && !is_dir($target)) {
        throw new RuntimeException("failed to create target dir: $target");
    }

    foreach ($mf['include'] as $name) {
        $src = "$tmp/modules/$name";
        if (!is_dir($src)) throw new RuntimeException("module '$name' not found in source repo at ref {$mf['ref']}");
        $dst = "$target/$name";
        if (strpos("$dst/", "$target/") !== 0) throw new RuntimeException("refusing to sync outside target_dir: $dst");
        if (!is_dir($dst) && !mkdir($dst, 0755, true) && !is_dir($dst)) {
            throw new RuntimeException("failed to create module dir: $dst");
        }
        info("syncing module $name");
        $argv = ['rsync', '-a', '--delete'];
        foreach ($mf['exclude_globs'] as $g) { $argv[] = '--exclude'; $argv[] = $g; }
        $argv[] = "$src/";
        $argv[] = "$dst/";
        run($argv);
    }

    // Sync top-level registry.php + loader.php (cone mode includes root files via the path-to-leaf rule).
    // Soft skip if absent so this script still works against repos that haven't merged the arbitration system yet.
    // Two-phase: copy each to .partial sidecar first; only rename in-place after ALL copies succeed.
    // Avoids the partial-state where one file lands new and the other stays old.
    $rootFiles = ['registry.php', 'loader.php'];
    $partials = [];
    try {
        foreach ($rootFiles as $rootFile) {
            $rfSrc = "$tmp/$rootFile";
            if (!is_file($rfSrc)) continue;
            $rfPartial = "$target/$rootFile.partial";
            if (!copy($rfSrc, $rfPartial)) {
                throw new RuntimeException("failed to copy $rootFile to target");
            }
            $partials["$target/$rootFile"] = $rfPartial;
        }
        foreach ($partials as $finalPath => $partialPath) {
            if (!rename($partialPath, $finalPath)) {
                throw new RuntimeException("failed to rename $partialPath -> $finalPath");
            }
            info('synced root file ' . basename($finalPath));
        }
    } catch (\Throwable $e) {
        foreach ($partials as $partialPath) {
            @unlink($partialPath);
        }
        throw $e;
    }

    $body = "sha=$sha\ntimestamp=" . gmdate('c') . "\nrepo={$mf['repo']}\nref={$mf['ref']}\n";
    if (file_put_contents("$target/.source", $body) === false) {
        throw new RuntimeException("failed to write .source file");
    }

    info('Synced ' . count($mf['include']) . " modules at $sha");
    exit(0);
} catch (\Throwable $e) {
    fail(redact($e->getMessage(), $token));
}
