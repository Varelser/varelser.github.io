import { verifyFixtureFileParsing } from './verifyPhase5FixtureScenarios';
export async function main() {
  console.log(JSON.stringify(verifyFixtureFileParsing(), null, 2));
}
