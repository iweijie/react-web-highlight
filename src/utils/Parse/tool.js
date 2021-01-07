// 将HTML转义为实体
export function escape(html) {
  var elem = document.createElement('div');
  var txt = document.createTextNode(html);
  elem.appendChild(txt);
  return elem.innerHTML;
}
// 将实体转回为HTML
export function unescape(str) {
  var elem = document.createElement('div');
  elem.innerHTML = str;
  return elem.innerText || elem.textContent || '';
}

// 获取交集
// TODO 后续有性能问题再优化
export const resolveIntersection = function(list, content) {
  if (!list || !list.length) return [];
  let joinList = [];
  let startOffset = 0;
  const intersection = [];
  for (let i = 0; i <= content.length; i++) {
    list.forEach(e => {
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
