# Intel Mac Proof Operator Packet Plan — 2026-04-09

Goal: reduce the remaining external blocker to a single guided operator flow by turning the existing proof scripts into one repeatable preparation packet.

## Targets
1. Emit a single operator packet JSON/MD that states the exact missing artifacts, commands, and output paths.
2. Mirror that packet into the drop directory so the Intel Mac operator can work without opening the repo docs tree.
3. Add a single prepare command that scaffolds the drop, emits the capture kit, verifies the drop, regenerates status/blockers, and writes the operator packet.

## Acceptance
- `npm run prepare:intel-mac-live-browser-proof-drop` completes without requiring real proof artifacts.
- `docs/archive/intel-mac-live-browser-proof-operator-packet.json` exists.
- `docs/archive/intel-mac-live-browser-proof-operator-packet.md` exists.
- `exports/intel-mac-live-browser-proof-drop/OPERATOR_PACKET.md` exists.
- `exports/intel-mac-live-browser-proof-drop/OPERATOR_PACKET.json` exists.
