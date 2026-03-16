import { Codex } from '@openai/codex-sdk';
import type { Raindrop, Summary, ClusterResult } from './types.ts';
import {
  buildSummarizePrompt,
  buildClusterPrompt,
  buildComposePrompt,
} from './prompt.ts';

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

export async function summarizeEach(
  raindrops: Raindrop[],
): Promise<Summary[]> {
  const codex = new Codex();
  const results = await Promise.all(
    raindrops.map(r => summarizeOne(codex, r)),
  );
  return results;
}

export async function clusterSummaries(
  summaries: Summary[],
): Promise<ClusterResult> {
  const codex = new Codex();
  const thread = codex.startThread();
  const prompt = buildClusterPrompt(summaries);
  const result = await thread.run(prompt);
  const response = (result as { finalResponse: string }).finalResponse;

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // フォールバック: クラスタリング失敗時は全て standalone
    return {
      clusters: [],
      standalone: summaries.map((_, i) => i),
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ClusterResult;
    return parsed;
  } catch {
    return {
      clusters: [],
      standalone: summaries.map((_, i) => i),
    };
  }
}

export async function composeNewsletter(
  summaries: Summary[],
  clusterResult: ClusterResult,
): Promise<string> {
  const codex = new Codex();
  const thread = codex.startThread();
  const prompt = buildComposePrompt(summaries, clusterResult);
  const result = await thread.run(prompt);
  return (result as { finalResponse: string }).finalResponse;
}
