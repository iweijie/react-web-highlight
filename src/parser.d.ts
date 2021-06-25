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
  parent: IAstElement | null;
  attributes: iAttr[];
  children: iAst;
  [x: string]: any;
}

export type IAstItem = IAstElement | IAstText;

export type iAst = IAstItem[];

declare function parserHTML(htmlStr: string): iAst;

export default parserHTML;
