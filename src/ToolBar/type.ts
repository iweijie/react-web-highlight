export interface IToolBarProps {
  // 模仿 antd 弹窗
  mask?: boolean;
  visible?: boolean;
  autoClosable?: boolean;
  wrapClassName?: string;
  onCancel?: () => void;
}
