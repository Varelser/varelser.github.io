# Target Host Intel Mac Closeout

- Generated: 2026-04-06T12:22:14.751Z
- Run ID: 2026-04-06T12-22-14-617Z
- Target host: darwin/x64
- Current host: linux/x64/gnu
- Dry run: yes
- Browser executable: missing
- Steps passed: 0
- Steps failed: 0
- Steps blocked: 0
- Steps skipped: 11

## Steps

| Step | Status | Reason |
| --- | --- | --- |
| npm-install-optional | SKIPPED | not requested |
| playwright-install-chromium | SKIPPED | not requested |
| inspect-intel-mac-runtime | DRY-RUN | dry-run |
| inspect-intel-mac-live-browser-readiness | DRY-RUN | dry-run |
| build | DRY-RUN | dry-run |
| verify-phase4 | DRY-RUN | dry-run |
| verify-phase5 | DRY-RUN | dry-run |
| live-server | SKIPPED | dry-run |
| verify-all-browser-live | DRY-RUN | dry-run |
| intel-mac-live-browser-proof-pipeline | SKIPPED | proof pipeline explicitly skipped |
| doctor-package-handoff | DRY-RUN | dry-run |

## Notes

- Playwright Chromium executable is not currently resolved. Use --install-playwright-chromium or pass --browser-executable-path on the target host.

