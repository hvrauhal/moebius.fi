// Markdown tables as result tables.
//
// A Sätteri hast plugin (see markdown.processor in astro.config.mjs) that
// wraps every <table> in <div class="table-wrap">, so that a wide table
// scrolls sideways instead of breaking the page on a phone, and adds the
// "podium" class to the rows ranked 1–3 of a ranked table (one whose first
// column is headed Sija or Rank) so the stylesheet can highlight them.

const RANK_HEADINGS = new Set(['sija', 'rank', '#']);

export default {
  name: 'result-tables',
  element: {
    filter: ['table'],
    visit(table, ctx) {
      markPodium(table, ctx);
      ctx.wrapNode(table, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [],
      });
    },
  },
};

function markPodium(table, ctx) {
  const [headRow] = rows(find(table, 'thead'));
  const firstHeading = headRow && ctx.textContent(cells(headRow)[0]).trim().toLowerCase();
  if (!RANK_HEADINGS.has(firstHeading)) return;
  for (const row of rows(find(table, 'tbody'))) {
    const rank = ctx.textContent(cells(row)[0]).trim();
    if (rank === '1' || rank === '2' || rank === '3') {
      addClass(row, 'podium', ctx);
    }
  }
}

const addClass = (node, name, ctx) =>
  ctx.setProperty(node, 'className', [...(node.properties?.className ?? []), name]);
const elements = (node, tagName) =>
  (node?.children ?? []).filter((c) => c.type === 'element' && c.tagName === tagName);
const find = (node, tagName) => elements(node, tagName)[0];
const rows = (section) => elements(section, 'tr');
const cells = (row) => (row.children ?? []).filter((c) => c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th'));
