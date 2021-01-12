import React, { useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import useUpdateEffect from './hooks/useUpdateEffect';
import useLayoutUpdateEffect from './hooks/useLayoutUpdateEffect';
import useSetState from './hooks/useSetState';
import getSelectedInfo, { INoteTextHighlightInfoItem } from './getSelectedInfo';
import {
  customTag as cTag,
  customAttr as cAttr,
  customRowKey,
  customSplitAttr,
  customSelectedAttr,
  marginVertical
} from './constants';
import { setCustomValue, getCustomValue } from './customAttrValue';
import { getUUID, getElementLeft, getElementTop } from './tool';
import map from 'lodash/map';
import Parse from './Parse/index';
import './asset/font/iconfont.css';
import './index.css';

interface IToolBarPaneProps {
  name: string;
  mode: string;
  className?: string;
  icon?: ReactNode;
  render?: (props: any) => ReactNode;
}

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  mode?: string,
  [x: string]: any;
}

interface IOnChangeProps {
  action: string;
  data: {
    list: INoteTextHighlightInfoItem[],
    text: string;
    [x: string]: any;
  };
  mode?: string,
}

export interface INote {
  template: string;
  value?: INoteTextHighlightInfo[];
  tagName?: string;
  attrName?: string;
  splitAttrName?: string;
  onChange: (props: IOnChangeProps) => (void | boolean | Promise<boolean | void>);
  rowKey?: string;
  toolBarList?: IToolBarPaneProps[];
  renderToolBar?: (a: any) => ReactNode;
}
// 设置一个单独变量的目的是因为只能选中一个区域， 不存在选中多处区域的缘故
let rangeRect: DOMRect;
const defaultToolBarList: IToolBarPaneProps[] = [];

