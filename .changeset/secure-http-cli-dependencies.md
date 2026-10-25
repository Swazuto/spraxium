---
"@spraxium/cli": patch
"@spraxium/common": patch
"@spraxium/components": patch
"@spraxium/core": patch
"@spraxium/env": patch
"@spraxium/http": patch
"@spraxium/i18n": patch
"@spraxium/logger": patch
"@spraxium/schedule": patch
"@spraxium/signal": patch
"@spraxium/signal-client": patch
"@spraxium/webhook": patch
---

Require patched Hono and shell-quote releases to address upstream security vulnerabilities.

Require Node.js 22.23.4+, 24.22.1+, or 26.12.1+ within the respective supported major release line to include the October 21, 2026 security fixes, including CVE-2026-111497 in the Brotli decoder. Update development and CI runtimes to the patched releases.

Remove the transitive sprintf-js dependency from Changesets tooling by upgrading its CommonJS-compatible YAML file reader to use js-yaml 4. The associated GHSA-hp3w-g68c-fv3c advisory was withdrawn on October 22, 2026 and has no patched sprintf-js release.
