import { ReactNode } from 'react';
import { IModeProps, INoteTextHighlightInfo } from '../Note/type';

interface IToolBarModeOptions {
  selected: boolean;
  data: INoteTextHighlightInfo | null;
  onCancel?: () => void;
}

export interface IToolBarModes extends IModeProps {
  name?: string;
  render?: (options: IToolBarModeOptions) => ReactNode;
  handle?: (...arg: any[]) => any;
}

export interface IToolBarState {
  action: 'add' | 'update' | undefined;
  selectText: INoteTextHighlightInfo | null;
  visible: boolean;
  position: [number, number];
  toolClassName: string;
}

export interface IToolBarOnChangeOption {
  payload: INoteTextHighlightInfo;
  action: IToolBarState['action'];
  mode: string;
}

export interface IToolBarProps {
  // 模仿 antd 弹窗
  mask?: boolean;
  visible?: boolean;
  autoClosable?: boolean;
  wrapClassName?: string;
  onCancel?: () => void;
}
