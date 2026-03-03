import type { Raindrop, Summary } from './types.ts';

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
- 記事の主要な主張・情報を簡潔にまとめること (3〜5文程度)
- 技術的な内容はできるだけ具体的に書くこと
- 元のURLは含めなくてよい (後で別途付与する)`;
}

export function buildComposePrompt(summaries: Summary[]): string {
  const entries = summaries
    .map((s, i) => {
      return `[${i + 1}] ${s.raindrop.title}
URL: ${s.raindrop.link}
要約: ${s.summary}`;
    })
    .join('\n\n');

  return `以下は最近ブックマークした記事の要約メモです。
これらをもとに、ニュースレター風の文章を1つ作成してください。

ルール:
- 個別記事の要約を並べるのではなく、全体を通した自然な流れのある文章にすること
- 似たテーマの記事はまとめて紹介すること
- Podcastで色々な事象を自然に紹介するようなトーンで
- 各記事への元リンクを文中に含めること (読者が興味を持ったら元記事を読めるように)
- 日本語で書くこと
- Markdown形式で出力すること
- タイトルをつけること

記事一覧:
${entries}`;
}
