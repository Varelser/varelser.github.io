# Dead code prune

- Unexported low-risk symbols that had no external references.
- Removed two unused helper functions entirely: `createAudioFeatureFrameReader`, `cloneAudioFeatureFrame`.
- Preserved runtime behavior and public call sites used by current UI / verification paths.
