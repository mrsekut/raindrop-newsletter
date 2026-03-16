import type { Raindrop, Summary, ClusterResult } from './types.ts';

export function buildSummarizePrompt(raindrop: Raindrop): string {
  return `以下のブックマークの内容を要約してください。
URLにアクセスして記事の内容を読み込んだ上で、要点をまとめてください。

- タイトル: ${raindrop.title}
- URL: ${raindrop.link}
- ドメイン: ${raindrop.domain}
- タグ: ${raindrop.tags.join(', ')}
- 抜粋: ${raindrop.excerpt}
- メモ: ${raindrop.note}

ルール:
- 日本語で書くこと
- 元記事を読まなくても内容が把握できるレベルの詳しさで書くこと
- 記事の主張とその根拠・具体例をセットで書くこと
- 技術的な内容は具体的に (ライブラリ名、手法名、コード例の概要など)
- 「何が新しいのか」「なぜ重要なのか」が伝わるように書くこと
- 分量は5〜10文程度を目安に、記事の濃さに応じて調整すること
- 元のURLは含めなくてよい (後で別途付与する)`;
}

export function buildClusterPrompt(summaries: Summary[]): string {
  const entries = summaries
    .map((s, i) => {
      return `[${i}] ${s.raindrop.title}
タグ: ${s.raindrop.tags.join(', ')}
要約: ${s.summary}`;
    })
    .join('\n\n');

  return `以下の記事要約リストを読み、関連性の高い記事同士をグループ化してください。

ルール:
- 本当にテーマが近い記事だけをグループにすること (無理にまとめない)
- 2記事以上で共通のテーマがある場合のみクラスタにする
- どのクラスタにも属さない記事は standalone として列挙する
- 各クラスタにはテーマを表す短いラベルをつけること

以下のJSON形式で出力してください。JSON以外は出力しないでください。

{
  "clusters": [
    { "theme": "テーマのラベル", "summaryIndices": [0, 3] }
  ],
  "standalone": [1, 2, 4]
}

記事一覧:
${entries}`;
}

export function buildComposePrompt(
  summaries: Summary[],
  clusterResult: ClusterResult,
): string {
  const clusterSections = clusterResult.clusters
    .map(c => {
      const articles = c.summaryIndices
        .map(i => {
          const s = summaries[i];
          return `  - ${s.raindrop.title} (${s.raindrop.link})\n    ${s.summary}`;
        })
        .join('\n');
      return `【クラスタ: ${c.theme}】\n${articles}`;
    })
    .join('\n\n');

  const standaloneSections = clusterResult.standalone
    .map(i => {
      const s = summaries[i];
      return `【単独】${s.raindrop.title} (${s.raindrop.link})\n  ${s.summary}`;
    })
    .join('\n\n');

  return `以下は最近ブックマークした記事の要約メモです。
関連する記事はクラスタとしてグループ化済みです。
これらをもとに、ニュースレター風の文章を作成してください。

ルール:
- クラスタに属する記事群は、統合的に語ること
  - 個別の要約を並べるのではなく、共通するテーマや対比を軸に一つの話として書く
  - 「Aの記事ではこう言っていて、Bの記事ではこういうアプローチを取っている」のように繋げる
  - 各記事の具体的な中身もしっかり盛り込むこと (要約が薄くならないように)
- 単独の記事はそのまま一つのセクションとして紹介すること
  - 要約の情報量を落とさず、読みごたえのある紹介にする
- 各記事への元リンクを文中に含めること (読者が興味を持ったら元記事を読めるように)
- Podcastで色々な事象を自然に紹介するようなトーンで
- 日本語で書くこと
- Markdown形式で出力すること
- 全体にタイトルをつけること

${clusterSections}

${standaloneSections}`;
}
