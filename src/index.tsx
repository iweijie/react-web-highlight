import React, { useState, useCallback, useMemo, useRef } from 'react';
import useUpdateEffect from './hooks/useUpdateEffect';
import getSelectedInfo, {
  INoteTextHighlightInfoItem,
} from './utils/getSelectedInfo';
import { customTag as cTag, customAttr as cAttr } from './utils/constants';
import getUUID from './utils/getUUID';

import Parse from './utils/Parse/index';
// import styles from './index.less';

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  [x: string]: any;
}

export interface INote {
  template: string;
  value?: INoteTextHighlightInfo[];
  customTag?: string;
  customAttr?: string;
  onChange: (a: any) => void;
  rowKey?: string;
}

const Note = ({
  template,
  value,
  customTag = cTag,
  customAttr = cAttr,
  rowKey = 'id',
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

    return new Parse({ template: template || '', customAttr, customTag });
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
    setSnapShoot({ __html: parse.getHTML(list) });
  }, [setSnapShoot, parse, value, selectText]);

  return (
    <div
      onClick={handleClick}
      ref={noteContainer}
      onMouseDown={handleMouseDown}
      dangerouslySetInnerHTML={snapShoot}
    />
  );
};

export default Note;
