import React, { useState, useCallback, useMemo, useRef, FC } from 'react';
import useUpdateEffect from '../hooks/useUpdateEffect';
import getSelectedInfo, {
  INoteTextHighlightInfoItem,
} from '../getSelectedInfo';
import {
  customTag as cTag,
  customAttr as cAttr,
  customRowKey,
  customSplitAttr,
  customSelectedAttr,
} from '../constants';
import useWhyDidYouUpdate from '../hooks/useWhyDidYouUpdate';
import { setCustomValue } from '../customAttrValue';
import Context, { INoteContextProps } from './context';
import ToolBar from '../components/ToolBar';
import Parse from '../Parse/index';
import './index.less';

let selectedValue: any;

export interface IModeProps {
  mode: string;
  className?: string;
}

export interface INoteTextHighlightInfo {
  list: INoteTextHighlightInfoItem[];
  text: string;
  mode?: string;
  [x: string]: any;
}

export interface INote {
  template: string;
  value?: INoteTextHighlightInfo[];
  tagName?: string;
  attrName?: string;
  splitAttrName?: string;
  onAdd: (props: INoteTextHighlightInfo) => void;
  onUpdate: (props: INoteTextHighlightInfo[]) => void;
  rowKey?: string;
  modes?: IModeProps[];
}
// 设置一个单独变量的目的是因为只能选中一个区域， 不存在选中多处区域的缘故
// let rangeRect: DOMRect;

const Note: FC<INote> = ({
  template,
  value,
  tagName = cTag,
  attrName = cAttr,
  rowKey = customRowKey,
  onAdd,
  onUpdate,
  modes,
  children,
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
  const wrapContainer = useRef<HTMLDivElement>(null);

  const handleSelectedText = useCallback(() => {
    const range: Range | undefined = window?.getSelection()?.getRangeAt(0);
    if (!range) return;

    const text = range.toString();

    const { collapsed = true, endContainer, startContainer } = range;

    const modeClassNames: any = {};
    if (modes && modes.length) {
      modes.forEach(item => {
        if (item.mode) {
          modeClassNames[item.mode] = item.className || '';
        }
      });
    }

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

    const data = {
      list,
      text: text,
    };

    selectedValue = data;

    onAdd(data);
  }, [noteContainer, modes, parse]);

  const handleClick = useCallback(
    e => {
      if (!noteContainer.current || !e.target) return;
      let node = e.target;
      const uuids = [];
      while (node) {
        const uuid = node.getAttribute(customSelectedAttr);
        if (uuid) {
          uuids.push(uuid);
          node = node.parentNode;
        } else {
          break;
        }
      }

      if (!uuids.length) return;

      const findData: INoteTextHighlightInfo[] = [];

      uuids.forEach(uuid => {
        const data = value?.find(item => item[rowKey] === uuid);
        if (data) {
          findData.push(data);
        }
      });

      onUpdate(findData);
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

  const contextValue = useMemo(() => {
    return {
      selectedValue,
      wrapContainer,
    };
  }, [selectedValue, wrapContainer]);

  const checkedChildren = useMemo(() => {
    const child = React.Children.only(children);
    // @ts-ignore
    if (child.type !== ToolBar) throw new Error('子元素只能为 ToolBar');
    return child;
  }, [children]);

  useUpdateEffect(() => {
    setSnapShoot({ __html: parse.getHTML(value) });
  }, [setSnapShoot, parse, value]);

  return (
    <Context.Provider value={contextValue}>
      <div className="note-wrap" ref={wrapContainer}>
        <div
          className="note"
          ref={noteContainer}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          dangerouslySetInnerHTML={snapShoot}
        />
        {checkedChildren}
      </div>
    </Context.Provider>
  );
};

export default Note;
