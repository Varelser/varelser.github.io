# FUTURE NATIVE FAMILIES — PBD CLOTH NATIVE STARTER

This starter adds a grid-cloth topology on top of shared PBD helpers.

Included:
- structural / shear / bend distance links
- top-corner / top-edge / left-edge pin modes
- pulse force for drape response
- floor collision
- spacing-based self collision guard
- dedicated verifier

Current limits:
- no circle/capsule collider coupling yet
- no tearing
- no wind field integration
- no project export/import block yet

Verification:
- `npm run verify:pbd-cloth`

Next targets:
1. pin-and-drape presets
2. obstacle colliders
3. tear handoff
4. membrane inflation sibling
