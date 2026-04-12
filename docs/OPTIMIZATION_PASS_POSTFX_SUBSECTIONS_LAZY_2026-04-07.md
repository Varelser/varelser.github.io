# PostFX subsections lazy

- Split PostFX stack bundles into a lazy subsection.
- Split PostFX advanced sliders into a lazy subsection gated by enabled toggles.
- Build completed without preload entries for PostFX chunks.
- Resulting runtime chunks remained scene-postfx + scene-postfx-vendor; dedicated subsection names were not emitted by Rollup in this build.
