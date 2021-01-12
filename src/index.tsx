import React, { useState, useCallback, useMemo, useRef } from 'react';
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

import Parse from './Parse/index';
import './asset/font/iconfont.css';
import './index.css';

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  [x: string]: any;
}

export interface INote {
  template: string;
  value?: INoteTextHighlightInfo[];
  tagName?: string;
  attrName?: string;
  splitAttrName?: string;
  onChange: (a: any) => void;
  rowKey?: string;
}
// 设置一个单独变量的目的是因为只能选中一个区域， 不存在选中多处区域的缘故
let rangeRect: DOMRect;

const Note = ({
  template,
  value,
  // splitAttrName = customSplitAttr,
  tagName = cTag,
  attrName = cAttr,
  rowKey = customRowKey,
  onChange,
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
        setCustomValue({
          tagName,
          attrName,
          rowKey,
          splitAttrName: customSplitAttr,
          selectedAttr: customSelectedAttr,
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
          text: list.map(d => d.text).join(''),
          [rowKey]: getUUID(),
        });
      },
      {
        once: true,
      }
    );
  }, [noteContainer, parse]);

  const handleClick = useCallback(() => {
    onChange(selectText);
  }, [onChange, selectText]);

  const handleToggleTool = useCallback(() => {
    if (!toolWrapContainer.current) return;
    const display =
      toolWrapContainer.current.style.display === 'block' ? 'none' : 'block';
    toolWrapContainer.current.style.display = display;
    console.log("display", display);
    if (display === 'block') {
      requestAnimationFrame(() => {
        if (!toolWrapContainer.current) return;
        const { height } =
          toolWrapContainer.current?.parentElement?.getBoundingClientRect() || {};
        toolWrapContainer.current.style.height = height ? `${height}px` : '100%';
      });
    }
  }, [toolWrapContainer]);

  useUpdateEffect(() => {
    const list = selectText ? [selectText] : [];
    if (value) {
      value = value.map(item => {
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
    handleToggleTool();
    const wrapContainerRect = wrapContainer.current.getBoundingClientRect();
    const toolContainerRect = toolContainer.current.getBoundingClientRect();

    console.log("wrapContainerRect", wrapContainerRect);
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
        onDoubleClick={handleClick}
        ref={noteContainer}
        onMouseDown={handleMouseDown}
        dangerouslySetInnerHTML={snapShoot}
      />
      <div
        className="note-tool-wrap"
        ref={toolWrapContainer}
        onClick={handleToggleTool}
      >
        <ul className={`note-tool ${toolInfo.className}`} ref={toolContainer} style={toolInfo.style}>
          <li>
            <span className="iconfont icon-huaxian"></span>
            <i>划线</i>
          </li>
          <li>
            <span className="iconfont icon-edit"></span>
            <i>笔记</i>
          </li>
          <li>
            <span className="iconfont icon-fuzhi"></span>
            <i>复制</i>
          </li>
          <li>
            <span className="iconfont icon-quxiao"></span>
            <i>取消</i>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Note;
