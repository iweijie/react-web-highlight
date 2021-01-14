import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
} from 'react';
import ToolPane from './ToolPane';

export interface IToolPaneWrap {
  mode: string;
  icon: ReactNode;
  name: string | ReactNode;
  selectIcon?: ReactNode;
  selectName?: string | ReactNode;
  handle: (mode: string) => any;
}

const ToolPaneWrap: FC<IToolPaneWrap> = (props) => {
  return <ToolPane {...props} selected={true}/>;
};

export default ToolPaneWrap;
