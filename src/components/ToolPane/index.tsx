import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  useContext,
  FC,
} from 'react';
import ToolPane from './ToolPane';
import { INoteWithToolModes } from '../../NoteWithTool';
import context from '../ToolBar/context';

export interface IToolPaneWrap extends INoteWithToolModes {
  selectIcon?: ReactNode;
  selectName?: string;
  handle?: (mode: string) => any;
}

const ToolPaneWrap: FC<IToolPaneWrap> = props => {
  const mode = useContext(context);
  return (
    <ToolPane
      {...props}
      key={props.mode}
      selected={mode ? props.mode === mode : false}
    />
  );
};

export default ToolPaneWrap;
