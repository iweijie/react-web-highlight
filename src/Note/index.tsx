import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  FC,
  useEffect,
} from 'react';
import useUpdateEffect from '../hooks/useUpdateEffect';
import getSelectedInfo from '../getSelectedInfo';
import {
  customTag as cTag,
  customAttr as cAttr,
  customRowKey,
  customSplitAttr,
  customSelectedAttr,
} from '../constants';
import { setCustomValue } from '../customAttrValue';
import Context from './context';
import { INote, INoteTextHighlightInfo } from './type';
import Parse from '../Parse/index';
import './index.less';

const Note: FC<INote> = ({
  template,
  value,
  tagName = cTag,
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
    return { __html: '' };
  });

  const selectedValue = useRef<INoteTextHighlightInfo | null>(null);
  const action = useRef<string>('');
  const noteContainer = useRef<HTMLDivElement>(null);
  const wrapContainer = useRef<HTMLDivElement>(null);

  const handleSelectedText = useCallback(() => {
    const range: Range | undefined = window?.getSelection()?.getRangeAt(0);
    if (!range) return;

    const text = range.toString();

    const { collapsed = true, endContainer, startContainer } = range;

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

    action.current = 'add';
    selectedValue.current = data;

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

      action.current = 'update';
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
      action,
    };
  }, [selectedValue, action, wrapContainer]);

  useEffect(() => {
    // TODO 不造是否有更好的设置值的方式，后续如果有再修改
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
      attrName: cAttr,
      rowKey,
      splitAttrName: customSplitAttr,
      selectedAttr: customSelectedAttr,
      modeClassNames,
    });

    setSnapShoot({ __html: parse.getHTML(value) });
  }, [setSnapShoot, parse, value, modes]);

  return (
    <Context.Provider value={contextValue}>
      <div className="text-highlight-wrap" ref={wrapContainer}>
        <div
          className="text-highlight"
          id="text-highlight"
          ref={noteContainer}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          dangerouslySetInnerHTML={snapShoot}
        />
        {children}
      </div>
    </Context.Provider>
  );
};

export default Note;
