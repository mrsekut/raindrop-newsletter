import { loadConfig } from './src/config.ts';
import { fetchLatest, fetchSince } from './src/raindrop.ts';
import { loadState, saveState } from './src/state.ts';
import { writeOutput } from './src/output.ts';

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

  // TODO: PR2 で summarizeEach + composeNewsletter を実装
  const placeholder = raindrops
    .map(r => `- [${r.title}](${r.link})`)
    .join('\n');
  const markdown = `# Newsletter ${new Date().toISOString().split('T')[0]}\n\n${placeholder}\n`;

  const filePath = await writeOutput(markdown, config.outputDir);
  console.log(`\n出力: ${filePath}`);

  await saveState(new Date());
  console.log('状態を保存しました。');
}

main().catch(console.error);
