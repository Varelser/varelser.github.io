import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const files = [
  'components/controlPanelTabsAudio.tsx',
  'components/controlPanelTabsAudioSynth.tsx',
  'lib/appStateDefaultAudioSynth.ts',
  'lib/appStateConfigNormalization.ts',
  'lib/audioFeatureFrame.ts',
  'lib/audioReactiveConfig.ts',
  'lib/audioReactiveDebug.ts',
  'lib/audioReactiveIO.ts',
  'lib/audioReactivePresets.ts',
  'lib/audioReactiveRegistry.ts',
  'lib/audioReactiveRuntime.ts',
  'lib/audioReactiveTargetSets.ts',
  'lib/audioReactiveValidation.ts',
  'lib/audioSeedMutation.ts',
  'lib/audioSequenceTriggerPresets.ts',
  'lib/useSequenceAudioTriggers.ts',
  'types/audioReactive.ts',
  'types/configAudio.ts'
];

const diagnostics = [];
for (const relativePath of files) {
  const abs = path.join(root, relativePath);
  const source = fs.readFileSync(abs, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      allowImportingTsExtensions: true
    },
    fileName: relativePath,
    reportDiagnostics: true
  });
  for (const diagnostic of result.diagnostics ?? []) {
    diagnostics.push({
      file: relativePath,
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    });
  }
}

const payload = {
  ok: diagnostics.length === 0,
  fileCount: files.length,
  diagnostics
};
console.log(JSON.stringify(payload, null, 2));
if (!payload.ok) process.exit(1);
