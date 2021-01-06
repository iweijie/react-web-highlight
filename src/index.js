import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';

import useUpdateEffect from './hooks/useUpdateEffect';
import getSelectedInfo from './utils/getSelectedInfo';
import Parse from './utils/Parse/index';
import styles from './index.less';

const Note = ({ template, value, onChange }) => {
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
  const noteContainer = useRef();

  const handleMouseDown = useCallback(
    e => {
      if (!noteContainer.current) return;
      document.addEventListener(
        'mouseup',
        event => {
          const range = window.getSelection().getRangeAt(0);

          const { collapsed, endContainer, startContainer } = range;

          // 返回条件 1. 光标起始点相同（即没有选中文本），2. 起点或者终点不在当前容器内
          if (
            collapsed ||
            !noteContainer.current.contains(startContainer) ||
            !noteContainer.current.contains(endContainer)
          )
            return;

          const list = getSelectedInfo({
            range,
            noteContainer: noteContainer.current,
          });

          onChange && onChange(list);
        },
        {
          once: true,
        }
      );
    },
    [noteContainer, parse]
  );

  const handleClick = useCallback(() => {}, []);

  useUpdateEffect(() => {
    setSnapShoot({ __html: parse.getHTML(value) });
  }, [setSnapShoot, parse, value]);

  return (
    <div
      onClick={handleClick}
      className={styles.note}
      ref={noteContainer}
      onMouseDown={handleMouseDown}
      dangerouslySetInnerHTML={snapShoot}
    ></div>
  );
};

export default Note;
