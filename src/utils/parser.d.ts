export interface iAttr {
  value: string;
  name: string;
}

export interface IAstText {
  parent?: IAstElement;
  content: string;
  type: 'text';
  [x: string]: any;
}
export interface IAstElement {
  type: 'element';
  tagName: string;
  parent: IAstElement;
  attributes: iAttr[];
  children: iAst;
  [x: string]: any;
}

export type IAstItem = IAstElement | IAstText;

// export interface IAstItem {
//   type: 'element' | 'text';
//   uuid?: string;
//   tagName: string;
//   content?: string;
//   parent: IAstItem;
//   attributes: iAttr[];
//   children: IAstItem[];
//   [x: string]: any;
// }

export type iAst = IAstItem[];

declare function parserHTML(htmlStr: string): iAst;

export default parserHTML;
