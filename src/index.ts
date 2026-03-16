import { loadConfig } from './config.ts';
import { fetchLatest, fetchSince } from './raindrop.ts';
import { loadState, saveState } from './state.ts';
import { writeOutput } from './output.ts';
import {
  summarizeEach,
  clusterSummaries,
  composeNewsletter,
} from './summarize.ts';

async function main() {
  const config = loadConfig();
  const state = await loadState();

  const raindrops = await (async () => {
    if (state) {
      const since = new Date(state.lastRun);
      console.log(`前回実行: ${state.lastRun}`);
      const items = await fetchSince(config.raindropToken, since);
      console.log(`新規: ${items.length} 件`);
      return items;
    }
    console.log('初回実行: 最新15件を取得');
    const items = await fetchLatest(config.raindropToken, 15);
    console.log(`取得: ${items.length} 件`);
    return items;
  })();

  if (raindrops.length === 0) {
    console.log('新しいアイテムはありません。');
    return;
  }

  for (const r of raindrops) {
    console.log(`  [${r.tags.join(', ')}] ${r.title}`);
    console.log(`    ${r.link}`);
  }

  console.log('\n各記事を要約中...');
  const summaries = await summarizeEach(raindrops);
  console.log(`要約完了: ${summaries.length} 件`);

  console.log('記事をクラスタリング中...');
  const clusterResult = await clusterSummaries(summaries);
  console.log(
    `クラスタ: ${clusterResult.clusters.length} 個, 単独: ${clusterResult.standalone.length} 件`,
  );

  console.log('ニュースレターを構成中...');
  const markdown = await composeNewsletter(summaries, clusterResult);

  const filePath = await writeOutput(markdown, config.outputDir);
  console.log(`\n出力: ${filePath}`);

  await saveState(new Date());
  console.log('状態を保存しました。');
}

main().catch(console.error);
