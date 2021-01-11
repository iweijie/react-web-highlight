import { ICustomData } from './getHTML';

/**
 * 获取交集
 * @param list [{uuid, start, end}]
 * @param content 文本
 */

interface iIntersection {
  end: number;
  start: number;
  text: string;
  uuids: any[];
}

// TODO 后续有性能问题再优化

const resolveIntersection = function(
  list: ICustomData[],
  content: string
): iIntersection[] {
  const joinList: any[] = [];
  let startOffset = 0;
  const textContentList = [];
  for (let i = 0; i <= content.length; i++) {
    list.forEach(e => {
      const { start, end, uuid } = e;
      if (start === i) {
        if (startOffset < i) {
          textContentList.push({
            start: startOffset,
            end: i,
            text: content.slice(startOffset, i),
            uuids: [...joinList],
          });
        }
        startOffset = i;
        joinList.push(uuid);
      } else if (end === i) {
        const index = joinList.findIndex(item => item === uuid);

        if (index === -1) {
          return;
        }

        if (startOffset < i) {
          textContentList.push({
            start: startOffset,
            end: i,
            text: content.slice(startOffset, i),
            uuids: [...joinList],
          });
        }

        startOffset = i;
        joinList.splice(index, 1);
      }
    });
  }

  if (startOffset !== content.length) {
    textContentList.push({
      start: startOffset,
      end: content.length,
      text: content.slice(startOffset, content.length),
      uuids: [...joinList],
    });
  }

  return textContentList;
};

export default resolveIntersection;
