import { INoteTextHighlightInfo } from '../Note/type';

export interface IToolBarState {
  action: 'add' | 'update' | undefined;
  selectText: INoteTextHighlightInfo | null;
  visible: boolean;
  position: [number, number];
  toolClassName: string;
}

export interface IToolBarProps {
  // 模仿 antd 弹窗
  mask?: boolean;
  visible?: boolean;
  autoClosable?: boolean;
  wrapClassName?: string;
  onCancel?: () => void;
}
