import getHTML from '../getHTML';
import FSM from '../parser.js';
import {
  customAttr as attr,
  customTag as tagName,
} from '../constants';
import { INoteTextHighlightInfo } from '../Note/type';

interface IParseProps {
  template: string;
  list?: INoteTextHighlightInfo[];
  customAttr?: string;
  customTag?: string;
}

class Parse {
  template: string;
  list: INoteTextHighlightInfo[];
  custom: {
    [x: string]: string;
  };
  constructor(props: IParseProps) {
    const { template, customAttr, customTag, list = [] } = props;
    this.template = template;
    this.list = list;
    this.custom = {
      attrName: customAttr || attr,
      tagName: customTag || tagName,
    };
  }

  getHTML(list?: INoteTextHighlightInfo[]) {
    const snapshot = FSM(this.template);

    return getHTML(snapshot, list);
  }
}

export default Parse;
