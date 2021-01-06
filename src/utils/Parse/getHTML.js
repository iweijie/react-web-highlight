import { isEmpty, get } from 'lodash';
import { unescape, escape, resolveIntersection } from './tool';

const endStr = '</span>';

const getElementHTML = item => {
  const {
    type,
    uuid,
    tagName,
    content = '',
    parent,
    attributes,
    children,
  } = item;
  if (type === 'element') {
    const attrStr = attributes
      .map(attr => {
        const { value, name } = attr;
        return value ? `${name}="${value}"` : name;
      })
      .join(' ');
    const child = getAstToHTML(children);
    return `<${tagName} ${attrStr}>${child}</${tagName}>`;
  } else if (type === 'text') {
    return content;
  }
  throw new Error('解析类型错误');
};

const getAstToHTML = ast => {
  if (isEmpty(ast)) return '';
  return ast
    .map(item => {
      return getElementHTML(item);
    })
    .join('');
};

const translateAstNodes = ({ ast, list = [] }) => {
  // TODO 数据合并

  const translateNodeList = [];

  list.forEach(item => {
    const { level, start, end } = item;
    let { text } = item;
    const node = level.reduce((ast, path) => {
      if (ast.isCustom) return ast;
      return get(ast, path) || get(ast.children, path) || ast;
    }, ast);

    let { type, content, attributes } = node;

    // name: "data-custom-split"

    // 字符转义后路径对应问题

    if (
      type === 'text' ||
      (type === 'element' &&
        attributes.find(item => item.name === 'data-custom-split'))
    ) {
      const parentNode = node.parent;

      if (!parentNode) return;

      let cNode = node;
      if (!node.isCustom) {
        cNode = {
          attributes: [
            {
              name: 'data-custom-split',
              value: 'true',
            },
          ],
          isCustom: true,
          custom: {
            list: [item],
            node,
          },
          children: [],
          parent: node.parent,
          class: '_custom-underline',
          tagName: 'span',
          type: 'element',
        };

        translateNodeList.push(cNode);

        const index = parentNode.children.findIndex(item => item === node);

        if (index !== -1) {
          parentNode.children.splice(index, 1, cNode);
        }
      } else {
        cNode.custom.list.push(item);
      }
    }
  });

  translateNodeList.forEach(item => {
    const { list, node } = item.custom;
    const content = unescape(node.content);
    const intersection = list.reduce((list, d) => {
      const { start, end, text, uuid } = d;
      const comparisonText = content.slice(start, end);
      if (comparisonText !== text) return list;
      list.push({ uuid, start, end });
      return list;
    }, []);

    const newContext = resolveIntersection(intersection, content)
      .reduce((list, d) => {
        const { start, end, uuid } = d;
        list.push(
          { type: 'end', uuid, i: end },
          { type: 'start', uuid, i: start },
        );
        return list;
      }, [])
      .sort((a, b) => {
        if (b.i === a.i) {
          if (b.type === a.type) return 0;
          if (b.type === 'start') return 1;
          if (a.type === 'start') return -1;
        }
        return b.i - a.i;
      })
      .reduce((text, item) => {
        const { type, i, uuid } = item;
        const insertStr =
          type === 'start'
            ? `<span data-custom-underline="true" data-custom-uuid="${uuid}">`
            : endStr;
        return `${text.slice(0, i)}${insertStr}${text.slice(i)}`;
      }, content);

    item.children.push({
      content: newContext,
      type: 'text',
    });
  });
};

// 笔记与ast 的融和
const getFormatAst = (ast, list) => {
  // const ast = JSON.parse(JSON.stringify(this.ast))
  // TODO 将笔记插入到ast中

  translateAstNodes({ ast, list });
  return ast;
};

const getHTML = (ast, list) => {
  console.time('_getFormatAst');
  ast = getFormatAst(ast, list);
  console.timeEnd('_getFormatAst');
  return getAstToHTML(ast);
};

export default getHTML;
