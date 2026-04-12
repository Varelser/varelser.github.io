import React from 'react';
import { Copy, Target } from 'lucide-react';
import {
  buildProjectWebgpuCapabilityPacket,
  CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
  filterProjectWebgpuCapabilityBuckets,
  getProjectWebgpuCapabilityBuckets,
} from '../lib/projectWebgpuCapabilityCurrent';
import {
  buildProjectIntelMacProofIntakePacket,
  buildProjectIntelMacProofOperatorPacket,
  CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
  filterProjectIntelMacProofBlockers,
} from '../lib/projectIntelMacProofCurrent';
import {
  buildProjectDistributionProofBundlePacket,
  CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
  filterProjectDistributionProofBundles,
  summarizeProjectDistributionProofBundles,
} from '../lib/projectDistributionProofBundleCurrent';

async function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  }
}

export const ControlPanelProjectIOFutureNativeExecutionSurfaces: React.FC = () => {
  const [webgpuMode, setWebgpuMode] = React.useState<'all' | 'direct' | 'limited' | 'fallback-only'>('all');
  const [intelMacProofScope, setIntelMacProofScope] = React.useState<'all' | 'drop' | 'target'>('all');
  const [distributionBundleScope, setDistributionBundleScope] = React.useState<'all' | 'resume' | 'proof'>('all');

  const webgpuBuckets = React.useMemo(
    () => filterProjectWebgpuCapabilityBuckets(getProjectWebgpuCapabilityBuckets(CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT), webgpuMode),
    [webgpuMode],
  );
  const webgpuPacket = React.useMemo(
    () => buildProjectWebgpuCapabilityPacket(webgpuMode, CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT),
    [webgpuMode],
  );
  const intelMacProofBlockers = React.useMemo(
    () => filterProjectIntelMacProofBlockers(CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.blockers, intelMacProofScope),
    [intelMacProofScope],
  );
  const intelMacProofOperatorPacket = React.useMemo(
    () => buildProjectIntelMacProofOperatorPacket(intelMacProofScope, CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT),
    [intelMacProofScope],
  );
  const intelMacProofIntakePacket = React.useMemo(
    () => buildProjectIntelMacProofIntakePacket(CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT),
    [],
  );
  const distributionBundleSummary = React.useMemo(
    () => summarizeProjectDistributionProofBundles(CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT),
    [],
  );
  const distributionBundleEntries = React.useMemo(
    () => filterProjectDistributionProofBundles(CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT.bundles, distributionBundleScope),
    [distributionBundleScope],
  );
  const distributionBundlePacket = React.useMemo(
    () => buildProjectDistributionProofBundlePacket(distributionBundleScope, CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT),
    [distributionBundleScope],
  );

  return (
    <>

      <div className="mt-3 rounded border border-cyan-300/15 bg-cyan-500/[0.05] p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/74">WebGPU current execution surface</div>
            <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
              repo 内で直接閉じている範囲と、target-host artifact が必要な範囲をここで分けて確認できます。
            </div>
          </div>
          <button
            onClick={() => void copyText(webgpuPacket)}
            className="flex items-center gap-1 rounded border border-cyan-300/15 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100/70 transition-colors hover:bg-white/[0.06]"
            title="Copy current WebGPU capability packet"
          >
            <Copy size={11} /> Copy WebGPU
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <button onClick={() => setWebgpuMode('all')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${webgpuMode === 'all' ? 'border-white/20 bg-white/[0.08] text-white/78' : 'border-white/10 text-white/40'}`}>all {CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.direct + CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.limited + CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.fallbackOnly}</button>
          <button onClick={() => setWebgpuMode('direct')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${webgpuMode === 'direct' ? 'border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-100/80' : 'border-white/10 text-white/40'}`}>direct {CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.direct}</button>
          <button onClick={() => setWebgpuMode('limited')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${webgpuMode === 'limited' ? 'border-amber-300/20 bg-amber-500/[0.08] text-amber-100/80' : 'border-white/10 text-white/40'}`}>limited {CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.limited}</button>
          <button onClick={() => setWebgpuMode('fallback-only')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${webgpuMode === 'fallback-only' ? 'border-violet-300/20 bg-violet-500/[0.08] text-violet-100/80' : 'border-white/10 text-white/40'}`}>fallback-only {CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.fallbackOnly}</button>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">remaining warnings {CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.remainingWarnings}</span>
        </div>
        <div className="mt-3 grid gap-2 xl:grid-cols-3">
          {webgpuBuckets.map((bucket) => {
            const bucketTone = bucket.mode === 'direct'
              ? 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/75'
              : bucket.mode === 'limited'
                ? 'border-amber-300/20 bg-amber-500/[0.05] text-amber-100/75'
                : 'border-violet-300/20 bg-violet-500/[0.05] text-violet-100/75';
            return (
              <div key={`webgpu-${bucket.mode}`} className="rounded border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/34">{bucket.label}</div>
                    <div className="mt-1 text-xs font-semibold text-white/84">items {bucket.count}</div>
                  </div>
                  <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${bucketTone}`}>{bucket.mode}</span>
                </div>
                <div className="mt-2 space-y-1 text-panel-sm leading-relaxed text-white/56">
                  {bucket.items.map((item) => (
                    <div key={`${bucket.mode}:${item}`} className="rounded border border-white/10 bg-black/20 px-2 py-1">{item}</div>
                  ))}
                </div>
                <div className="mt-2 text-panel-sm leading-relaxed text-white/42">{bucket.nextAction}</div>
              </div>
            );
          })}
        </div>
      </div>


      <div className="mt-3 rounded border border-sky-300/15 bg-sky-500/[0.05] p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-sky-100/74">Intel Mac proof current surface</div>
            <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
              drop intake と target-host blocker を Project IO から直接見て、operator / intake packet をそのまま渡せます。
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void copyText(intelMacProofOperatorPacket)}
              className="flex items-center gap-1 rounded border border-sky-300/15 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-100/70 transition-colors hover:bg-white/[0.06]"
              title="Copy current Intel Mac proof operator packet"
            >
              <Copy size={11} /> Copy Intel Mac
            </button>
            <button
              onClick={() => void copyText(intelMacProofIntakePacket)}
              className="flex items-center gap-1 rounded border border-white/15 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:bg-white/[0.06]"
              title="Copy Intel Mac intake packet"
            >
              <Target size={11} /> Copy intake
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded border border-sky-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-sky-100/75">verdict {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.verdict}</span>
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.readyForRealCapture ? 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/70' : 'border-white/10 text-white/45'}`}>real capture {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.readyForRealCapture ? 'ready' : 'pending'}</span>
          <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.readyForHostFinalize ? 'border-emerald-300/20 bg-emerald-500/[0.05] text-emerald-100/70' : 'border-white/10 text-white/45'}`}>host finalize {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.readyForHostFinalize ? 'ready' : 'pending'}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">drop {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.dropPassed}/{CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.dropTotal}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">target {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.targetPassed}/{CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.targetTotal}</span>
          <span className="rounded border border-amber-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-amber-100/75">blockers {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.blockerCount}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">structured proof {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.structuredProofFileCount}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">incoming bundles {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.summary.bundleCountBeforeRun}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <button onClick={() => setIntelMacProofScope('all')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${intelMacProofScope === 'all' ? 'border-white/20 bg-white/[0.08] text-white/78' : 'border-white/10 text-white/40'}`}>all {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.blockers.length}</button>
          <button onClick={() => setIntelMacProofScope('drop')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${intelMacProofScope === 'drop' ? 'border-amber-300/20 bg-amber-500/[0.08] text-amber-100/80' : 'border-white/10 text-white/40'}`}>drop {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.blockers.filter((blocker) => blocker.scope === 'drop').length}</button>
          <button onClick={() => setIntelMacProofScope('target')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${intelMacProofScope === 'target' ? 'border-sky-300/20 bg-sky-500/[0.08] text-sky-100/80' : 'border-white/10 text-white/40'}`}>target {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.blockers.filter((blocker) => blocker.scope === 'target').length}</button>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">mode {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.recommendedMode}</span>
        </div>
        <div className="mt-3 grid gap-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded border border-white/10 bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/36">Prioritized actions</div>
            <div className="mt-2 space-y-2">
              {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.prioritizedActions.map((action) => (
                <div key={`intel-priority-${action.id}`} className="rounded border border-white/10 bg-black/20 p-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-sky-100/72">{action.id}</div>
                  <div className="mt-1 text-panel-sm leading-relaxed text-white/54">{action.reason}</div>
                  <div className="mt-2 rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] leading-relaxed text-white/58">{action.command}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {action.outputs.map((output) => (
                      <span key={`${action.id}:${output}`} className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">{output}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded border border-white/10 bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/36">Current blockers</div>
            <div className="mt-2 space-y-2">
              {intelMacProofBlockers.map((blocker) => (
                <div key={`intel-blocker-${blocker.scope}-${blocker.kind}`} className={`rounded border p-2 ${blocker.scope === 'target' ? 'border-sky-300/20 bg-sky-500/[0.05]' : 'border-amber-300/20 bg-amber-500/[0.05]'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/36">{blocker.kind}</div>
                    <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${blocker.scope === 'target' ? 'border-sky-300/20 text-sky-100/75' : 'border-amber-300/20 text-amber-100/75'}`}>{blocker.scope}</span>
                  </div>
                  <div className="mt-1 text-panel-sm leading-relaxed text-white/54">{blocker.target}</div>
                  <div className="mt-2 text-[10px] leading-relaxed text-white/46">{blocker.action}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/36">Next actions</div>
            <div className="mt-2 space-y-1 text-panel-sm leading-relaxed text-white/50">
              {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.nextActions.map((action, index) => (
                <div key={`intel-next-${index}`}>{index + 1}. {action}</div>
              ))}
            </div>
            <div className="mt-3 rounded border border-white/10 bg-black/20 p-2 text-panel-sm text-white/48">
              one-shot ingest / {CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.commands.oneShotIngest}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded border border-emerald-300/15 bg-emerald-500/[0.05] p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/72">Distribution / proof bundle current surface</div>
            <div className="mt-1 text-panel-sm leading-relaxed text-white/42">
              再開用 bundle と proof handoff bundle の選び分けを Project IO から直接確認し、current packet をそのまま渡せます。
            </div>
          </div>
          <button
            onClick={() => void copyText(distributionBundlePacket)}
            className="flex items-center gap-1 rounded border border-emerald-300/15 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100/70 transition-colors hover:bg-white/[0.06]"
            title="Copy current distribution / proof bundle packet"
          >
            <Copy size={11} /> Copy bundles
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded border border-emerald-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-emerald-100/75">total {distributionBundleSummary.total}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">resume {distributionBundleSummary.resume}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">proof {distributionBundleSummary.proof}</span>
          <span className="rounded border border-amber-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-amber-100/75">bootstrap {distributionBundleSummary.bootstrapRequired}</span>
          <span className="rounded border border-sky-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-sky-100/75">intel-mac focus {distributionBundleSummary.intelMacFocused}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">index {CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT.outputDir}/distribution-index_YYYY-MM-DD.json</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <button onClick={() => setDistributionBundleScope('all')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${distributionBundleScope === 'all' ? 'border-white/20 bg-white/[0.08] text-white/78' : 'border-white/10 text-white/40'}`}>all {distributionBundleSummary.total}</button>
          <button onClick={() => setDistributionBundleScope('resume')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${distributionBundleScope === 'resume' ? 'border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-100/80' : 'border-white/10 text-white/40'}`}>resume {distributionBundleSummary.resume}</button>
          <button onClick={() => setDistributionBundleScope('proof')} className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${distributionBundleScope === 'proof' ? 'border-violet-300/20 bg-violet-500/[0.08] text-violet-100/80' : 'border-white/10 text-white/40'}`}>proof {distributionBundleSummary.proof}</button>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">immediate {CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT.quickAdvice.immediateResume}</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/42">verify {CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT.quickAdvice.verifyStatusOnly}</span>
        </div>
        <div className="mt-3 grid gap-2 xl:grid-cols-2">
          {distributionBundleEntries.map((bundle) => (
            <div key={`distribution-bundle-${bundle.id}`} className={`rounded border bg-black/20 p-3 ${bundle.category === 'proof' ? 'border-violet-300/15' : 'border-emerald-300/15'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/34">{bundle.classId}</div>
                  <div className="mt-1 text-xs font-semibold text-white/84">{bundle.id}</div>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  <span className={`rounded border px-1.5 py-0.5 text-[8px] uppercase tracking-widest ${bundle.category === 'proof' ? 'border-violet-300/20 text-violet-100/75' : 'border-emerald-300/20 text-emerald-100/75'}`}>{bundle.category}</span>
                  {bundle.requiresBootstrap ? <span className="rounded border border-amber-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-amber-100/75">bootstrap</span> : null}
                  {bundle.intelMacFocused ? <span className="rounded border border-sky-300/20 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-sky-100/75">intel-mac</span> : null}
                </div>
              </div>
              <div className="mt-2 text-panel-sm leading-relaxed text-white/54">{bundle.recommendedUse}</div>
              <div className="mt-2 rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] leading-relaxed text-white/58">{bundle.command}</div>
              <div className="mt-2 text-[10px] leading-relaxed text-white/46">{bundle.chooseThisWhen}</div>
              <div className="mt-2 text-[10px] leading-relaxed text-white/38">instead: {bundle.preferInstead}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">source {bundle.includesSource ? 'yes' : 'no'}</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">node_modules {bundle.includesNodeModules ? 'yes' : 'no'}</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-white/45">archive {bundle.archivePattern}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
};
