import getHTML from '../getHTML';
import FSM from '../parser.js';
import {
  customAttr as attr,
  customTag as tagName,
  customSplitAttr,
} from '../constants';
import { INoteTextHighlightInfo } from '../index';

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

  getCustomValue(key: string) {
    return key ? this.custom[key] : this.custom;
  }

  getHTML(list?: INoteTextHighlightInfo[]) {
    const snapshot = FSM(this.template);
    console.log(snapshot);
    return getHTML(snapshot, list);
  }
}

export default Parse;
