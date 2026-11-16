// Reproduces CJK count text being kept as a step anchor by e2e's replay cache.
// e2e does not export these modules, so this imports them from the installed dist by path.
import { describeDelta, deltaMismatch } from './node_modules/e2e/dist/cache/anchors.js';
import { redactNode } from './node_modules/e2e/dist/agent/observation.js';

const noSecrets = { redact: (text) => text, redactCut: (text) => text };
const nodes = (list) => new Map(list.map((node) => [node.ref.id, redactNode(node, noSecrets)]));
const node = (id, fields) => ({ ref: { id, revision: 'r' }, ...fields });
const heading = node('h', { role: 'heading', name: 'Items' });

function tally(label, before, after, next) {
  const delta = describeDelta(nodes([heading, node('c0', { text: before })]), nodes([heading, node('c1', { text: after }), node('n', { text: label })]), false);
  const nextRun = deltaMismatch({ endAnchors: delta.appeared, goneAnchors: delta.gone }, nodes([heading, node('c2', { text: next }), node('n', { text: label })]), nodes([heading, node('c1', { text: after })]));
  console.log(`${before} -> ${after}`);
  console.log('  recorded endAnchors:', JSON.stringify(delta.appeared));
  console.log('  next run (', after, '->', next, ') mismatch:', JSON.stringify(nextRun) ?? 'none (replay passes)');
}

console.log('# A tally that grows with every run (English works, Japanese does not)');
tally('Item added', '41 items', '42 items', '43 items');
tally('追加しました', '41件', '42件', '43件');

console.log('\n# A list screen opened by navigation (routeMoved = true)');
for (const text of ['Showing 1 to 9 of 9 results', '全9件中 1〜9件を表示']) {
  const delta = describeDelta(nodes([heading]), nodes([heading, node('p', { text }), node('n', { text: 'Records' })]), true);
  console.log(`  ${text} -> endAnchors:`, JSON.stringify(delta.appeared));
}
