import { INoteTextHighlightInfo } from './Note/type';

const getNode = (wrap: Node, path: number[]): Node | undefined => {
  if (!wrap || !path.length) return;
  let node = wrap;
  let index = 0;
  while (node && index < path.length) {
    const { childNodes } = node;
    node = childNodes[path[index]];
    index++;
  }
  return node;
};

const selectRange = (data: INoteTextHighlightInfo) => {
  const wrap = document.querySelector('#text-highlight');
  const getSelection = window.getSelection();
  if (!document?.createRange || !wrap || !getSelection) return;
  const range = new Range();

  const startNode = getNode(wrap, data.list[0].level);
  const startOffset = data.list[0].start;

  const endNode = getNode(wrap, data.list[data.list.length - 1].level);
  const endOffset = data.list[data.list.length - 1].end;

  if (!startNode || !endNode) return;
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  getSelection.addRange(range);
};

export default selectRange;
