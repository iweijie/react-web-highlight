import { ICustomData } from './getHTML';

/**
 * 获取交集
 */

interface iIntersectionOption {
  uuid: any;
  mode: string;
}

interface iIntersection {
  end: number;
  start: number;
  text: string;
  options: iIntersectionOption[];
}

// TODO 后续有性能问题再优化

const resolveIntersection = function(
  list: ICustomData[],
  content: string
): iIntersection[] {
  const joinList: iIntersectionOption[] = [];
  let startOffset = 0;
  const textContentList = [];
  for (let i = 0; i <= content.length; i++) {
    list.forEach(e => {
      const { d, u: uuid, m: mode } = e;
      const { start, end } = d;
      if (start === i) {
        if (startOffset < i) {
          textContentList.push({
            start: startOffset,
            end: i,
            text: content.slice(startOffset, i),
            options: [...joinList],
          });
        }
        startOffset = i;
        joinList.push({ uuid, mode });
      } else if (end === i) {
        const index = joinList.findIndex(item => item.uuid === uuid);

        if (index === -1) {
          return;
        }

        if (startOffset < i) {
          textContentList.push({
            start: startOffset,
            end: i,
            text: content.slice(startOffset, i),
            options: [...joinList],
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
      options: [...joinList],
    });
  }

  return textContentList;
};

export default resolveIntersection;
