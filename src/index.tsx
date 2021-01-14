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
import { setCustomValue } from './customAttrValue';
import map from 'lodash/map';
import Parse from './Parse/index';
import './index.less';

interface IModeProps {
  mode: string;
  className?: string;
}

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  mode?: string;
  [x: string]: any;
}

interface IOnChangeProps {
  action: 'add' | 'update';
  payload: {
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
  modes: IModeProps[];
}
// 设置一个单独变量的目的是因为只能选中一个区域， 不存在选中多处区域的缘故
// let rangeRect: DOMRect;

const Note: FC<INote> = ({
  template,
  value,
  tagName = cTag,
  attrName = cAttr,
  rowKey = customRowKey,
  onChange,
  modes
}) => {

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

  const noteContainer = useRef<HTMLDivElement>(null);

  const handleSelectedText = useCallback(() => {
    const range: Range | undefined = window?.getSelection()?.getRangeAt(0);
    if (!range) return;

    const { collapsed = true, endContainer, startContainer } = range;
    // rangeRect = range.getBoundingClientRect();

    const modeClassNames: any = {};
    modes.forEach(item => {
      modeClassNames[item.mode] = item.className || '';
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

    onChange({
      action: 'add',
      payload: {
        list,
        text: map(list, d => d.text).join(''),
      },
    });
  }, [noteContainer, modes, parse]);


  const handleClick = useCallback(
    e => {
      if (!noteContainer.current || !e.target) return;

      const uuid = e.target.getAttribute(customSelectedAttr);
      if (!uuid) return;

      const findData = value?.find(item => item[rowKey] === uuid);

      if (!findData) return;

      onChange({
        action: 'update',
        payload: findData,
      });
    },
    [noteContainer, value]
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
    [noteContainer]
  );

  useUpdateEffect(() => {
    setSnapShoot({ __html: parse.getHTML(value) });
  }, [setSnapShoot, parse, value]);

  return (
    <div
      className="note"
      ref={noteContainer}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      dangerouslySetInnerHTML={snapShoot}
    />
  );
};

export default Note;
