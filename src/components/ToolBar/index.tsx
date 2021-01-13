import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
} from 'react';
import ToolPane from '../ToolPane';

import './index.less';

interface IRenderToolPane {
  mode: string;
  icon: ReactNode;
  name: string | ReactNode;
  selectIcon?: ReactNode;
  selectName?: string | ReactNode;
  selected: boolean;
}

export interface IToolBar {
  values?: any[];
  renderToolBar?: (a: any) => ReactNode;
  renderToolPane?: (options: IRenderToolPane[]) => ReactNode;
  className?: string;
  hasDefaultToolBar?: boolean;
  onChange: (mode: string) => void;
}

const ToolBar: FC<IToolBar> = ({
  renderToolBar,
  hasDefaultToolBar,
  onChange,
  children,
}) => {
  const toolBar = useMemo(() => {
    const findToolPane: React.ReactNode[] = [];
    React.Children.forEach(children, child => {
      console.log('findToolPane', child);
      // @ts-ignore
      if (child && child?.type === ToolPane) {
        findToolPane.push(child);
      }
    });
    return findToolPane;
  }, [children]);

  return (
    <div className="note-tool-wrap">
      <div className="note-tool">{toolBar}</div>
    </div>
  );
};

export default ToolBar;
