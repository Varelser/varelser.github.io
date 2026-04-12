import { verifyReplaceModePreservesStableIds } from './verifyPhase5ImportScenarios';
export async function main() {
  console.log(JSON.stringify(verifyReplaceModePreservesStableIds(), null, 2));
}
