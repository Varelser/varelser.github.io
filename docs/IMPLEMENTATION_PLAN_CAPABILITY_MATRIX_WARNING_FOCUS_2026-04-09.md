# Implementation plan — capability matrix warning focus (2026-04-09)

## Goal
Make future-native capability gaps directly actionable inside Project I/O by adding warning filters, search, and a copyable warning-focus packet.

## Scope
1. Add row filtering helpers for search / exposure / active-manifest status / warnings-only.
2. Add Project I/O controls for warning focus and reset.
3. Add copyable warning packet for filtered families.
4. Add a unit test to confirm warning-focused filtering still returns specialist warning rows.

## Done when
- Capability matrix can be filtered in-panel without editing files.
- Users can copy a warning-focused packet for the current filter state.
- Typecheck and unit tests pass.
