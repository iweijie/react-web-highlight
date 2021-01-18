import { INoteTextHighlightInfo } from './Note/type';
import { getCustomValue } from './customAttrValue';

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

// TODO 这是一坨代码， 要修改， 太困了先写着
// 这里有BUG
const getRealNodeAndOffset = (node: Node | Element, offset: number) => {
  const {
    tagName,
    splitAttrName,
    attrName,
    selectedAttr,
    rowKey,
    modeClassNames,
  } = getCustomValue();
  if (node instanceof Element) {
    if (node.getAttribute(attrName)) {
      let num = 0;
      let index = 0;
      let n = node.childNodes[index];

      while (n && num < offset) {
        num += n?.textContent?.length || 0;
        if (num >= offset) {
          break;
        }
        index++;
        n = node.childNodes[index];
      }

      return { node: n, offset: (n.textContent?.length || 0) - (num - offset) };
    }
    throw new Error('元素类型错误');
  }
  return { node, offset };
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
  const start = getRealNodeAndOffset(startNode, startOffset);
  const end = getRealNodeAndOffset(endNode, endOffset);
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  if (getSelection.rangeCount > 0) getSelection.removeAllRanges();
  getSelection.addRange(range);
};

export default selectRange;
