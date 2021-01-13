import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  FC,
} from 'react';
import useUpdateEffect from './hooks/useUpdateEffect';
import useLayoutUpdateEffect from './hooks/useLayoutUpdateEffect';
import useSetState from './hooks/useSetState';
import useBoolean from './hooks/useBoolean';
import getSelectedInfo, { INoteTextHighlightInfoItem } from './getSelectedInfo';
import {
  customTag as cTag,
  customAttr as cAttr,
  customRowKey,
  customSplitAttr,
  customSelectedAttr,
  marginVertical,
} from './constants';
import defaultToolBarListValue, {
  copyType,
  cancelType,
} from './defaultToolBarList';
import { setCustomValue, getCustomValue } from './customAttrValue';
import ToolBar from './components/ToolBar';
import ToolPane from './components/ToolPane';
import {
  getUUID,
  copyToShearPlate,
  getElementLeft,
  getElementTop,
} from './tool';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';

import Parse from './Parse/index';
import './asset/font/iconfont.css';
import './index.less';

interface IToolBarPaneProps {
  name: string;
  type: string;
  className?: string;
  icon?: ReactNode;
  render?: (props: any) => ReactNode;
}

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  mode?: string;
  [x: string]: any;
}

interface IOnChangeProps {
  action: 'add' | 'update';
  data: {
    list: INoteTextHighlightInfoItem[];
    text: string;
    [x: string]: any;
  };
  mode?: string;
}

export interface INote {
  template: string;
  value?: INoteTextHighlightInfo[];
  tagName?: string;
  attrName?: string;
  splitAttrName?: string;
  onChange: (props: IOnChangeProps) => void;
  rowKey?: string;
  toolBarList?: IToolBarPaneProps[];
  renderToolBar?: (a: any) => ReactNode;
  // filterToolBar?: (option: IToolBarPaneProps, selected: INoteTextHighlightInfo) => boolean;
  filterToolBar?: (
    option: IToolBarPaneProps,
    selected?: INoteTextHighlightInfo
  ) => boolean;
  hasDefaultToolBar?: boolean;
}
// 设置一个单独变量的目的是因为只能选中一个区域， 不存在选中多处区域的缘故
let rangeRect: DOMRect;
const defaultToolBarList: IToolBarPaneProps[] = [];

