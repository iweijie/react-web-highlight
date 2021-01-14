import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
} from 'react';
import { IToolPaneWrap } from './index';
import './index.less';

export interface IToolPane extends IToolPaneWrap {
  selected?: boolean;
}

const ToolPane: FC<IToolPane> = ({
  mode,
  icon,
  name,
  selectName,
  selectIcon,
  selected,
  handle,
}) => {
  const onClick = useCallback(() => {
    if (handle && typeof handle === 'function') {
      handle(mode);
    }
  }, [handle, mode]);

  return (
    <div className="note-tool-item" key={mode} onClick={onClick}>
      {selected ? selectIcon : icon}
      <i>{selected ? selectName : name}</i>
    </div>
  );
};

export default ToolPane;
