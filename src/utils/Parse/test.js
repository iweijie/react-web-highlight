// TODO 需要对截取的文本转义回来
// translateNodeList.forEach(item => {
//   const { list, node } = item.custom;
//   const content = unescape(node.content);
//   const intersection = list.reduce((list, d) => {
//     const { start, end, text, uuid } = d;
//     const comparisonText = content.slice(start, end);
//     if (comparisonText !== text) return list;
//     list.push({ uuid, start, end });
//     return list;
//   }, []);

//   let resolveList = resolveIntersection(intersection, content);

//   console.log(resolveList)

//   resolveList = resolveList
//     .reduce((list, d) => {
//       const { start, end, uuid } = d;
//       list.push(
//         { type: 'end', uuid, i: end },
//         { type: 'start', uuid, i: start },
//       );
//       return list;
//     }, [])
//     .sort((a, b) => {
//       if (b.i === a.i) {
//         if (b.type === a.type) return 0;
//         if (b.type === 'start') return 1;
//         if (a.type === 'start') return -1;
//       }
//       return b.i - a.i;
//     });

//   const a = resolveList.reduce(
//     (obj, item) => {
//       const { list, current } = obj;
//       let lastList = list[list.length - 1];
//       if (item.i !== current) {
//         lastList = [];
//         list.push(lastList);
//         obj.current = item.i;
//       }

//       lastList.push(item);

//       return obj;
//     },
//     {
//       list: [],
//       current: Number.MAX_SAFE_INTEGER,
//     },
//   );

//   console.log(a);
//   const newContext = resolveList.reduce((text, item) => {
//     const { type, i, uuid } = item;
//     const insertStr =
//       type === 'start'
//         ? `<span data-custom-underline="true" data-custom-uuid="${uuid}">`
//         : endStr;
//     return `${text.slice(0, i)}${insertStr}${text.slice(i)}`;
//   }, content);
//   console.log(newContext);
//   item.children.push({
//     content: newContext,
//     type: 'text',
//   });
// });