const Note: FC<INote> = ({
  template,
  value,
  tagName = cTag,
  attrName = cAttr,
  rowKey = customRowKey,
  toolBarList = defaultToolBarList,
  onChange,
  renderToolBar,
  filterToolBar,
  hasDefaultToolBar,
}) => {
  const [selectText, setSelectText] = useState<INoteTextHighlightInfo | null>(
    null
  );

  const [toolVisible, { toggle, setLeft, setRight }] = useBoolean(false);

  const parse = useMemo(() => {
    // 用于格式化html文本
    if (template) {
      const div = document.createElement('div');
      div.innerHTML = template;
      template = div.innerHTML;
    }
    return new Parse({ template });
  }, []);

  const getToolBarList = useCallback(() => {
    let list: IToolBarPaneProps[] = toolBarList;
    if (filterToolBar) {
      list = filter(toolBarList, (item, index) => filterToolBar(item));
    }
    return hasDefaultToolBar || hasDefaultToolBar === undefined
      ? [...list, ...defaultToolBarListValue]
      : list;
  }, [hasDefaultToolBar, toolBarList, filterToolBar, defaultToolBarListValue]);

  const [snapShoot, setSnapShoot] = useState(() => {
    return { __html: parse.getHTML(value) };
  });

  const [toolInfo, setToolInfo] = useSetState(() => {
    return {
      style: { top: 0, left: 0, arrowLeft: 0 },
      visible: false,
      className: '',
    };
  });

  const wrapContainer = useRef<HTMLDivElement>(null);
  const noteContainer = useRef<HTMLDivElement>(null);
  const toolContainer = useRef<HTMLUListElement>(null);
  const toolWrapContainer = useRef<HTMLDivElement>(null);

  const handleSelectedText = useCallback(() => {
    const range: Range | undefined = window?.getSelection()?.getRangeAt(0);
    if (!range) return;
    // debugger
    const { collapsed = true, endContainer, startContainer } = range;
    rangeRect = range.getBoundingClientRect();

    const modeClassNames: any = {};
    toolBarList.forEach(item => {
      modeClassNames[item.type] = item.className || '';
    });

    setCustomValue({
      tagName,
      attrName,
      rowKey,
      splitAttrName: customSplitAttr,
      selectedAttr: customSelectedAttr,
      modeClassNames,
    });

    // 返回条件 1. 光标起始点相同（即没有选中文本），2. 起点或者终点不在当前容器内
    if (
      collapsed ||
      !noteContainer.current ||
      !noteContainer.current.contains(startContainer as Node) ||
      !noteContainer.current.contains(endContainer as Node)
    )
      return;

    const list = getSelectedInfo({
      range: range as Range,
      noteContainer: noteContainer.current,
    });
    setSelectText({
      _isTemp: true,
      list,
      text: map(list, d => d.text).join(''),
      [rowKey]: getUUID(),
    });
  }, [noteContainer, toolBarList, parse, setSelectText]);

  const handleToggleTool = useCallback(
    visible => {
      if (!toolWrapContainer.current) return;
      const display = !visible ? 'none' : 'block';
      toolWrapContainer.current.style.display = display;

      if (visible) {
        requestAnimationFrame(() => {
          if (!toolWrapContainer.current) return;
          const { height } =
            toolWrapContainer.current?.parentElement?.getBoundingClientRect() ||
            {};
          toolWrapContainer.current.style.height = height
            ? `${height}px`
            : '100%';
        });
      }
    },
    [toolWrapContainer]
  );

  const handleCancelTool = useCallback(() => {
    console.log('-------,handleCancelTool');
    handleToggleTool(false);
    setSelectText(null);
  }, [handleToggleTool, setSelectText]);

  const handleClick = useCallback(
    e => {
      if (!noteContainer.current || !e.target) return;

      const uuid = e.target.getAttribute(customSelectedAttr);
      if (!uuid) return;

      const findData = value?.find(item => item[rowKey] === uuid);

      if (!findData) return;
      setSelectText(findData);
    },
    [noteContainer, handleCancelTool, value]
  );

  const handleMouseDown = useCallback(
    eventDown => {
      if (!noteContainer.current) return;
      document.addEventListener(
        'mouseup',
        eventUp => {
          handleSelectedText();
        },
        {
          once: true,
        }
      );
    },
    [noteContainer, toolBarList, parse]
  );
  // TODO 移动端
  // const handleTouchstart = useCallback(
  //   eventDown => {
  //     if (!noteContainer.current) return;
  //     document.addEventListener(
  //       'touchend',
  //       eventUp => {
  //         console.log(eventDown);
  //         console.log(eventUp);
  //         handleSelectedText();
  //       },
  //       {
  //         once: true,
  //       }
  //     );
  //   },
  //   [noteContainer, toolBarList, parse]
  // );

  // TODO 感觉异步的体验感不太好， 后续修改
  const handleToolBarClick = useCallback(
    mode => {
      if (!selectText) return;
      const { list, text, _isTemp } = selectText;
      // 默认取消
      if (mode === cancelType) {
      } else if (mode === copyType) {
        copyToShearPlate(text);
      } else if (onChange && typeof onChange === 'function') {
        const data: IOnChangeProps['data'] = { list, text };

        if (!_isTemp) {
          data[rowKey] = selectText[rowKey];
        }

        onChange({
          data,
          action: _isTemp ? 'add' : 'update',
          mode,
        });
      }
      handleCancelTool();
    },
    [toolBarList, rowKey, selectText]
  );

  useUpdateEffect(() => {
    if (value) {
      value = map(value, item => {
        if (!item || item[rowKey]) return item;
        item[rowKey] = getUUID();
        return item;
      });
    }
    setSnapShoot({ __html: parse.getHTML(value) });
  }, [setSnapShoot, parse, value]);

  useLayoutUpdateEffect(() => {
    if (!wrapContainer.current || !toolContainer.current || !selectText) return;
    handleToggleTool(true);

    const wrapContainerRect = wrapContainer.current.getBoundingClientRect();
    const toolContainerRect = toolContainer.current.getBoundingClientRect();

    let top: number;
    let className: string;
    let left: number;
    let arrowLeft: number;

    if (rangeRect.top > marginVertical + toolContainerRect.height) {
      className = 'up';
      top =
        rangeRect.top -
        wrapContainerRect.top -
        marginVertical -
        toolContainerRect.height;
    } else {
      className = 'down';
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

    setToolInfo({
      style: {
        top,
        left,
        arrowLeft,
      },
      className,
    });
  }, [selectText, wrapContainer, toolContainer]);

  return (
    <div className="note-wrap" ref={wrapContainer}>
      <div
        className="note"
        ref={noteContainer}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        // onTouchStart={handleTouchstart}
        dangerouslySetInnerHTML={snapShoot}
      />
      {/* <ToolBar values={[]} onChange={handleToolBarClick}>
        <ToolPane
          mode="test"
          icon={null}
          name="取消"
          handle={handleToolBarClick}
        />
      </ToolBar> */}
      <div className="note-tool-wrap" ref={toolWrapContainer}>
        <ul
          className={`note-tool ${toolInfo.className}`}
          ref={toolContainer}
          style={toolInfo.style}
        >
          {map(getToolBarList(), item => {
            return (
              <li key={item.type} onClick={() => handleToolBarClick(item.type)}>
                {item.icon}
                <i>{item.name}</i>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Note;
