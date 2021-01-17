import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
  useEffect,
} from 'react';
import Note, { INote, IModeProps, INoteTextHighlightInfo } from '../Note';
import map from 'lodash/map';
import noop from 'lodash/noop';
import useUpdateEffect from '../hooks/useUpdateEffect';
import useWhyDidYouUpdate from '../hooks/useWhyDidYouUpdate';
import useLayoutUpdateEffect from '../hooks/useLayoutUpdateEffect';
import useSetState from '../hooks/useSetState';
import usePersistFn from '../hooks/usePersistFn';
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
import './index.less';

interface INoteWithToolModeOptions {
  selected: boolean;
  data: INoteTextHighlightInfo | null;
  onCancel?: () => void;
}

export interface INoteWithToolModes extends IModeProps {
  name?: string;
  render?: (options: INoteWithToolModeOptions) => ReactNode;
  handle?: (...arg: any[]) => any;
}

export interface INoteWithToolState {
  action: 'add' | 'update' | undefined;
  selectText: INoteTextHighlightInfo | null;
  visible: boolean;
  position: [number, number];
  toolClassName: string;
}

export interface INoteWithToolOnChangeOption {
  payload: INoteTextHighlightInfo;
  action: INoteWithToolState['action'];
  mode: string;
}

export interface INoteWithToolProps {
  template: string;
  value?: INoteTextHighlightInfo[];
  tagName?: string;
  attrName?: string;
  splitAttrName?: string;
  onChange?: (props: INoteWithToolOnChangeOption) => any;
  rowKey?: string;
  modes?: INoteWithToolModes[];
  // 模仿 antd 弹窗

  mask?: boolean; 
  autoClosable?: boolean;
  wrapClassName?: string;
}

const NoteWithTool: FC<INoteWithToolProps> = props => {
  const { onChange, modes, ...other } = props;

  const [state, setState] = useSetState<INoteWithToolState>({
    action: undefined,
    selectText: null,
    visible: false,
    position: [0, 0],
    toolClassName: '',
  });

  const wrapContainer = useRef<HTMLDivElement>(null);
  const toolContainer = useRef<HTMLDivElement>(null);

  const { action, selectText, visible } = state;

  const toolBarList: INoteWithToolModes[] = React.useMemo(() => {
    if (Array.isArray(modes) && modes.length) return modes;
    return [
      {
        className: 'huaxian',
        mode: 'huaxian',
        render: ({ selected, data, onCancel }) => {
          console.log({ selected, data, onCancel });
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-huaxian"></span>
              <i>划线</i>
            </div>
          );
        },
      },
      {
        className: 'edit',
        mode: 'edit',
        render: ({ selected, data, onCancel }) => {
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-edit"></span>
              <i>笔记</i>
            </div>
          );
        },
      },
      {
        mode: 'fuzhi',
        render: ({ selected, data, onCancel }) => {
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-fuzhi"></span>
              <i>复制</i>
            </div>
          );
        },
      },
      {
        mode: 'quxiao',
        render: ({ selected, data, onCancel }) => {
          return (
            <div className="note-tool-item">
              <span className="iconfont icon-quxiao"></span>
              <i>取消</i>
            </div>
          );
        },
      },
      {
        mode: 'test',
        render: ({ selected, data, onCancel }) => {
          return <div className="note-tool-item">取消</div>;
        },
      },
    ];
  }, [modes]);

  const onAdd = usePersistFn(selectText => {
    setState({
      action: 'add',
      selectText,
      visible: true,
    });
  });

  const onUpdate = useCallback(obj => {
    console.log(obj);
  }, []);

  const onToolPaneClick = useCallback(
    item => {
      if (onChange && typeof onChange === 'function') {
        onChange({
          action,
          payload: selectText as INoteTextHighlightInfo,
          mode: item.mode,
        });
      }
    },
    [selectText, onChange, action]
  );

  const filterModes = useMemo(() => {
    return (modes || []).filter(item => item.mode);
  }, [modes]);

  // 用于设置弹窗的显隐
  useEffect(() => {
    if (!wrapContainer.current || !toolContainer.current) return;

    toolContainer.current.style.display = visible ? 'flex' : 'none';

    if (!visible) return;

    let range: Range | undefined;

    if (action === 'add') {
      range = window?.getSelection()?.getRangeAt(0);
    } else if (action === 'update') {
    }

    if (!range) return;

    const rangeRect = range.getBoundingClientRect();

    const wrapContainerRect = wrapContainer.current.getBoundingClientRect();
    const toolContainerRect = toolContainer.current.getBoundingClientRect();

    let top: number;
    let toolClassName: string;
    let left: number;
    let arrowLeft: number;

    if (rangeRect.top > marginVertical + toolContainerRect.height) {
      toolClassName = 'up';
      top =
        rangeRect.top -
        wrapContainerRect.top -
        marginVertical -
        toolContainerRect.height;
    } else {
      toolClassName = 'down';
      top = rangeRect.bottom - wrapContainerRect.top + marginVertical;
    }

    const leftPoint =
      (rangeRect.left + rangeRect.right) / 2 - wrapContainerRect.left;

    if (leftPoint - toolContainerRect.width / 2 < 0) {
      left = 0;
      arrowLeft = leftPoint < 6 ? 6 : leftPoint;
    } else if (
      leftPoint + toolContainerRect.width / 2 >
      wrapContainerRect.width
    ) {
      left = wrapContainerRect.width - toolContainerRect.width;
      arrowLeft = wrapContainerRect.left - leftPoint < 6 ? 6 : leftPoint;
    } else {
      left =
        (rangeRect.left + rangeRect.right) / 2 -
        toolContainerRect.width / 2 -
        wrapContainerRect.left;
      arrowLeft = leftPoint;
    }

    toolContainer.current.style.top = `${top}px`;
    toolContainer.current.style.left = `${left}px`;
    toolContainer.current.classList.remove('up', 'down');
    toolContainer.current.classList.add(toolClassName);

    const handle = () => {
      if (!toolContainer.current) return;
      setState({
        visible: false,
      });
    };

    // TODO 没有想到好的方式去移除弹窗，后续优化
    setTimeout(() => {
      document.addEventListener('click', handle, { once: true });
    });

    return () => {
      document.removeEventListener('click', handle);
    };
  }, [action, visible]);

  return (
    <div className="note-wrap" ref={wrapContainer}>
      <Note onAdd={onAdd} onUpdate={onUpdate} modes={filterModes} {...other} />
      <div className="note-tool" ref={toolContainer}>
        {map(toolBarList, (item, index) => {
          let reactNode: ReactNode | null | string | number | undefined = null;
          if (typeof item.render === 'function') {
            reactNode = item.render({
              selected: selectText?.mode
                ? false
                : selectText?.mode === item.mode,
              data: selectText,
            });
          }
          return (
            <div key={item.mode || index} onClick={() => onToolPaneClick(item)}>
              {reactNode}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoteWithTool;
