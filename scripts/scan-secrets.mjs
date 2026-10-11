import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Heuristic scan only: report categories/counts without printing credential values.
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{60,})\b/g],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
  ['OpenAI key', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}\b/g],
  ['Google API key', /\bAIza[A-Za-z0-9_-]{35}\b/g],
  ['credential URL', /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s:@]+:[^\s@]+@/g],
  ['assigned credential', /(?:api[_-]?key|secret[_-]?key|access[_-]?token|password)\s*[:=]\s*["'][A-Za-z0-9_\-/+]{24,}["']/gi],
];
const history = execFileSync('git', ['log', '--all', '-p', '--no-ext-diff', '--format=commit %H'], { maxBuffer: 100 * 1024 * 1024 }).toString();
const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
  .toString().split('\0').filter(path => /\.(?:[cm]?js|tsx?|json|ya?ml|md|css|svg|txt|py)$/.test(path));
const current = paths.map(path => readFileSync(path, 'utf8')).join('\n');
let found = 0;
for (const [name, pattern] of patterns) {
  const count = [...(history + '\n' + current).matchAll(pattern)].length;
  console.log(`${name}: ${count} recognizable matches in commit diffs/current source`);
  found += count;
}
console.log('Commits scanned:', execFileSync('git', ['rev-list', '--all', '--count']).toString().trim());
process.exitCode = found ? 1 : 0;
