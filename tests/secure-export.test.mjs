import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { contentPolicy, secureHtml } from '../scripts/secure-export.mjs';

test('allows exact hydration content while denying other inline JavaScript', () => {
  const script = 'self.__next_f.push([1,"hydration"]);';
  const html = `<html><head></head><body><script>${script}</script><script src="/app.js"></script></body></html>`;
  const policy = contentPolicy(html);
  const hash = createHash('sha256').update(script).digest('base64');
  const attackerHash = createHash('sha256').update('alert(document.cookie)').digest('base64');
  assert.ok(policy.includes(`'sha256-${hash}'`));
  assert.ok(!policy.includes(attackerHash));
  const scriptDirective = policy.split('; ').find(rule => rule.startsWith('script-src '));
  assert.ok(!scriptDirective.includes("'unsafe-inline'"));
  assert.ok(!scriptDirective.includes("'unsafe-eval'"));
  for (const directive of ["object-src 'none'", "base-uri 'none'", "form-action 'none'", "connect-src 'self'"]) assert.ok(policy.includes(directive));
});
test('places the policy before resources and is idempotent', () => {
  const html = '<html><head><script src="/app.js"></script></head><body><script>window.ready=true</script></body></html>';
  const secured = secureHtml(html);
  assert.ok(secured.indexOf('http-equiv="Content-Security-Policy"') < secured.indexOf('<script'));
  assert.equal(secureHtml(secured), secured);
  assert.equal((secured.match(/data-export-csp/g) ?? []).length, 1);
});
test('does not silently leave an unprotected document', () => {
  assert.throws(() => secureHtml('<body>missing head</body>'), /no head/);
});
