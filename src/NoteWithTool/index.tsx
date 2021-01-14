import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
} from 'react';
import Note, { INote, IModeProps, INoteTextHighlightInfo } from '../Note';
import map from 'lodash/map';
import useUpdateEffect from '../hooks/useUpdateEffect';
import useWhyDidYouUpdate from '../hooks/useWhyDidYouUpdate';
import useLayoutUpdateEffect from '../hooks/useLayoutUpdateEffect';
import useSetState from '../hooks/useSetState';
import useBoolean from '../hooks/useBoolean';
import getSelectedInfo, {
  INoteTextHighlightInfoItem,
} from '../getSelectedInfo';
import {
  customTag as cTag,
  customAttr as cAttr,
  customRowKey,
  customSplitAttr,
  customSelectedAttr,
  marginVertical,
} from '../constants';
import defaultToolBarListValue, {
  copyType,
  cancelType,
} from '../defaultToolBarList';
import { setCustomValue, getCustomValue } from '../customAttrValue';
import ToolBar from '../components/ToolBar';
import ToolPane from '../components/ToolPane';
import { getUUID } from '../tool';

import '../asset/font/iconfont.css';

export interface INoteWithToolModes extends IModeProps {
  name: string;
  icon?: ReactNode;
}

export interface INoteWithToolProps extends INote {
  modes: INoteWithToolModes[];
}

// 设置一个单独变量的目的是因为只能选中一个区域， 不存在选中多处区域的缘故
let rangeRect: DOMRect;

const NoteWithTool: FC<INoteWithToolProps> = props => {
  const {
    onAdd: handleOnAdd,
    onUpdate: handleOnUpdate,
    modes,
    ...other
  } = props;

  const [selectText, setSelectText] = useState<INoteTextHighlightInfo | null>(
    null
  );

  const [toolBarInfo, setToolBarInfo] = useSetState({
    visible: false,
  });

  const onAdd = useCallback(
    obj => {
      setSelectText(obj);
      setToolBarInfo(info => {
        return { ...info, visible: true };
      });
    },
    [setSelectText, setToolBarInfo]
  );

  const onUpdate = useCallback(obj => {
    console.log(obj);
  }, []);

  const onToolBarCancel = useCallback(() => {
    setToolBarInfo(info => {
      return {
        ...info,
        visible: false,
      };
    });
  }, [setToolBarInfo]);

  const filterModes = useMemo(() => {
    return modes.filter(item => item.mode);
  }, [modes]);

  return (
    <div className="note-wrap">
      <Note onAdd={onAdd} onUpdate={onUpdate} modes={filterModes} {...other} />
      <ToolBar visible={toolBarInfo.visible} onCancel={onToolBarCancel}>
        {map(modes, item => (
          <ToolPane key={item.mode} {...item} />
        ))}
      </ToolBar>
    </div>
  );
};

export default NoteWithTool;
