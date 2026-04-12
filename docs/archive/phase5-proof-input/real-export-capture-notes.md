# Real Export Capture Notes

- status: seeded baseline fixture for manifest/readiness plumbing
- source: repository baseline project payload
- host: documentation-side scaffold
- next required external proof: capture a real browser export on the Intel Mac target host and replace or add fixture(s) here
- command sequence after real capture:
  - `npm run generate:phase5-real-export-manifest`
  - `npm run generate:phase5-real-export-readiness-report`
  - `node scripts/verify-live-browser-readiness.mjs --write docs/archive/live-browser-readiness.json`
