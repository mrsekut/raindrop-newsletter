import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function writeOutput(
  markdown: string,
  outputDir: string,
): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const filePath = join(outputDir, `${date}.md`);

  await Bun.write(filePath, markdown);
  return filePath;
}
