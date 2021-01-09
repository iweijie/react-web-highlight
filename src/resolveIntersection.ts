// 获取交集
// TODO 后续有性能问题再优化
const resolveIntersection = function(list: any, content: string) {
  console.log('-----------', list);
  if (!list || !list.length) return [];
  let joinList: any[] = [];
  let startOffset = 0;
  const intersection: any[] = [];
  for (let i = 0; i <= content.length; i++) {
    list.forEach((e: any) => {
      const { start, end, uuid } = e;
      if (start === i) {
        if (!joinList.length) {
          startOffset = start;
          joinList.push(uuid);
        } else {
          if (startOffset < i) {
            joinList.forEach(id => {
              intersection.push({
                uuid: id,
                start: startOffset,
                end: i,
              });
            });
          }
          startOffset = i;
          joinList.push(uuid);
        }
      } else if (end === i) {
        const index = joinList.findIndex(item => item === uuid);

        if (index === -1) {
          return;
        }

        if (startOffset < i) {
          joinList.forEach(id => {
            intersection.push({
              uuid: id,
              start: startOffset,
              end: i,
            });
          });
        }
        startOffset = i;

        joinList.splice(index, 1);
      }
    });
  }
  return intersection;
};

export default resolveIntersection;
