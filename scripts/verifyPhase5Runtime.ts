export type VerificationResult = { id: string; checks: string[] };
export type VerificationStep<T extends VerificationResult = VerificationResult> = { id: string; run: () => T };
export type VerificationProfileResult<T extends VerificationResult = VerificationResult> = {
  profile: string;
  verifiedScenarioCount: number;
  durationMs: number;
  scenarios: Array<T & { durationMs: number }>;
};

const now = () => Date.now();

export function runVerificationSteps<T extends VerificationResult>(
  profile: string,
  logPrefix: string,
  steps: VerificationStep<T>[],
): VerificationProfileResult<T> {
  const startedAt = now();
  const scenarios: Array<T & { durationMs: number }> = [];

  for (const [index, step] of steps.entries()) {
    const stepStartedAt = now();
    console.error(`[${logPrefix}] ${index + 1}/${steps.length} ${step.id} start`);
    const result = step.run();
    const durationMs = now() - stepStartedAt;
    console.error(`[${logPrefix}] ${index + 1}/${steps.length} ${step.id} done ${durationMs}ms`);
    scenarios.push({
      ...result,
      durationMs,
    });
  }

  return {
    profile,
    verifiedScenarioCount: scenarios.length,
    durationMs: now() - startedAt,
    scenarios,
  };
}
