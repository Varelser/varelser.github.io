import { DEFAULT_REFRESH_REPO_STATUS_STAGES, runRefreshRepoStatus } from './refreshRepoStatusShared.mjs';

runRefreshRepoStatus({
  stages: DEFAULT_REFRESH_REPO_STATUS_STAGES,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
