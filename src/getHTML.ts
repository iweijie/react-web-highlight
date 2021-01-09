import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { unescape, escape } from './tool';
import resolveIntersection from './resolveIntersection';
import { iAst, IAstItem, iAttr } from './parser';
import { INoteTextHighlightInfo } from './index';
import { setCustomValue, getCustomValue } from './customAttrValue';

const endStr = '</span>';

const getElementHTML = (item: IAstItem) => {
  if (item.type === 'element') {
    const { tagName, attributes, children } = item;
    const attrStr = attributes
      .map(attr => {
        const { value, name } = attr;
        return value ? `${name}="${value}"` : name;
      })
      .join(' ');
    const child = getAstToHTML(children);
    return `<${tagName} ${attrStr}>${child}</${tagName}>`;
  } else if (item.type === 'text') {
    return item.content;
  }
  throw new Error('解析类型错误');
};

const getAstToHTML = (ast: iAst): string => {
  if (isEmpty(ast)) return '';
  return ast
    .map(item => {
      return getElementHTML(item);
    })
    .join('');
};

const getLastAst = (astItem: IAstItem, path: number): IAstItem => {
  if (astItem.isCustom) return astItem;
  return get(astItem, path) || get(astItem.children, path) || astItem;
};

const translateAstNodes = (ast: iAst, options?: INoteTextHighlightInfo[]) => {
  // TODO 数据合并
  const {
    tagName,
    splitAttrName,
    attrName,
    selectedAttr,
    rowKey,
  } = getCustomValue();
  const translateNodeList: IAstItem[] = [];

  if (!options || isEmpty(options)) return;

  options.forEach((optionItem, index) => {
    const { list } = optionItem;
    const uuid = optionItem[rowKey];
    if (!Array.isArray(list) || !list.length) return;
    list.forEach(item => {
      const { level, start, end } = item;
      // @ts-ignore
      const node: IAstItem = level.reduce(getLastAst, ast);

      const { type, content, attributes } = node;

      // 字符转义后路径对应问题

      if (
        type === 'text' ||
        (type === 'element' &&
          attributes.find((item: iAttr) => item.name === attrName))
      ) {
        const parentNode = node.parent;

        if (!parentNode) return;

        let cNode: any = node;
        if (!node.isCustom) {
          cNode = {
            attributes: [
              {
                name: attrName,
                value: 'true',
              },
            ],
            isCustom: true,
            custom: {
              uuid,
              list: [item],
              node,
            },
            children: [],
            parent: node.parent,
            tagName,
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
  });
  translateNodeList.forEach(item => {
    const { list, node, uuid } = item.custom;
    const content = unescape(node.content);
    const intersection = list.reduce((list: any[], d: any) => {
      const { start, end, text } = d;
      const comparisonText = content.slice(start, end);
      if (comparisonText !== text) return list;
      list.push({ uuid, start, end });
      return list;
    }, []);

    const newContext = resolveIntersection(intersection, content)
      .reduce((list, d) => {
        const { start, end, uuid } = d;
        list.push({ type: 'end', uuid, i: end }, { type: 'start', uuid, i: start });
        return list;
      }, [])
      .sort((a: any, b: any) => {
        if (b.i === a.i) {
          if (b.type === a.type) return 0;
          if (b.type === 'start') return 1;
          if (a.type === 'start') return -1;
        }
        return b.i - a.i;
      })
      .reduce((text: string, item: any) => {
        const { type, i, uuid } = item;
        console.log(item);
        const insertStr =
          type === 'start'
            ? `<span ${splitAttrName}="true" ${selectedAttr}="${uuid}">`
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
const getFormatAst = (ast: iAst, options?: INoteTextHighlightInfo[]): iAst => {
  // TODO 将笔记插入到ast中
  translateAstNodes(ast, options);
  return ast;
};

const getHTML = (ast: iAst, list?: INoteTextHighlightInfo[]) => {
  ast = getFormatAst(ast, list);
  return getAstToHTML(ast);
};

export default getHTML;
