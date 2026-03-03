import { Codex } from '@openai/codex-sdk';
import type { Raindrop, Summary } from './types.ts';
import { buildSummarizePrompt, buildComposePrompt } from './prompt.ts';

async function summarizeOne(
  codex: Codex,
  raindrop: Raindrop,
): Promise<Summary> {
  const thread = codex.startThread();
  const prompt = buildSummarizePrompt(raindrop);
  const result = await thread.run(prompt);
  return {
    raindrop,
    summary: (result as { finalResponse: string }).finalResponse,
  };
}

export async function summarizeEach(raindrops: Raindrop[]): Promise<Summary[]> {
  const codex = new Codex();
  const results = await Promise.all(raindrops.map(r => summarizeOne(codex, r)));
  return results;
}

export async function composeNewsletter(summaries: Summary[]): Promise<string> {
  const codex = new Codex();
  const thread = codex.startThread();
  const prompt = buildComposePrompt(summaries);
  const result = await thread.run(prompt);
  return (result as { finalResponse: string }).finalResponse;
}
