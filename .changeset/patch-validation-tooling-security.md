---
"@spraxium/http": patch
"@spraxium/signal": patch
---

Require Zod 4.6.6 or newer in the 4.x release line to address oversized collection validation exhausting memory. Signal schema consumers must upgrade their direct zod dependency to Zod 4 before passing schemas to @OnSignal. Add a signed Signal payload regression test covering early collection-bound rejection and subsequent valid dispatch.

Update Vitest and @vitest/mocker to 4.1.12, Vite to 6.4.4 or newer in the 6.x release line, Undici to 6.29.1 and fast-uri to 3.1.9 to address the remaining development-server, mock registration, HTTP decoding, EventSource and URI normalization advisories.
