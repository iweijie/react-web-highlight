import React, { useState, useCallback, useMemo, useRef } from 'react';
import useUpdateEffect from './hooks/useUpdateEffect';
import useLayoutUpdateEffect from './hooks/useLayoutUpdateEffect';
import getSelectedInfo, { INoteTextHighlightInfoItem } from './getSelectedInfo';
import {
  customTag as cTag,
  customAttr as cAttr,
  customRowKey,
  customSplitAttr,
  customSelectedAttr,
  defaultStyles,
} from './constants';
import { setCustomValue, getCustomValue } from './customAttrValue';
import { getUUID, getElementLeft, getElementTop } from './tool';

import Parse from './Parse/index';
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

    return new Parse({ template: template || '' });
  }, []);

  const [snapShoot, setSnapShoot] = useState(() => {
    return { __html: parse.getHTML(value) };
  });
  const noteContainer = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    if (!noteContainer.current) return;
    document.addEventListener(
      'mouseup',
      () => {
        const range: Range | undefined = window?.getSelection()?.getRangeAt(0);

        const { collapsed = true, endContainer, startContainer } = range || {};

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
    console.log('list', list);
    setSnapShoot({ __html: parse.getHTML(list) });
  }, [setSnapShoot, parse, value, selectText]);

  useLayoutUpdateEffect(() => {
    if (!noteContainer.current) return;
    const nodes = noteContainer.current.querySelectorAll(
      `[${customSelectedAttr}="${selectText?.id}"]`
    );
    console.log(nodes);
    const positionList: number[][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const left = getElementLeft(nodes[i], noteContainer.current);
      const top = getElementTop(nodes[i], noteContainer.current);
      positionList.push([top, left]);
    }
    console.log(positionList);
  }, [snapShoot, noteContainer]);

  return (
    <div>
      <div
        className="note-wrap"
        onDoubleClick={handleClick}
        ref={noteContainer}
        onMouseDown={handleMouseDown}
        dangerouslySetInnerHTML={snapShoot}
      />
      <div className="note-tool-wrap">
        <ul className="note-tool">
          <li>笔记</li>
          <li>划线</li>
          <li>复制</li>
          <li>取消</li>
        </ul>
      </div>
    </div>
  );
};

export default Note;
