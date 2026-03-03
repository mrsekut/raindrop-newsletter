import type { Config } from './types.ts';

export function loadConfig(): Config {
  const raindropToken = process.env['RAINDROP_TOKEN'];
  if (!raindropToken) {
    throw new Error('RAINDROP_TOKEN is not set in .env');
  }

  const outputDir = process.env['OUTPUT_DIR'] ?? './output';

  return { raindropToken, outputDir };
}
