import React from 'react';

const lockedButton = (label: string, extraProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {}) => (
  <button
    type="button"
    title="Locked in public build"
    disabled
    className="rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/50 disabled:cursor-not-allowed"
    {...extraProps}
  >
    {label}
  </button>
);

const actionButton = (label: string) => (
  <button
    type="button"
    className="rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100"
  >
    {label}
  </button>
);

const AppInlineVerify: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">KALOKAGATHIA</div>
            <h1 className="mt-2 text-2xl font-semibold">Public Exhibition Verify Shell</h1>
          </div>
          <div className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
            public library scope
          </div>
        </header>

        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
          Public exhibition mode: scene parameters and sequence editing are locked. You can still load, morph, play, and export.
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-medium">Bundled Presets</h2>
            <p className="mt-3 text-sm text-white/75">
              Public build: bundled presets are read-only. Update <code className="font-mono">public-library.json</code> from your private workspace and redeploy.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {lockedButton('', { 'aria-label': 'Randomize preset' })}
              {lockedButton('Reset')}
              {lockedButton('Rename')}
              {lockedButton('Delete')}
              {actionButton('Load')}
              {actionButton('Morph')}
              <button type="button" className="rounded border border-white/20 px-3 py-2 text-sm text-white/80">
                Browse Library
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-medium">Playlist</h2>
            <p className="mt-3 text-sm text-white/75">
              Playlist structure is bundled in the public build. Playback stays available, but edits stay in the private workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {actionButton('Play Sequence')}
              {lockedButton('Add Step')}
              {lockedButton('Duplicate Step')}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppInlineVerify;
