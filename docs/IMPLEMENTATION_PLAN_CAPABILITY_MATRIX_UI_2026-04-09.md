# Implementation Plan — Capability Matrix UI / Project I/O coverage

## Goal
Expose future-native capability coverage directly inside mainline Project I/O so operators can see, copy, and hand off family-level readiness without relying on generated files outside the UI.

## Highest-efficiency path
1. Build a lightweight project-scoped future-native capability matrix from registry + scene bindings + manifest routes.
2. Surface that matrix inside Project I/O with counts, warnings, direct-activation visibility, and copyable implementation packet.
3. Keep the path low-risk by avoiding heavy preview builders inside unit tests.
4. Verify with typecheck + unit tests + full zip packaging.

## Scope
- Project I/O future-native section
- Future-native capability matrix builder
- Copyable implementation packet
- Unit coverage for matrix/packet basics

## Done in this pass
- Added `lib/projectFutureNativeCapabilityMatrix.ts`
- Wired `presets` through Project I/O so the future-native section can build project-scoped coverage
- Added capability matrix cards + packet copy button to Project I/O
- Added unit test for capability matrix / packet output
- Repacked full-local-dev zip
