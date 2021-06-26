import { INoteTextHighlightInfoItem } from '../getSelectedInfo';

export interface IModeProps {
  mode: string;
  className?: string;
}

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  mode?: string;
  [x: string]: any;
}

export interface INote {
  template: string;
  value?: INoteTextHighlightInfo[];
  tagName?: string;
  // attrName?: string;
  // splitAttrName?: string;
  onAdd?: (props: INoteTextHighlightInfo) => void;
  onUpdate?: (props: INoteTextHighlightInfo[]) => void;
  rowKey?: string;
  modes?: IModeProps[];
}
