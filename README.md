# raindrop-newsletter

Fetches your recent bookmarks from [Raindrop.io](https://raindrop.io/), summarizes each article using the Codex SDK, and composes them into a markdown newsletter.

## Setup

```bash
bun install
```

Create a `.env` file:

```
RAINDROP_TOKEN=your_raindrop_api_token
OUTPUT_DIR=./output  # optional, defaults to ./output
```

## Usage

```bash
bun run src/index.ts
```

On the first run, it fetches the latest 15 bookmarks. On subsequent runs, it fetches only new bookmarks since the last run. The generated newsletter is saved as a dated markdown file in the output directory.
