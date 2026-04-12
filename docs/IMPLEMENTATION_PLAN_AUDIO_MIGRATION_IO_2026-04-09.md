# Audio migration IO pass — 2026-04-09

## Goal
Push audio legacy migration work past panel-only actions and into export / manifest / handoff.

## Implemented
- Add `audioLegacyManualQueue` to project manifest.
- Generate current/stored/combined manual queue counts and head keys from config + presets + keyframes.
- Add `ProjectAudioLegacyMigrationPacket` formatter for copy/paste handoff.
- Expose the new manifest section and copy action in Project I/O.

## Verify
- typecheck
- unit tests
- audio bulk verify
- package full zip
