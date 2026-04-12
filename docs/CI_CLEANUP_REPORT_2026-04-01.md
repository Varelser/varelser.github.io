# CI cleanup report — 2026-04-01

## Applied changes

1. Normalized `package-lock.json` tarball `resolved` URLs from the internal Artifactory mirror to `https://registry.npmjs.org/...`.
2. Updated `.npmrc` to keep `legacy-peer-deps=true` and explicitly pin `registry=https://registry.npmjs.org/`.
3. Updated `.github/workflows/deploy-pages.yml` so `actions/setup-node` also uses `registry-url: https://registry.npmjs.org` and caches against `package-lock.json`.
4. Removed `.vercel/` from the packaged project tree.

## Notes

- This cleanup removes the previous dependency on an internal registry URL embedded in the lockfile.
- Runtime validation of `npm ci` against the public npm registry was not possible in this container because outbound registry access is restricted here.
- Static validation performed after cleanup:
  - no internal Artifactory URL remains anywhere in the packaged project tree
  - `npm run typecheck` passes
  - `npm run build` passes in the current unpacked environment
