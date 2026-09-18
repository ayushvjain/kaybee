/*
 * Runs `astro dev` in the foreground.
 *
 * Astro 7 daemonises the dev server and gives it a hardcoded 30 second window
 * to become ready. Keystatic's dependency graph is large enough that Vite's
 * first pre-bundle can exceed that on a cold cache, and the watchdog then kills
 * a server that was starting perfectly well. Setting ASTRO_DEV_BACKGROUND=1 is
 * how Astro marks its own child process, so the server runs inline with no
 * watchdog. Ctrl+C stops it as usual.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const astroBin = resolve(dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');

const child = spawn(process.execPath, [astroBin, 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '1' },
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
