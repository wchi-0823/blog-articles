import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';

const SOURCE_DIR = 'source';
const ZENN_DIR = 'articles';
const QIITA_DIR = 'public';

function buildZennFrontmatter(data) {
  return {
    title: data.title,
    emoji: data.emoji ?? '📝',
    type: data.type ?? 'tech',
    topics: data.tags ?? [],
    published: data.private === true ? false : true,
  };
}

function buildQiitaFrontmatter(data, existingFrontmatter) {
  return {
    title: data.title,
    tags: (data.tags ?? []).map((tag) => ({ name: tag })),
    private: data.private === true,
    updated_at: existingFrontmatter?.updated_at ?? '',
    id: existingFrontmatter?.id ?? null,
    organization_url_name: existingFrontmatter?.organization_url_name ?? null,
    slide: existingFrontmatter?.slide ?? false,
    ignorePublish: existingFrontmatter?.ignorePublish ?? false,
  };
}

function stringifyZennFrontmatter(fm) {
  const lines = [
    `title: "${fm.title}"`,
    `emoji: "${fm.emoji}"`,
    `type: "${fm.type}"`,
    `topics: [${fm.topics.map((t) => `"${t}"`).join(', ')}]`,
    `published: ${fm.published}`,
  ];
  return `---\n${lines.join('\n')}\n---\n`;
}

function stringifyQiitaFrontmatter(fm) {
  const tagLines = fm.tags.map((t) => `  - ${t.name}`).join('\n');
  const lines = [
    `title: ${fm.title}`,
    `tags:`,
    tagLines,
    `private: ${fm.private}`,
    `updated_at: '${fm.updated_at}'`,
    `id: ${fm.id === null ? 'null' : fm.id}`,
    `organization_url_name: ${fm.organization_url_name === null ? 'null' : fm.organization_url_name}`,
    `slide: ${fm.slide}`,
    `ignorePublish: ${fm.ignorePublish}`,
  ];
  return `---\n${lines.join('\n')}\n---\n`;
}

const sourceFiles = readdirSync(SOURCE_DIR).filter(
  (f) => extname(f) === '.md'
);

if (sourceFiles.length === 0) {
  console.log('No .md files found in source/');
  process.exit(0);
}

for (const filename of sourceFiles) {
  const sourcePath = join(SOURCE_DIR, filename);
  const fileContent = readFileSync(sourcePath, 'utf-8');
  const { data, content } = matter(fileContent);

  if (!data.zenn && !data.qiita) {
    console.log(`SKIP   ${filename} (zenn: false, qiita: false)`);
    continue;
  }

  if (data.zenn) {
    const fm = buildZennFrontmatter(data);
    const output = stringifyZennFrontmatter(fm) + content.trimStart();
    const outPath = join(ZENN_DIR, filename);
    writeFileSync(outPath, output, 'utf-8');
    console.log(`ZENN   ${filename} -> ${outPath}`);
  }

  if (data.qiita) {
    const outPath = join(QIITA_DIR, filename);
    let existingFrontmatter = null;
    if (existsSync(outPath)) {
      const existing = matter(readFileSync(outPath, 'utf-8'));
      existingFrontmatter = existing.data;
    }
    const fm = buildQiitaFrontmatter(data, existingFrontmatter);
    const output = stringifyQiitaFrontmatter(fm) + content.trimStart();
    writeFileSync(outPath, output, 'utf-8');
    console.log(`QIITA  ${filename} -> ${outPath}`);
  }
}
