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
    <div key={mode} onClick={() => handle(mode)}>
      {icon}
      <i>{name}</i>
    </div>
  );
};

export default ToolPane;
