import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { unescape, escape } from './tool';
import resolveIntersection from './resolveIntersection';
import { iAst, IAstItem, iAttr } from './parser';
import { INoteTextHighlightInfo } from './index';
import { getCustomValue } from './customAttrValue';

export interface IType {
  type: 'start' | 'end';
  uuid: string | number;
  i: number;
}

export interface ICustomData {
  d: ICustomD;
  u: any;
  m: string;
}

export interface ICustomD {
  uuid: string | number;
  start: number;
  end: number;
  [x: string]: any;
}

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
    modeClassNames,
  } = getCustomValue();

  const endStr = `</${tagName}>`;

  const translateNodeList: IAstItem[] = [];

  if (!options || isEmpty(options)) return;

  options.forEach((optionItem, index) => {
    const { list, mode } = optionItem;
    const uuid = optionItem[rowKey];
    if (!Array.isArray(list) || !list.length) return;
    list.forEach(item => {
      // @ts-ignore
      const node: IAstItem = item.level.reduce(getLastAst, ast);

      const { type, content, attributes } = node;

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
              list: [{ d: item, m: mode, u: uuid }],
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
          cNode.custom.list.push({ d: item, m: mode, u: uuid });
        }
      }
    });
  });

  translateNodeList.forEach(item => {
    const { list, node } = item.custom;
    // 解决字符转义后路径对应问题
    const content = unescape(node.content);
    // 过滤不匹配文本
    const filterData = list.filter((item: ICustomData) => {
      const { start, end, text } = item.d;
      const comparisonText = content.slice(start, end);
      return comparisonText === text;
    });

    const a = resolveIntersection(filterData, content);
    console.log('list', list);
    console.log(a);
    const newContext = a
      .map(item => {
        const { start, end, text, options } = item;
        // 用于解决文本转标签注入的问题
        const content = escape(text);

        const header = options.map(option => {
          const { uuid, mode } = option;
          return `<${tagName} class="${
            mode ? modeClassNames[mode] : ''
          }" ${splitAttrName}="true" ${selectedAttr}="${uuid}">`;
        });
        const footer = options.map(() => {
          return endStr;
        });
        return [...header, content, ...footer].filter(Boolean).join('');
      })
      .join('');

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
