import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
rmSync('site/play', { recursive: true, force: true });
mkdirSync('site/play', { recursive: true });
cpSync('dist', 'site/play', { recursive: true });
writeFileSync('site/play/release.json', JSON.stringify({ revision, builtAt: new Date().toISOString() }) + '\n');
