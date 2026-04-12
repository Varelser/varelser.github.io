import assert from 'node:assert/strict';
import {
  buildProjectDistributionProofBundleManifestDeltaValues,
  buildProjectDistributionProofBundleManifestSummary,
  buildProjectDistributionProofBundlePacket,
  CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
  filterProjectDistributionProofBundles,
  summarizeProjectDistributionProofBundles,
} from '../../lib/projectDistributionProofBundleCurrent';

const summary = summarizeProjectDistributionProofBundles(CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT);
assert.equal(summary.total, 6, 'should expose all current bundle lanes');
assert.equal(summary.resume, 3, 'should expose three resume bundles');
assert.equal(summary.proof, 3, 'should expose three proof bundles');
assert.equal(summary.bootstrapRequired, 1, 'only source-only-clean should require bootstrap');
assert.equal(summary.intelMacFocused, 1, 'one bundle should focus on Intel Mac proof');

const manifestSummary = buildProjectDistributionProofBundleManifestSummary(CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT);
assert.equal(manifestSummary.immediateResume, 'full-local-dev');
assert.equal(manifestSummary.lightweightHandoff, 'source-only-clean');
assert.deepEqual(
  manifestSummary.bundleIds,
  ['full-local-dev', 'source-only-clean', 'proof-packet-verify-status', 'proof-packet-intel-mac-closeout', 'proof-packet', 'platform-specific-runtime-bundled'],
  'manifest summary should capture current bundle ids in order',
);

const proofOnly = filterProjectDistributionProofBundles(CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT.bundles, 'proof');
assert.deepEqual(
  proofOnly.map((bundle) => bundle.id),
  ['proof-packet-verify-status', 'proof-packet-intel-mac-closeout', 'proof-packet'],
  'proof filter should keep verify-status, intel-mac-closeout, and combined proof bundles',
);

const packet = buildProjectDistributionProofBundlePacket('proof', CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT);
assert.match(packet, /scope=proof/, 'packet should record scope');
assert.match(packet, /verifyStatusOnly=proof-packet-verify-status/, 'packet should expose quick advice');
assert.match(packet, /\[bundle:proof-packet-intel-mac-closeout\]/, 'packet should include Intel Mac proof bundle');
assert.doesNotMatch(packet, /\[bundle:full-local-dev\]/, 'proof packet should exclude resume bundles');

const driftValues = buildProjectDistributionProofBundleManifestDeltaValues({
  ...manifestSummary,
  verifyStatusOnly: 'proof-packet',
  bundleIds: manifestSummary.bundleIds.slice(0, 5),
});
assert.deepEqual(
  driftValues,
  ['quickAdvice:verifyStatusOnly', 'bundles'],
  'manifest delta should detect quick advice and bundle inventory drift',
);

assert.deepEqual(
  buildProjectDistributionProofBundleManifestDeltaValues(undefined),
  ['manifest:missing'],
  'missing manifest summary should be explicit',
);

console.log('projectDistributionProofBundleCurrent ok');
