import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'AUDIO_REACTIVE_ARCHITECTURE.md',
  'AUDIO_REACTIVE_ROADMAP.md',
  'AUDIO_REACTIVE_AI_HANDOFF.md',
  'AUDIO_REACTIVE_PROGRESS.md',
  'components/controlPanelTabsAudio.tsx',
  'components/controlPanelTabsAudioSynth.tsx',
  'lib/audioReactiveConfig.ts',
  'lib/audioReactiveRuntime.ts',
  'lib/audioReactiveValidation.ts',
  'tsconfig.audio-reactive.json'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const progressText = fs.readFileSync(path.join(root, 'AUDIO_REACTIVE_PROGRESS.md'), 'utf8');
const coverageText = fs.readFileSync(path.join(root, 'AUDIO_REACTIVE_COVERAGE_MATRIX.md'), 'utf8');

const phaseMatches = Array.from(new Map(Array.from(progressText.matchAll(/^\- Phase ([A-H]).*?:\s*(\d+)%$/gm)).map((m) => [m[1], { phase: m[1], percent: Number(m[2]) }])).values());
const liveSystemsMatch = coverageText.match(/live systems:\s*(\d+)/i) || progressText.match(/live systems:\s*(\d+)/i);
const liveTargetsMatch = coverageText.match(/live targets:\s*(\d+)/i) || progressText.match(/live targets:\s*(\d+)/i);

const result = {
  ok: missing.length === 0 && phaseMatches.length > 0,
  missingFiles: missing,
  phases: phaseMatches,
  liveSystems: liveSystemsMatch ? Number(liveSystemsMatch[1]) : null,
  liveTargets: liveTargetsMatch ? Number(liveTargetsMatch[1]) : null
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
