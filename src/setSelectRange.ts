import { INoteTextHighlightInfo } from './Note/type';
import { getCustomValue } from './customAttrValue';
// import translateSelectedTextToRang from './translateSelectedTextToRang';

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
  const { attrName } = getCustomValue();

  // 当前节点可能为自定义分割节点
  const wrap = node;

  // 节点为元素，且需要是自定义元素，有挂载自定义属性的元素都为自定义元素
  if (node instanceof Element) {
    if (node.getAttribute(attrName)) {
      let textOffset = 0;
      let index = 0;
      node = wrap.childNodes[index];

      outer: while (node && textOffset < offset) {
        // 选中开始节点 - 选中的结束节点 之间的文本节点都为选中文本
        // 只标记文本节点
        if (node.nodeType === 3) {
          textOffset += node?.textContent?.length || 0;
          if (textOffset >= offset) break;
        }

        if (node.childNodes.length) {
          node = node.childNodes[0];
        } else if (node.nextSibling) {
          node = node.nextSibling;
        } else {
          do {
            node = node?.parentNode as Element;
            if (wrap === node) {
              break outer;
            }
          } while (!node.nextSibling);
          node = node.nextSibling as Element;
        }
      }

      return {
        node,
        offset: (node.textContent?.length || 0) - (textOffset - offset),
      };
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
