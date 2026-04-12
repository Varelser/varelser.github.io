import { spawnSync } from 'node:child_process';

const env = { ...process.env };
delete env.NPM_CONFIG_REGISTRY;
delete env.npm_config_registry;
delete env.npm_config__auth;
delete env.npm_config_userconfig;
env.npm_config_registry = 'https://registry.npmjs.org/';

const result = spawnSync('npm', ['ci', '--ignore-scripts', '--registry=https://registry.npmjs.org/'], {
  stdio: 'inherit',
  env,
});

if (typeof result.status === 'number') process.exit(result.status);
process.exit(1);
