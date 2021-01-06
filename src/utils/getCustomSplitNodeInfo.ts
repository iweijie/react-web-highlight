interface iGetCustomSplitNodeInfo {
  node: Element;
  isStart: Boolean;
  range: any;
}

export interface ICustomSplitNodeInfo {
  isStart: Boolean;
  isEnd: Boolean;
  start: number;
  end: number;
}

/**
 * @description 分割节点作为一个整体判断
 */
const getCustomSplitNodeInfo = ({
  node,
  isStart = false,
  range,
}: iGetCustomSplitNodeInfo): ICustomSplitNodeInfo => {
  const { endContainer, endOffset, startContainer, startOffset } = range;

  const info: ICustomSplitNodeInfo = {
    isStart: false,
    isEnd: false,
    start: 0,
    end: 0,
  };

  if (isStart) {
    info.isStart = true;
    info.start = 0;
  } else if (node.contains(startContainer)) {
    info.isStart = true;
    let startNode = startContainer;
    let offset = 0;
    outer: while (startNode && startNode !== node) {
      if (startNode === startContainer) {
        offset += startOffset;
      } else {
        offset += startNode?.textContent?.length || 0;
      }

      if (startNode.previousSibling) {
        startNode = startNode.previousSibling;
      } else {
        do {
          startNode = startNode.parentNode;
          if (node === startNode) {
            break outer;
          }
        } while (!startNode.previousSibling);
        startNode = startNode.previousSibling;
      }
    }

    info.start = offset;
  }

  if (node.contains(endContainer)) {
    info.isEnd = true;
    let endNode = endContainer;

    let offset = 0;
    outer: while (endNode && endNode !== node) {
      if (endNode === endContainer) {
        offset += endOffset;
      } else {
        offset += endNode?.textContent?.length || 0;
      }

      if (endNode.previousSibling) {
        endNode = endNode.previousSibling;
      } else {
        do {
          endNode = endNode.parentNode;
          if (node === endNode) {
            break outer;
          }
        } while (!endNode.previousSibling);
        endNode = endNode.previousSibling;
      }
    }
    info.end = offset;
  } else if (info.isStart) {
    info.isEnd = false;
    info.end = node?.textContent?.length || 0;
  }

  return info;
};

export default getCustomSplitNodeInfo;