const Note = ({
  template,
  value,
  // splitAttrName = customSplitAttr,
  tagName = cTag,
  attrName = cAttr,
  rowKey = customRowKey,
  toolBarList = defaultToolBarList,
  onChange,
  renderToolBar,
}: INote) => {
  const [selectText, setSelectText] = useState<INoteTextHighlightInfo | null>(
    null
  );


  const parse = useMemo(() => {
    // 用于格式化html文本
    if (template) {
      const div = document.createElement('div');
      div.innerHTML = template;
      template = div.innerHTML;
    }
    return new Parse({ template });
  }, []);

  const [snapShoot, setSnapShoot] = useState(() => {
    return { __html: parse.getHTML(value) };
  });

  const [toolInfo, setToolInfo] = useSetState(() => {
    return {
      style: { top: 0, left: 0, arrowLeft: 0 },
      visible: false,
      className: ""
    };
  });

  const wrapContainer = useRef<HTMLDivElement>(null);
  const noteContainer = useRef<HTMLDivElement>(null);
  const toolContainer = useRef<HTMLUListElement>(null);
  const toolWrapContainer = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {

    if (!noteContainer.current) return;
    document.addEventListener(
      'mouseup',
      () => {
        const range: Range | undefined = window?.getSelection()?.getRangeAt(0);
        if (!range) return;
        const { collapsed = true, endContainer, startContainer } = range;
        rangeRect = range.getBoundingClientRect();

        const modeClassNames: any = {};
        toolBarList.forEach(item => {
          modeClassNames[item.mode] = item.className || '';
        });

        setCustomValue({
          tagName,
          attrName,
          rowKey,
          splitAttrName: customSplitAttr,
          selectedAttr: customSelectedAttr,
          modeClassNames
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
      },
      {
        once: true,
      }
    );
  }, [noteContainer, toolBarList, parse]);


  const handleToggleTool = useCallback((visible) => {
    if (!toolWrapContainer.current) return;
    const display = !visible ? 'none' : 'block';
    toolWrapContainer.current.style.display = display;

    if (visible) {
      requestAnimationFrame(() => {
        if (!toolWrapContainer.current) return;
        const { height } =
          toolWrapContainer.current?.parentElement?.getBoundingClientRect() || {};
        toolWrapContainer.current.style.height = height ? `${height}px` : '100%';
      });
    }
  }, [toolWrapContainer]);

  const handleCancelTool = useCallback(
    () => {
      handleToggleTool(false);
      setSelectText(null);
    },
    [handleToggleTool, setSelectText],
  );

  const handleToolBarClick = useCallback((mode) => {

    if (!selectText?.text) return;

    const { list, text, _isTemp } = selectText;

    if (onChange && typeof onChange === 'function') {

      const data: IOnChangeProps['data'] = { list, text };

      if (!_isTemp) {
        data[rowKey] = selectText[rowKey];
      }


      const result = onChange({ data, action: _isTemp ? 'add' : 'update', mode, });

      Promise.resolve(result).then(data => {
        if (data === undefined || !!data) {
          handleCancelTool();
        }
      });
    }
  }, [toolBarList, rowKey, selectText]);


  useUpdateEffect(() => {
    const list = selectText ? [selectText] : [];
    if (value) {
      value = map(value, item => {
        if (!item || item[rowKey]) return item;
        item[rowKey] = getUUID();
        return item;
      });
      list.push(...value);
    }
    setSnapShoot({ __html: parse.getHTML(list) });
  }, [setSnapShoot, parse, value, selectText]);

  useLayoutUpdateEffect(() => {
    if (!wrapContainer.current || !toolContainer.current) return;
    const nodes = wrapContainer.current.querySelectorAll(
      `[${customSelectedAttr}="${selectText?.id}"]`
    );

    if (nodes.length < 1) return;
    handleToggleTool(true);
    const wrapContainerRect = wrapContainer.current.getBoundingClientRect();
    const toolContainerRect = toolContainer.current.getBoundingClientRect();

    let top: number;
    let className: string;
    let left: number;
    let arrowLeft: number;


    if (rangeRect.top > marginVertical + toolContainerRect.height) {
      className = 'up';
      top = rangeRect.top - wrapContainerRect.top - marginVertical - toolContainerRect.height;
    } else {
      className = 'down';
      top = rangeRect.bottom - wrapContainerRect.top + marginVertical;
    }

    const leftPoint = (rangeRect.left + rangeRect.right) / 2 - wrapContainerRect.left;

    if (leftPoint - toolContainerRect.width / 2 < 0) {
      left = 0;
      arrowLeft = leftPoint < 6 ? 6 : leftPoint;

    } else if (leftPoint + toolContainerRect.width / 2 > wrapContainerRect.width) {
      left = wrapContainerRect.width - toolContainerRect.width;
      arrowLeft = wrapContainerRect.left - leftPoint < 6 ? 6 : leftPoint;
    } else {
      left = (rangeRect.left + rangeRect.right) / 2 - toolContainerRect.width / 2 - wrapContainerRect.left;
      arrowLeft = leftPoint;
    }


    setToolInfo({
      style: {
        top,
        left,
        arrowLeft
      },
      className
    });
    console.log("rangeRect", rangeRect);

  }, [snapShoot, wrapContainer]);

  return (
    <div className="note-wrap" ref={wrapContainer}>
      <div
        className="note"
        // onDoubleClick={handleClick}
        ref={noteContainer}
        onMouseDown={handleMouseDown}
        dangerouslySetInnerHTML={snapShoot}
      />
      <div
        className="note-tool-wrap"
        ref={toolWrapContainer}
      >
        <ul className={`note-tool ${toolInfo.className}`} ref={toolContainer} style={toolInfo.style}>
          {
            map(toolBarList, item => {
              return (
                <li key={item.mode} onClick={() => handleToolBarClick(item.mode)}>
                  {item.icon}
                  <i>{item.name}</i>
                </li>
              );
            })
          }
        </ul>
      </div>
    </div>
  );
};

export default Note;
