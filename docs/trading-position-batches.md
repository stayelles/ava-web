# Ava S position batches — local Web update

Ava Cloud's instant-signal form now accepts an integer number of positions per dispatch (1–500) and a reference price. More than one position requires a reference price. Every follower can lower the requested count to its own plan and remaining capacity. Confirmation reports the responding account's confirmed/requested count, including partial execution.

Cloud configuration exposes separate Boom SELL/BUY and Crash BUY/SELL cadence counts. Existing configuration, preset and submission paths are retained. Backend validation remains authoritative.

Validation: TypeScript and Next.js production compilation passed for version 0.5.92. A browser fixture using the real CloudTab, mocked fetch and a CSP blocking external connections produced a Crash SELL simulation request for 4 positions at reference 6100. No real account, signal or payment was involved.

This source is pushed on a feature branch only. The main branch triggers Hostinger deployment and must not be updated until explicitly authorized. Backend migration/function rollout and compatible packaged Desktop verification are still required before public availability.
