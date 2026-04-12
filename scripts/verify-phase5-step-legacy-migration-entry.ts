import { verifyLegacyMigrationRebuild } from './verifyPhase5FixtureScenarios';
export async function main() {
  console.log(JSON.stringify(verifyLegacyMigrationRebuild(), null, 2));
}
