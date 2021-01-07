import { customAttr } from './constants';
import getLevelList from './getLevelList';
import getStartNode from './getStartNode';
import getCustomSplitNodeInfo, {
  ICustomSplitNodeInfo,
} from './getCustomSplitNodeInfo';

interface ISelectedInfo {
  noteContainer: Element;
  range: Range;
}

export interface INoteTextHighlightInfoItem {
  level: Number[];
  start: Number;
  end: Number;
  text: String;
}

const defaultCustomNodeInfo: ICustomSplitNodeInfo = {
  isStart: false,
  isEnd: false,
  start: 0,
  end: 0,
};

const getSelectedInfo = ({
  range,
  noteContainer,
}: ISelectedInfo): INoteTextHighlightInfoItem[] => {
  const {
    commonAncestorContainer,
    endContainer,
    endOffset,
    startContainer,
    startOffset,
  } = range;

  const outerContainer = getStartNode(
    commonAncestorContainer as Element,
    noteContainer
  );

  const topLevel = getLevelList(outerContainer, noteContainer);
  // TODO 没太明白 Node  和  Element 的区别
  let node = getStartNode(startContainer as Element, noteContainer);

  let isStart: Boolean = false;
  let isEnd: Boolean = false;
  const list: INoteTextHighlightInfoItem[] = [];
  let customNodeInfo: ICustomSplitNodeInfo = defaultCustomNodeInfo;

  outer: while (node && !isEnd) {
    // 所有分割文本上都多嵌套了一层 span ，添加自定义属性 data-custom-split
    // 文本节点木有获取属性
    const isCustom = node.getAttribute && node.getAttribute(customAttr);

    // TODO 需要判断当前是否为自定义分割节点，为分割节点的情况，需要到内部去判断当前是否为开始节点与结束节点
    if (isCustom) {
      customNodeInfo = getCustomSplitNodeInfo({ range, isStart, node });
      isStart = customNodeInfo.isStart;
      isEnd = customNodeInfo.isEnd;
    } else {
      if (node === startContainer) {
        isStart = true;
      }
      if (node === endContainer) {
        isEnd = true;
      }
    }
    // 选中开始节点 - 选中的结束节点 之间的文本节点都为选中文本
    if (isStart) {
      const level = getLevelList(node, outerContainer);
      // 只标记文本节点
      if (node.nodeType === 3) {
        let textStartOffset = 0;
        let textEndOffset = node?.textContent?.length || 0;

        if (node === startContainer) {
          textStartOffset = startOffset;
        }

        if (node === endContainer) {
          textEndOffset = endOffset;
        }

        list.push({
          level: [...topLevel, ...level],
          start: textStartOffset,
          end: textEndOffset,
          text: node.textContent?.slice(textStartOffset, textEndOffset) || '',
        });
      } else if (isCustom) {
        const { start = 0, end = 0 } = customNodeInfo;

        list.push({
          level: [...topLevel, ...level],
          start: start,
          end: end,
          text: node?.textContent?.slice(start, end) || '',
        });
        // TODO 综合当前节点选中文本 ， 待完善
      }
    }

    // 自定义节点为最底层的文本节点，逻辑上无法分割， 所以转到查询兄弟节点
    if (node.childNodes.length && !isCustom) {
      // TODO 不造类型该咋写，头疼
      node = node.childNodes[0] as Element;
    } else if (node.nextSibling) {
      node = node.nextSibling as Element;
    } else {
      do {
        node = node.parentNode as Element;
        if (noteContainer === node) {
          break outer;
        }
      } while (!node.nextSibling);
      node = node.nextSibling as Element;
    }
  }

  return list.filter(item => {
    return item.text && item.text.trim();
  });
};

export default getSelectedInfo;
