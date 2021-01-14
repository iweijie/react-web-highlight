import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
} from 'react';

import './index.less';

export interface IToolPane {
  mode: string;
  icon: ReactNode;
  name: string | ReactNode;
  selectIcon?: ReactNode;
  selectName?: string | ReactNode;
  selected?: boolean;
  handle: (mode: string) => any;
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
  return (
    <div className="note-tool-item" key={mode} onClick={() => handle(mode)}>
      {selected ? selectIcon : icon}
      <i>{selected ? selectName : name}</i>
    </div>
  );
};

export default ToolPane;
