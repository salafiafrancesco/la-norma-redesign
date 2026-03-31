function slugifyHeading(value = '') {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function flushParagraph(buffer, blocks) {
  if (!buffer.length) return;

  blocks.push({
    type: 'paragraph',
    text: buffer.join(' ').trim(),
  });

  buffer.length = 0;
}

function flushList(listItems, blocks) {
  if (!listItems.length) return;

  blocks.push({
    type: 'list',
    items: [...listItems],
  });

  listItems.length = 0;
}

export function parseBlogContent(body = '') {
  const lines = String(body ?? '').split(/\r?\n/);
  const blocks = [];
  const paragraphBuffer = [];
  const listItems = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listItems, blocks);
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listItems, blocks);

      const text = trimmed.slice(3).trim();
      blocks.push({
        type: 'heading',
        level: 2,
        id: slugifyHeading(text),
        text,
      });
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listItems, blocks);

      const text = trimmed.slice(4).trim();
      blocks.push({
        type: 'heading',
        level: 3,
        id: slugifyHeading(text),
        text,
      });
      return;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph(paragraphBuffer, blocks);
      listItems.push(trimmed.slice(2).trim());
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushParagraph(paragraphBuffer, blocks);
  flushList(listItems, blocks);

  return blocks;
}

export function getArticleToc(blocks = []) {
  return blocks.filter((block) => block.type === 'heading' && block.level === 2);
}
