import getHTML from '../getHTML';
import FSM from '../parser.js';
import { getDomFromHTMLTemp } from '../tool';
import { customAttr as attr, customTag as tagName } from '../constants';
import { INoteTextHighlightInfo } from '../Note/type';
import cloneDeep from 'lodash/cloneDeep';
import type {IAstText, IAstElement, iAttr, iAst} from '../parser'

interface IParseProps {
  template: string;
  list?: INoteTextHighlightInfo[];
  customAttr?: string;
  customTag?: string;
}

// attributes: []
// children: [{…}]
// parent: undefined
// tagName: "p"
// type: "element"

// interface IAstElement {
//   attributes: {
//     name: string;
//     value: any;
//   }[];
//   children: (IAstElement | IAstText)[];
//   parent: IAstElement | null;
//   tagName: string;
//   type: 'element';
//   id?: string;
//   class?: string;
// }

// content: "我在上一篇文章中，简要介绍了浏览器的工作大致可以分为6个阶段，我们昨天讲完了第一个阶段，也就是通讯的部分：浏览器使用HTTP协议或者HTTPS协议，向服务端请求页面的过程。"
// parent: {type: "element", children: Array(1), attributes: Array(0), tagName: "p", parent: {…}}
// type: "text"
// interface IAstText {
//   parent: IAstElement;
//   content: string;
//   type: 'text';
// }

type IParseDom = IAstText | IAstElement | null;

const parseDom = (
  dom: Node,
  parent: IAstElement | null = null
): IParseDom => {
  if (dom instanceof Element) {
    const element: IAstElement = {
      children: [],
      attributes: [],
      parent,
      tagName: dom.tagName.toLocaleLowerCase(),
      type: 'element',
    };

    const attrs = dom.getAttributeNames();
    element.attributes = attrs.map(key => {
      const value = dom.getAttribute(key) || '';

      if (key === 'id') {
        element.id = value;
      } else if (key === 'class') {
        element.class = value;
      }
      return {
        name: key,
        value,
      };
    });

    const childNodes = dom.childNodes;

    if (childNodes && childNodes.length) {
      for (let i = 0; i < childNodes.length; i++) {
        const ast = parseDom(childNodes[i], element)
        if(ast) {
          element.children.push(ast);
        }
      }
    }

    return element;
  } else if (dom instanceof Text) {
    const text: IAstText = {
      parent: parent as IAstElement,
      content: dom.textContent || '',
      type: 'text',
    };
    return text;
  } else if(dom instanceof Comment) {
    return null
  }

  throw new Error('类型错误');
};

const parse = (template: string) => {
  const doms = getDomFromHTMLTemp(template);
  const nodes = [];
  for (let i = 0; i < doms.length; i++) {
    const ast = parseDom(doms[i])
    if(ast) {
      nodes.push(ast);
    }
  }
  return nodes;
};

class Parse {
  template: string;
  ast: (IAstElement | IAstText)[];
  list: INoteTextHighlightInfo[];
  custom: {
    [x: string]: string;
  };
  constructor(props: IParseProps) {
    const { template, customAttr, customTag, list = [] } = props;
    this.template = template;
    // console.log(parse(template));
    this.ast = parse(template);
    this.list = list;
    this.custom = {
      attrName: customAttr || attr,
      tagName: customTag || tagName,
    };
  }

  getHTML(list?: INoteTextHighlightInfo[]) {
    const snapshot = cloneDeep(this.ast);
    console.log(snapshot)
    return getHTML(snapshot, list);
  }
}

export default Parse;
